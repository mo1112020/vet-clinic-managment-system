const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Run the hooks with controlled state and a recorded database client, without a live database.
function loadHook(file, modules = {}) {
  let state;
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: name => name === 'react' ? {
      useState: initial => {
        if (state === undefined) state = initial;
        return [state, value => { state = value; }];
      },
    } : modules[name],
  });
  return exports;
}

test('local pagination covers every item and clamps after completion/deletion', () => {
  const { useListPagination } = loadHook('src/hooks/use-list-pagination.ts');
  const records = Array.from({ length: 23 }, (_, i) => i);
  let result = useListPagination(records);
  assert.equal(result.items.length, 10);
  result.onPageChange(3);
  result = useListPagination(records);
  assert.equal(result.items.join(','), '20,21,22');
  result = useListPagination(records.slice(0, 10));
  assert.equal(result.page, 1);
  assert.equal(result.items.length, 10);
  result = useListPagination([]);
  assert.equal(result.page, 1);
  assert.equal(result.items.length, 0);
});

test('filter changes reset pagination, including returning to an earlier filter', () => {
  const { useListPagination } = loadHook('src/hooks/use-list-pagination.ts');
  const records = Array.from({ length: 40 }, (_, i) => i);
  useListPagination(records, 'cats').onPageChange(3);
  assert.equal(useListPagination(records, 'cats').page, 3);
  assert.equal(useListPagination(records, 'dogs').page, 1);
  assert.equal(useListPagination(records, 'cats').page, 1);
});

test('animal queries use bounded stable pages, server filters, totals and cancellation', async () => {
  let config;
  const calls = [];
  const client = {
    from(table) {
      const query = { then: resolve => resolve({ data: [], count: 45, error: null }) };
      for (const method of ['select', 'eq', 'ilike', 'or', 'order', 'range', 'abortSignal']) {
        query[method] = (...args) => { calls.push([table, method, ...args]); return query; };
      }
      return query;
    },
  };
  const { useAnimals } = loadHook('src/hooks/use-animals.tsx', {
    '@tanstack/react-query': {
      keepPreviousData: data => data,
      useQuery: options => { config = options; return { isFetching: false }; },
    },
    '@/integrations/supabase/client': { supabase: client },
  });
  const signal = new AbortController().signal;
  useAnimals('cat').setPage(2);
  useAnimals('cat');
  const result = await config.queryFn({ signal });
  assert.equal(result.total, 45);
  assert.equal(result.page, 2);
  assert.ok(calls.some(c => c[1] === 'range' && c[2] === 20 && c[3] === 39));
  assert.ok(calls.some(c => c[1] === 'eq' && c[2] === 'animal_type' && c[3] === 'cat'));
  assert.equal(calls.filter(c => c[1] === 'order').map(c => c[2]).join(','), 'name,id');
  assert.ok(calls.some(c => c[1] === 'abortSignal' && c[2] === signal));
  calls.length = 0;
  useAnimals('dog', 'Jane', 'owner');
  await config.queryFn({ signal });
  assert.ok(calls.some(c => c[1] === 'select' && c[2].includes('owners!inner')));
  assert.ok(calls.some(c => c[1] === 'ilike' && c[2] === 'owners.full_name'));
  assert.ok(calls.some(c => c[1] === 'range' && c[2] === 0 && c[3] === 19));
  calls.length = 0;
  useAnimals('cat', 'Milo', 'registry');
  await config.queryFn({ signal });
  assert.ok(calls.some(c => c[0] === 'owners' && c[1] === 'ilike'));
  assert.ok(calls.some(c => c[1] === 'or' && c[2].includes('breed.ilike.') && c[2].includes('chip_number.ilike.')));
});
