import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { getVaccinations, VaccinationFilter } from '@/services/vaccinations/get-vaccinations';

export function useVaccinations(filter: VaccinationFilter = 'all') {
  const [sendingReminders, setSendingReminders] = useState<string[]>([]);
  const [completingVaccinations, setCompletingVaccinations] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['vaccinations', filter],
    queryFn: ({ signal }) => getVaccinations(filter, signal),
  });
  const vaccinations = query.data ?? [];

  useEffect(() => {
    // Preserve the existing daily cleanup, without recreating it for each filter.
    const interval = setInterval(async () => {
      const { error } = await supabase.from('vaccinations').delete()
        .lt('scheduled_date', format(addDays(new Date(), -2), 'yyyy-MM-dd'))
        .eq('completed', false);
      if (error) console.error('Error cleaning up missed vaccinations:', error);
      else await queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
    }, 86_400_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Function to mark a vaccination as completed
  const markCompleted = async (id: string) => {
    setCompletingVaccinations(prev => [...prev, id]);
    
    try {
      const { error } = await supabase
        .from('vaccinations')
        .update({ completed: true })
        .eq('id', id).select('id').single();
      
      if (error) throw error;
      
      toast({
        title: "Vaccination completed",
        description: "The vaccination has been marked as administered.",
      });
      
      // Refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vaccinations'] }),
        queryClient.invalidateQueries({ queryKey: ['animal-details'] }),
      ]);
      
    } catch (err) {
      console.error('Error marking vaccination as completed:', err);
      toast({
        title: 'Error',
        description: 'Failed to update vaccination status.',
        variant: 'destructive',
      });
    } finally {
      setCompletingVaccinations(prev => prev.filter(vaccId => vaccId !== id));
    }
  };

  const sendReminder = async (id: string) => {
    setSendingReminders(prev => [...prev, id]);
    
    try {
      // Find the vaccination in our state
      const vaccination = vaccinations.find(v => v.id === id);
      
      if (!vaccination) {
        throw new Error('Vaccination not found');
      }

      // Format phone number for WhatsApp
      const phoneNumber = formatPhoneForWhatsApp(vaccination.ownerPhone);
      
      // Format the date for display
      const formattedDate = format(new Date(vaccination.date), 'dd.MM.yyyy');
      
      // Create Turkish message with the exact format requested by the user
      const message = `Sayin ${vaccination.ownerName}, sevgili ${vaccination.animalName}'in ${vaccination.vaccineName} aşı uygulama zamanı gelmiştir (${formattedDate}). Kliniğimize bekleriz. Sağlıklı günler dileriz.`;
      
      // Open WhatsApp with the message
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

      toast({
        title: "WhatsApp opened",
        description: "Continue in WhatsApp to send the reminder message.",
      });
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast({
        title: 'Error',
        description: 'Failed to open WhatsApp. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingReminders(prev => prev.filter(reminderId => reminderId !== id));
    }
  };

  // Format phone number for WhatsApp API (remove any non-digit characters)
  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  return { 
    vaccinations,
    isLoading: query.isFetching,
    error: query.error ? 'Failed to load vaccination reminders' : null,
    sendingReminders, 
    sendReminder,
    markCompleted,
    completingVaccinations,
    refreshVaccinations: query.refetch
  };
}
