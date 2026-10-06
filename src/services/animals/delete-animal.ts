
import { supabase } from '@/integrations/supabase/client';

export async function deleteAnimal(id: string): Promise<{ success: boolean }> {
  try {
    // First check if the animal exists
    const { data: animalData, error: animalCheckError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', id)
      .single();

    if (animalCheckError || !animalData) {
      console.error('Error checking animal:', animalCheckError?.message || 'Animal not found');
      throw new Error(`Animal not found or error checking: ${animalCheckError?.message || 'Not found'}`);
    }

    // First delete any related records in vaccinations table
    const { error: vaccinationsError } = await supabase
      .from('vaccinations')
      .delete()
      .eq('animal_id', id);

    if (vaccinationsError) throw vaccinationsError;

    // Then delete any related records in medical_records table
    const { error: medicalRecordsError } = await supabase
      .from('medical_records')
      .delete()
      .eq('animal_id', id);

    if (medicalRecordsError) throw medicalRecordsError;

    // Then delete any related records in medical_files table
    const { error: medicalFilesError } = await supabase
      .from('medical_files')
      .delete()
      .eq('animal_id', id);

    if (medicalFilesError) throw medicalFilesError;

    // Finally delete the animal record
    const { error: animalError } = await supabase
      .from('animals')
      .delete()
      .eq('id', id).select('id').single();

    if (animalError) {
      throw new Error(`Error deleting animal: ${animalError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Delete operation failed:', error);
    throw error;
  }
}
