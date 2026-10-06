import { useQueryClient } from '@tanstack/react-query';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar, Syringe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { scheduleVaccination } from '@/services/vaccinations/schedule-vaccination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfDay } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type ScheduleVaccinationDialogProps = {
  animalId: string;
  animalName: string;
  onVaccinationScheduled?: () => void;
};

export function ScheduleVaccinationDialog({
  animalId,
  animalName,
  onVaccinationScheduled
}: ScheduleVaccinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSchedule = async (e?: React.MouseEvent) => {
    
    if (e) {
      e.preventDefault();
    }
    
    if (!vaccineName || !scheduledDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await scheduleVaccination({
        animalId,
        vaccineName,
        scheduledDate,
      });
      await queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      
      toast({
        title: 'Vaccination scheduled',
        description: `${vaccineName} has been scheduled for ${animalName}.`,
      });
      
      setOpen(false);
      setVaccineName('');
      setScheduledDate(undefined);
      
      if (onVaccinationScheduled) {
        onVaccinationScheduled();
      }
      
    } catch (err) {
      console.error('Error scheduling vaccination:', err);
      toast({
        title: 'Error',
        description: 'Failed to schedule vaccination. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">
          <Syringe className="mr-2 h-4 w-4" />
          Schedule Vaccination
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Vaccination</DialogTitle>
          <DialogDescription>
            Schedule a new vaccination for {animalName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSchedule();
        }} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine-name">Vaccine Name</Label>
            <Input 
              id="vaccine-name" 
              placeholder="Enter vaccine name" 
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button" // Prevent form submission
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 20}
                  defaultMonth={scheduledDate}
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={{ before: startOfDay(new Date()) }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Vaccination'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
