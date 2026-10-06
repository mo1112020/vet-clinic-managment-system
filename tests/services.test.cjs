const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadService(file, mocks) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, {
    exports, console: { error() {}, log() {} },
    require: name => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  });
  return exports;
}

function database(respond) {
  const calls = [];
  return {
    calls,
    from(table) {
      const request = { table, operations: [] };
      calls.push(request);
      const chain = { then: (resolve, reject) => Promise.resolve(respond(request)).then(resolve, reject) };
      for (const method of ['select', 'eq', 'neq', 'gt', 'lt', 'order', 'limit', 'abortSignal', 'single', 'maybeSingle', 'insert', 'update', 'delete']) {
        chain[method] = (...args) => { request.operations.push([method, ...args]); return chain; };
      }
      return chain;
    },
  };
}
const operation = (request, name) => request.operations.find(op => op[0] === name);

test('dashboard requests counts concurrently and supports more than 1,000 patients', async () => {
  const pending = [];
  const db = database(request => new Promise(resolve => pending.push({ request, resolve })));
  const { getDashboardStats } = loadService('src/services/dashboard/get-dashboard-stats.ts', {
    '@/integrations/supabase/client': { supabase: db },
  });
  const resultPromise = getDashboardStats();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(pending.length, 5, 'all five queries must start before any completes');
  for (const { request, resolve } of pending) {
    const select = operation(request, 'select');
    if (select[2]?.head) resolve({ count: 1501, data: null, error: null });
    else resolve({ data: [{ id: 'a', name: 'Milo', animal_type: 'cat', created_at: '2026-01-01', owners: null }], error: null });
  }
  const result = await resultPromise;
  assert.equal(result.dogs, 1501);
  assert.equal(result.cats, 1501);
  assert.equal(result.birds, 1501);
  assert.equal(result.totalPatients, 1501);
  assert.equal(result.recentPatients[0].ownerName, 'Unknown Owner');
});

for (const filter of ['today', 'upcoming', 'overdue', 'completed', 'all']) {
  test(`vaccination ${filter} filter and nullable relationships`, async () => {
    const db = database(() => ({ data: [{ id: 'uuid', scheduled_date: '2026-01-01', vaccine_name: 'Rabies', completed: true, animals: null }], error: null }));
    const { getVaccinations } = loadService('src/services/vaccinations/get-vaccinations.ts', {
      '@/integrations/supabase/client': { supabase: db },
    });
    const signal = new AbortController().signal;
    const result = await getVaccinations(filter, signal);
    const completed = db.calls[0].operations.find(op => op[0] === 'eq' && op[1] === 'completed');
    assert.equal(completed?.[2], filter === 'all' ? undefined : filter === 'completed');
    assert.equal(operation(db.calls[0], 'abortSignal')[1], signal);
    assert.equal(result[0].id, 'uuid');
    assert.equal(result[0].animalName, 'Unknown');
    assert.equal(result[0].ownerPhone, '');
    if (filter === 'today') assert.ok(db.calls[0].operations.some(op => op[0] === 'eq' && op[1] === 'scheduled_date'));
    if (filter === 'upcoming') assert.ok(operation(db.calls[0], 'gt') && operation(db.calls[0], 'lt'));
    if (filter === 'overdue') assert.ok(operation(db.calls[0], 'lt'));
  });
}

test('reading an animal preserves zero years and zero months', async () => {
  const db = database(() => ({ data: { id: 'a', age_years: 0, age_months: 0, owners: null }, error: null }));
  const { getAnimalById } = loadService('src/services/animals/get-animal.ts', {
    '@/integrations/supabase/client': { supabase: db },
  });
  const result = await getAnimalById('a');
  assert.equal(result.age_years, 0);
  assert.equal(result.age_months, 0);
});

for (const action of ['create', 'update']) {
  test(`${action} animal persists zero ages`, async () => {
    const db = database(request => {
      const payload = operation(request, action === 'create' ? 'insert' : 'update')[1];
      return { data: { ...payload, id: 'a', age_years: payload.age_years, age_months: payload.age_months }, error: null };
    });
    const module = loadService(`src/services/animals/${action}-animal.ts`, {
      '@/integrations/supabase/client': { supabase: db },
      '../owners/owner-service': { getOrCreateOwner: async () => 'owner' },
    });
    const input = { name: 'Milo', animalType: 'cat', ageYears: 0, ageMonths: 0 };
    const result = action === 'create' ? await module.createAnimal(input) : await module.updateAnimal('a', input);
    assert.equal(result.ageYears, 0);
    assert.equal(result.ageMonths, 0);
  });
}

test('animal deletion stops when a related-record deletion fails', async () => {
  const failure = { message: 'Permission denied' };
  const db = database(request => request.table === 'vaccinations'
    ? { error: failure } : { data: { id: 'a' }, error: null });
  const { deleteAnimal } = loadService('src/services/animals/delete-animal.ts', {
    '@/integrations/supabase/client': { supabase: db },
  });
  await assert.rejects(deleteAnimal('a'), error => error === failure);
  assert.equal(db.calls.length, 2);
  assert.equal(db.calls.filter(request => request.table === 'animals' && operation(request, 'delete')).length, 0);
});

test('medical record updates allow clearing a description and verify the saved row', async () => {
  const db = database(() => ({ data: { id: 'record' }, error: null }));
  const { updateMedicalRecord } = loadService('src/services/medical-records/update-medical-record.ts', {
    '@/integrations/supabase/client': { supabase: db },
  });
  const result = await updateMedicalRecord('record', 'notes', '');
  assert.equal(result.error, null);
  assert.equal(operation(db.calls[0], 'update')[1].description, '');
  assert.ok(operation(db.calls[0], 'single'));
});
