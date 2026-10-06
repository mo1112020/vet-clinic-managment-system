
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, X, Save } from 'lucide-react';
import { ListPagination } from '@/components/ui/list-pagination';
import { useListPagination } from '@/hooks/use-list-pagination';
import { format } from 'date-fns';
import { MedicalRecord, Vaccination } from '@/types/database.types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateMedicalRecord } from '@/services/medical-records/update-medical-record';

interface MedicalHistoryTabProps {
  medicalHistory: MedicalRecord[];
  vaccinations?: Vaccination[];
  animalId?: string;
  refetch?: () => void;
}

const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({ medicalHistory, vaccinations = [], animalId, refetch }) => {
  const completedVaccinations = vaccinations
    .filter(vaccination => vaccination.completed || vaccination.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = (entry: MedicalRecord) => {
    setEditingId(entry.id);
    setEditedNotes(entry.notes);
    setEditedDescription(entry.description);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedNotes('');
    setEditedDescription('');
  };

  const handleSave = async (entryId: string) => {
    if (!entryId) {
      toast({
        title: 'Update failed',
        description: 'Invalid record ID.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await updateMedicalRecord(
        entryId, 
        editedNotes,
        editedDescription
      );
      
      if (error) throw error;
      
      toast({
        title: 'Record updated',
        description: 'Medical record has been updated successfully.',
      });
      
      if (refetch) {
        refetch();
      }
      
      setEditingId(null);
    } catch (error) {
      console.error('Error updating medical record:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update medical record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const vaccinationPages = useListPagination(completedVaccinations);
  const historyPages = useListPagination(medicalHistory);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
        <CardDescription>Past conditions, treatments, visits, and completed vaccinations</CardDescription>
      </CardHeader>
      <CardContent>
        {completedVaccinations.length > 0 && (
          <section className="space-y-4 mb-6" aria-labelledby="completed-vaccinations-heading">
            <h3 id="completed-vaccinations-heading" className="font-semibold">Completed Vaccinations</h3>
            {vaccinationPages.items.map(vaccination => (
              <div key={vaccination.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <p className="font-medium">{vaccination.name}</p>
                  <Badge variant="secondary" className="w-fit">Completed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Scheduled for {format(new Date(vaccination.date), 'MMMM d, yyyy')}
                </p>
              </div>
            ))}
            <ListPagination {...vaccinationPages} />
          </section>
        )}
        {medicalHistory.length === 0 && completedVaccinations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No medical history found for this animal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyPages.items.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  {editingId === entry.id ? (
                    <Input 
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="font-medium"
                    />
                  ) : (
                    <p className="font-medium">{entry.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {entry.date ? format(new Date(entry.date), 'MMMM d, yyyy') : 'No date'}
                    </p>
                    {editingId !== entry.id && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {editingId === entry.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Enter medical notes..."
                      className="w-full"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleSave(entry.id)}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <ListPagination {...historyPages} />
      </CardContent>
    </Card>
  );
};

export default MedicalHistoryTab;
