import { useQueryClient } from '@tanstack/react-query';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListPagination } from '@/components/ui/list-pagination';
import { useListPagination } from '@/hooks/use-list-pagination';
import { format, isPast, isToday } from 'date-fns';
import { Vaccination } from '@/types/database.types';
import { ScheduleVaccinationDialog } from './ScheduleVaccinationDialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VaccinationsTabProps {
  vaccinations: Vaccination[];
  animalId: string;
  animalName: string;
  onVaccinationScheduled?: () => void | Promise<void>;
}

const VaccinationsTab: React.FC<VaccinationsTabProps> = ({ 
  vaccinations, 
  animalId, 
  animalName,
  onVaccinationScheduled 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const pendingVaccinations = vaccinations.filter(
    vaccination => !vaccination.completed && vaccination.status !== 'completed' && !completedIds.includes(vaccination.id)
  );
  
  // this function to determine vaccination status (completed, overdue, upcoming, today)
  // it checks the vaccination status and next due date to return appropriate status

  const getVaccinationStatus = (vaccination: Vaccination) => {
    if (vaccination.status === 'completed' || vaccination.completed) return 'completed';
    
    const date = new Date(vaccination.next_due);
    if (isToday(date)) return 'today';
    if (isPast(date)) return 'overdue';
    return 'upcoming';
  };
  
  // this one Function is to mark vaccination as completed
  const markVaccinationAsCompleted = async (e: React.MouseEvent, vaccination: Vaccination) => {
    e.preventDefault();
    if (completingId) return;
    setCompletingId(vaccination.id);
    
    try {
      const { error } = await supabase
        .from('vaccinations')
        .update({ completed: true })
        .eq('id', vaccination.id)
        .select('id')
        .single();
        
      if (error) throw error;
      setCompletedIds(ids => [...ids, vaccination.id]);
      await queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      
      toast({
        title: "Vaccination completed",
        description: `${vaccination.name} is now in Medical History under Completed Vaccinations.`,
      });
      
      // if onVaccinationScheduled callback is provided, call it to refresh the data or update UI
      // this is useful to update the UI after marking a vaccination as completed
      // it can be used to refetch data or update the state in the parent component
      
      if (onVaccinationScheduled) {
        await onVaccinationScheduled();
      }
      
    } catch (err) {
      console.error('Error marking vaccination as completed:', err);
      toast({
        title: "Error",
        description: "Failed to update vaccination status.",
        variant: "destructive",
      });
    } finally {
      setCompletingId(null);
    }
  };

  const pagination = useListPagination(pendingVaccinations);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vaccination Records</CardTitle>
          <CardDescription>View and manage vaccination schedule</CardDescription>
        </div>
        <ScheduleVaccinationDialog 
          animalId={animalId} 
          animalName={animalName}
          onVaccinationScheduled={onVaccinationScheduled}
        />
      </CardHeader>
      <CardContent>
        {pendingVaccinations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pending vaccinations. Completed vaccinations are available in Medical History.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagination.items.map((vax) => (
              <div
                key={vax.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3 md:mb-0">
                  <div>
                    <Badge 
                      variant={getVaccinationStatus(vax) === 'overdue' ? 'destructive' : 'default'}
                      className="mb-2 md:mb-0"
                    >
                      {getVaccinationStatus(vax) === 'today' ? 'Due Today' : getVaccinationStatus(vax) === 'overdue' ? 'Overdue' : 'Upcoming'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">{vax.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for {format(new Date(vax.next_due), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">
                    Next due: <span className="text-primary">{format(new Date(vax.next_due), 'MMMM d, yyyy')}</span>
                  </p>
                  {!vax.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={(e) => markVaccinationAsCompleted(e, vax)}
                      disabled={completingId !== null}
                    >
                      <Check className="h-4 w-4" />
                      {completingId === vax.id ? 'Saving...' : 'Mark Completed'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <ListPagination {...pagination} />
      </CardContent>
    </Card>
  );
};

export default VaccinationsTab;
