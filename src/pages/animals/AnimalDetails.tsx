import { useQueryClient } from '@tanstack/react-query';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnimalDetails } from '@/hooks/use-animal-details';
import { deleteAnimal } from '@/services/animals';
import { useToast } from '@/hooks/use-toast';

// Import our new components
import AnimalHeader from '@/components/animal-details/AnimalHeader';
import PatientInformation from '@/components/animal-details/PatientInformation';
import OwnerInformation from '@/components/animal-details/OwnerInformation';
import VaccinationsTab from '@/components/animal-details/VaccinationsTab';
import MedicalHistoryTab from '@/components/animal-details/MedicalHistoryTab';
import DocumentsTab from '@/components/animal-details/DocumentsTab';
import ErrorState from '@/components/animal-details/ErrorState';

const AnimalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { animal, owner, vaccinations, medicalHistory, documents, isLoading, error, refetch } = useAnimalDetails(id!);

  const handleDeleteAnimal = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteAnimal(id);
      queryClient.removeQueries({ queryKey: ['animal-details', id] });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['animals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
        queryClient.invalidateQueries({ queryKey: ['vaccinations'] }),
      ]);
      
      toast({
        title: 'Animal deleted',
        description: 'The patient has been successfully removed from the system.',
      });
      
      navigate('/animals/search');
    } catch (err) {
      console.error('Error deleting animal:', err);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleVaccinationScheduled = () => {
    return refetch();
  };

  if (isLoading && !animal) {
    return <div className="space-y-6" aria-busy="true" />;
  }
  
  if (error || !animal) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      <AnimalHeader 
        animal={animal}
        deleting={deleting}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleDeleteAnimal={handleDeleteAnimal}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PatientInformation animal={animal} />
        <OwnerInformation owner={owner} />
      </div>
      
      <Tabs defaultValue="vaccinations" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vaccinations" className="mt-6">
          <VaccinationsTab 
            vaccinations={vaccinations} 
            animalId={id!} 
            animalName={animal.name}
            onVaccinationScheduled={handleVaccinationScheduled}
          />
        </TabsContent>
        
        <TabsContent value="medical" className="mt-6">
          <MedicalHistoryTab 
            medicalHistory={medicalHistory} 
            vaccinations={vaccinations}
            animalId={id!}
            refetch={refetch}
          />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab documents={documents} animalId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimalDetails;
