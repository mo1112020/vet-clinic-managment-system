
import { supabase } from '@/integrations/supabase/client';
import { Animal, AnimalType } from '@/types/database.types';
import { AnimalFormData } from './types';
import { getOrCreateOwner } from '../owners/owner-service';

export async function createAnimal(data: AnimalFormData): Promise<Animal> {
  
  try {
    // First, create or update the owner
    const ownerId = await getOrCreateOwner({
      fullName: data.ownerName,
      idNumber: data.ownerId,
      phoneNumber: data.ownerPhone
    });

    // Parse health notes to array if provided
    const proneDiseasesArray = data.healthNotes ? [data.healthNotes] : null;
    
    // Check if an animal with this chip number already exists (if chip number provided)
    if (data.chipNumber && data.chipNumber.trim() !== '') {
      const { data: existingAnimal } = await supabase
        .from('animals')
        .select('id')
        .eq('chip_number', data.chipNumber)
        .maybeSingle();
        
      if (existingAnimal) {
        throw new Error(`An animal with chip number '${data.chipNumber}' already exists. Please use a different chip number.`);
      }
    }
    
    // Then create the animal linked to the owner
    const { data: animalData, error: animalError } = await supabase
      .from('animals')
      .insert({
        name: data.name,
        animal_type: data.animalType,
        custom_animal_type: data.customAnimalType || null,
        breed: data.breed || null,
        chip_number: data.chipNumber && data.chipNumber.trim() !== '' ? data.chipNumber : null,
        prone_diseases: proneDiseasesArray,
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        age_years: data.ageYears ?? null,
        age_months: data.ageMonths ?? null,
      })
      .select()
      .single();

    if (animalError) {
      console.error('Error creating animal:', animalError);
      
      // Provide a more helpful error message for constraint violations
      if (animalError.message.includes('violates unique constraint')) {
        if (animalError.message.includes('chip_number')) {
          throw new Error(`An animal with chip number '${data.chipNumber}' already exists. Please use a different chip number.`);
        }
      }
      
      throw new Error(`Error creating animal: ${animalError.message}`);
    }

    
    // Transform the result to match the Animal type expected by the application
    const animal: Animal = {
      id: animalData.id,
      name: animalData.name,
      type: animalData.animal_type as AnimalType,
      customAnimalType: animalData.custom_animal_type || undefined,
      breed: animalData.breed || '',
      chipNo: animalData.chip_number || undefined,
      ageYears: animalData.age_years ?? undefined,
      ageMonths: animalData.age_months ?? undefined,
      healthNotes: animalData.prone_diseases ? animalData.prone_diseases.join(', ') : undefined,
      owner_id: animalData.owner_id,
      created_at: animalData.created_at,
      // Add any other required fields with default values if needed
    };
    
    return animal;
  } catch (error) {
    console.error('Animal creation failed:', error);
    throw error;
  }
}
