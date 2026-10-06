import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Animal, AnimalType } from '@/types/database.types';

export function useAnimals(type?: AnimalType, searchQuery = '', searchBy = 'name') {
  const pageSize = 20;
  const term = searchQuery.trim();
  const filterKey = JSON.stringify([type, term, searchBy]);
  const [selection, setSelection] = useState({ key: filterKey, page: 1 });
  if (selection.key !== filterKey) setSelection({ key: filterKey, page: 1 });
  const page = selection.key === filterKey ? selection.page : 1;
  const result = useQuery({
    queryKey: ['animals', type, term, searchBy, page],
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      // Use an inner join only when filtering on owner, so other lists retain animals without owners.
      let query = supabase.from('animals').select(
        searchBy === 'owner' && term
          ? '*, owners!inner(id, full_name, phone_number, id_number)'
          : '*, owners(id, full_name, phone_number, id_number)',
        { count: 'exact' }
      );
      if (type) query = query.eq('animal_type', type);
      if (term) {
        if (searchBy === 'owner') query = query.ilike('owners.full_name', `%${term}%`);
        else if (searchBy === 'chip') query = query.ilike('chip_number', `%${term}%`);
        else if (searchBy === 'registry') {
          const { data: owners, error } = await supabase.from('owners').select('id').ilike('full_name', `%${term}%`).abortSignal(signal);
          if (error) throw error;
          const pattern = `"%${term.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}%"`;
          query = query.or(`name.ilike.${pattern},breed.ilike.${pattern},chip_number.ilike.${pattern}${owners.length ? `,owner_id.in.(${owners.map(owner => owner.id).join(',')})` : ''}`);
        } else query = query.ilike('name', `%${term}%`);
      }
      const { data, count, error } = await query.order('name').order('id')
        .range((page - 1) * pageSize, page * pageSize - 1).abortSignal(signal);
      if (error) throw error;
      const animals: Animal[] = data.map(animal => ({
        id: animal.id, name: animal.name, type: animal.animal_type as AnimalType,
        breed: animal.breed || '', chipNo: animal.chip_number || '',
        healthNotes: animal.health_notes || '', owner_id: animal.owner_id,
        created_at: animal.created_at, last_visit: animal.updated_at || animal.created_at,
        owner: animal.owners ? {
          id: animal.owners.id, name: animal.owners.full_name,
          phone: animal.owners.phone_number, id_number: animal.owners.id_number,
        } : null,
      }));
      return { animals, total: count ?? 0, page };
    },
  });
  if (result.data && !result.isPlaceholderData && result.data.page === page) {
    const lastPage = Math.max(1, Math.ceil(result.data.total / pageSize));
    if (page > lastPage) setSelection({ key: filterKey, page: lastPage });
  }
  return {
    animals: result.data?.animals ?? [], total: result.data?.total ?? 0,
    page: result.data?.page ?? page, pageSize,
    setPage: (page: number) => setSelection({ key: filterKey, page }),
    isLoading: result.isFetching, hasData: !!result.data,
    error: result.error?.message ?? null, refetch: result.refetch,
  };
}
