import { format, isPast, isToday, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { AnimalType } from '@/types/database.types';

export type VaccinationFilter = 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
export interface VaccinationReminderItem {
  id: string;
  animalName: string;
  animalType: AnimalType;
  ownerName: string;
  ownerPhone: string;
  vaccineName: string;
  date: string;
  nextDue: string;
  status: 'today' | 'upcoming' | 'overdue';
  completed: boolean;
}

export async function getVaccinations(filter: VaccinationFilter, signal?: AbortSignal): Promise<VaccinationReminderItem[]> {
  let query = supabase.from('vaccinations').select(`
    id, vaccine_name, scheduled_date, completed,
    animals(name, animal_type, owners(full_name, phone_number))
  `);
  const today = format(new Date(), 'yyyy-MM-dd');
  if (filter === 'today') query = query.eq('scheduled_date', today);
  else if (filter === 'upcoming') query = query.gt('scheduled_date', today).lt('scheduled_date', format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  else if (filter === 'overdue') query = query.lt('scheduled_date', today);
  if (filter !== 'all') query = query.eq('completed', filter === 'completed');
  query = query.order('scheduled_date', { ascending: true }).order('id', { ascending: true });
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(item => {
    const date = new Date(item.scheduled_date);
    return {
      id: item.id, animalName: item.animals?.name || 'Unknown',
      animalType: (item.animals?.animal_type || 'other') as AnimalType,
      ownerName: item.animals?.owners?.full_name || 'Unknown',
      ownerPhone: item.animals?.owners?.phone_number || '',
      vaccineName: item.vaccine_name, date: item.scheduled_date, nextDue: item.scheduled_date,
      status: isToday(date) ? 'today' : isPast(date) ? 'overdue' : 'upcoming',
      completed: item.completed === true,
    };
  });
}
