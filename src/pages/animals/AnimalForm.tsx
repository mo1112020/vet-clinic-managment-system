import { AnimalFormValues } from '@/schemas/animal-form-schema';

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useAnimalForm } from '@/hooks/use-animal-form';
import AnimalInformationForm from '@/components/animals/AnimalInformationForm';
import OwnerInformationForm from '@/components/animals/OwnerInformationForm';
import AnimalFormActions from '@/components/animals/AnimalFormActions';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

const AnimalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { form, isLoading, isSubmitting, isNewAnimal, onSubmit } = useAnimalForm(id);
  const { t } = useLanguage();

  // Form submission handler
  const handleFormSubmit = async (data: AnimalFormValues) => {
    try {
      // Call the submission handler from the hook
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveAnimal'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">{t('loadingAnimalData')}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">{isNewAnimal ? t('registerNewPatient') : t('editPatient')}</CardTitle>
        <CardDescription>
          {isNewAnimal ? t('addNewAnimal') : t('updateAnimalInfo')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <AnimalInformationForm form={form} />
            <OwnerInformationForm form={form} />
            <AnimalFormActions isSubmitting={isSubmitting} isNewAnimal={isNewAnimal} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AnimalForm;
