
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type AnimalDetailsRow = Tables<'animals'> & {
  owners: Tables<'owners'> | null;
  last_visit?: string;
  next_appointment?: string;
};

export async function getAnimalById(id: string, signal?: AbortSignal) {
  let query = supabase
    .from('animals')
    .select(`
      *,
      owners(*)
    `)
    .eq('id', id);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching animal:', error);
    throw new Error(`Error fetching animal: ${error.message}`);
  }

  return {
    ...(data as AnimalDetailsRow),
    owner: data.owners,
    age_years: data.age_years ?? undefined,
    age_months: data.age_months ?? undefined,
  };
}
