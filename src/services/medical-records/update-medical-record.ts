
import { supabase } from '@/integrations/supabase/client';

export const updateMedicalRecord = async (
  recordId: string, 
  notes: string,
  description?: string
) => {
  try {
    // Validate recordId
    if (!recordId || typeof recordId !== 'string' || recordId.trim().length === 0) {
      throw new Error('Invalid medical record ID format');
    }

    // Create the update payload
    const updatePayload: { notes: string; description?: string } = { notes };
    
    // Only add description if it's provided
    if (description !== undefined) {
      updatePayload.description = description;
    }
    
    const { data, error } = await supabase
      .from('medical_records')
      .update(updatePayload)
      .eq('id', recordId)
      .select().single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating medical record:', error);
    return { data: null, error };
  }
};
