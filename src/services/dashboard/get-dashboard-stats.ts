
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalPatients: number;
  dogs: number;
  cats: number;
  birds: number;
  recentPatients: RecentPatient[];
}

export interface RecentPatient {
  id: string;
  name: string;
  animalType: string;
  ownerName: string;
  createdAt: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Count on the server and run independent requests concurrently.
    const [dogs, cats, birds, total, recent] = await Promise.all([
      supabase.from('animals').select('id', { count: 'exact', head: true }).eq('animal_type', 'dog'),
      supabase.from('animals').select('id', { count: 'exact', head: true }).eq('animal_type', 'cat'),
      supabase.from('animals').select('id', { count: 'exact', head: true }).eq('animal_type', 'bird'),
      supabase.from('animals').select('id', { count: 'exact', head: true }),
      supabase.from('animals').select('id, name, animal_type, created_at, owners:owner_id(full_name)')
        .order('created_at', { ascending: false }).limit(4),
    ]);
    for (const result of [dogs, cats, birds, total, recent]) {
      if (result.error) throw result.error;
    }
    const recentData = recent.data;

    // Transform the data for the dashboard
    const recentPatients: RecentPatient[] = recentData.map(animal => ({
      id: animal.id,
      name: animal.name,
      animalType: animal.animal_type,
      ownerName: animal.owners?.full_name || 'Unknown Owner',
      createdAt: animal.created_at || new Date().toISOString(),
    }));

    return {
      totalPatients: total.count ?? 0,
      dogs: dogs.count ?? 0,
      cats: cats.count ?? 0,
      birds: birds.count ?? 0,
      recentPatients,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
