import { useQuery } from '@tanstack/react-query';
import { Animal, AnimalType, Owner, Vaccination, MedicalRecord, Document } from '@/types/database.types';
import { getAnimalById } from '@/services/animals';
import { supabase } from '@/integrations/supabase/client';

async function fetchAnimalDetails(animalId: string, signal: AbortSignal) {
  const [animalData, vaccinationResult, medicalResult] = await Promise.all([
    getAnimalById(animalId, signal),
    supabase.from('vaccinations').select('*').eq('animal_id', animalId).abortSignal(signal),
    supabase.from('medical_records').select('*').eq('animal_id', animalId)
      .order('date', { ascending: false }).abortSignal(signal),
  ]);
  // Do not turn database failures into apparently empty patient records.
  if (vaccinationResult.error) throw vaccinationResult.error;
  if (medicalResult.error) throw medicalResult.error;
  const animal: Animal = {
    id: animalData.id, name: animalData.name, type: animalData.animal_type as AnimalType,
    customAnimalType: animalData.custom_animal_type, breed: animalData.breed || '',
    chipNo: animalData.chip_number, ageYears: animalData.age_years,
    ageMonths: animalData.age_months,
    healthNotes: animalData.prone_diseases?.join(', ') || '',
    owner_id: animalData.owner_id, created_at: animalData.created_at,
    last_visit: animalData.last_visit, next_appointment: animalData.next_appointment,
  };
  const owner: Owner | null = animalData.owner ? {
    id: animalData.owner.id, name: animalData.owner.full_name,
    phone: animalData.owner.phone_number, email: '', id_number: animalData.owner.id_number,
  } : null;
  const vaccinations: Vaccination[] = vaccinationResult.data.map(row => ({
    id: row.id, animal_id: row.animal_id, name: row.vaccine_name,
    date: row.scheduled_date, next_due: row.scheduled_date,
    completed: row.completed === true, status: row.completed ? 'completed' : 'upcoming',
  }));
  const medicalHistory: MedicalRecord[] = medicalResult.data.map(row => ({
    id: row.id, animal_id: row.animal_id, date: row.date,
    description: row.description, notes: row.notes || '',
  }));
  const documents: Document[] = [{
    id: '1', animal_id: animalId, name: 'Initial Examination Report',
    date: new Date().toISOString(), type: 'PDF', size: '120 KB', url: '#',
  }];
  return { animal, owner, vaccinations, medicalHistory, documents };
}

export function useAnimalDetails(animalId: string) {
  const query = useQuery({
    queryKey: ['animal-details', animalId],
    queryFn: ({ signal }) => fetchAnimalDetails(animalId, signal),
    enabled: !!animalId,
    staleTime: 30_000,
  });
  return {
    animal: query.data?.animal ?? null, owner: query.data?.owner ?? null,
    vaccinations: query.data?.vaccinations ?? [], medicalHistory: query.data?.medicalHistory ?? [],
    documents: query.data?.documents ?? [], isLoading: query.isPending,
    error: query.error ? 'Failed to load animal details' : null,
    refetch: async () => { await query.refetch(); },
  };
}
