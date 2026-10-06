import { useQueryClient } from '@tanstack/react-query';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAnimalById, createAnimal, updateAnimal } from '@/services/animals';
import { animalFormSchema, AnimalFormValues, defaultAnimalFormValues } from '@/schemas/animal-form-schema';
import { AnimalType } from '@/types/database.types';
import { useLanguage } from '@/contexts/LanguageContext';

export function useAnimalForm(animalId?: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNewAnimal = !animalId;
  
  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: defaultAnimalFormValues,
    mode: 'onChange', 
  });
  
  useEffect(() => {
    const controller = new AbortController();
    if (!isNewAnimal) {
      const fetchAnimal = async () => {
        setIsLoading(true);
        try {
          const animal = await getAnimalById(animalId!, controller.signal);
          
          if (controller.signal.aborted) return;
          // Handle phone number with country code
          let phoneNumber = animal.owner?.phone_number || '';
          let countryCode = '+90'; // Default for Turkey because the app is primarily for Turkey
          
          // Try to extract country code if present
          const phoneMatch = phoneNumber.match(/^(\+\d+)\s*(.*)$/);
          if (phoneMatch) {
            countryCode = phoneMatch[1];
            phoneNumber = phoneMatch[2];
          }
          
          // Determine if this is a custom animal type
          const animalType: AnimalType = animal.animal_type as AnimalType;
          let customAnimalType = '';
          
          if (animalType === 'other' && animal.custom_animal_type) {
            customAnimalType = animal.custom_animal_type;
          }

          // Parse age information - use direct age_years and age_months from db
          const ageYears = animal.age_years;
          const ageMonths = animal.age_months;
          
          form.reset({
            animalType: animalType,
            customAnimalType: customAnimalType,
            name: animal.name,
            breed: animal.breed || '',
            chipNumber: animal.chip_number || '',
            ageYears: ageYears,
            ageMonths: ageMonths,
            ownerName: animal.owner?.full_name || '',
            ownerId: animal.owner?.id_number || '',
            ownerPhoneCountryCode: countryCode,
            ownerPhone: phoneNumber,
            healthNotes: animal.prone_diseases ? animal.prone_diseases.join(', ') : '',
          });
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error('Error fetching animal:', error);
          toast({
            title: t('error'),
            description: t('failedToLoadAnimalData'),
            variant: 'destructive',
          });
        } finally {
          if (!controller.signal.aborted) setIsLoading(false);
        }
      };
      
      fetchAnimal();
    }
    return () => controller.abort();
  }, [animalId, isNewAnimal, form, toast, t]);
  
  const onSubmit = async (data: AnimalFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Combine country code with phone number
      const fullPhoneNumber = `${data.ownerPhoneCountryCode} ${data.ownerPhone}`;
      
      const animalData = {
        animalType: data.animalType,
        customAnimalType: data.animalType === 'other' ? data.customAnimalType : undefined,
        name: data.name,
        breed: data.breed,
        chipNumber: data.chipNumber,
        // Pass the raw age values directly, not as a formatted string
        ageYears: data.ageYears,
        ageMonths: data.ageMonths,
        ownerName: data.ownerName,
        ownerId: data.ownerId,
        ownerPhone: fullPhoneNumber,
        healthNotes: data.healthNotes,
      };
      
      
      if (isNewAnimal) {
        await createAnimal(animalData);
        
        toast({
          title: t('success'),
          description: t('animalCreatedSuccessfully'),
        });
      } else {
        await updateAnimal(animalId!, animalData);
        
        toast({
          title: t('success'),
          description: t('animalUpdatedSuccessfully'),
        });
      }
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['animals'] }),
        queryClient.invalidateQueries({ queryKey: ['animal-details'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
        queryClient.invalidateQueries({ queryKey: ['vaccinations'] }),
      ]);
      // Navigate only after successful submission
      navigate('/animals/search');
    } catch (error) {
      console.error('Error saving animal:', error);
      
      // More detailed error handling
      let errorMessage = t('failedToSaveAnimal');
      
      if (error instanceof Error && error.message?.includes('chip_number')) {
        errorMessage = t('chipNumberAlreadyExists');
      }
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Don't navigate on error
      throw error; // Re-throw to be caught by the form's error handler
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isLoading,
    isSubmitting,
    isNewAnimal,
    onSubmit,
  };
}
