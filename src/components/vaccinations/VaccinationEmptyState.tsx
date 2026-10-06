
import { Calendar } from 'lucide-react';

interface VaccinationEmptyStateProps {
  tabValue: string;
}

export const VaccinationEmptyState = ({ tabValue }: VaccinationEmptyStateProps) => {
  return (
    <div className="text-center py-10">
      <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-3">
        <Calendar className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{tabValue === 'completed' ? 'No completed vaccinations' : 'No reminders'}</h3>
      <p className="text-sm text-muted-foreground">
        {tabValue === 'today' ? 'No vaccinations scheduled for today.' :
         tabValue === 'upcoming' ? 'No upcoming vaccinations in the next 7 days.' :
         tabValue === 'overdue' ? 'No overdue vaccinations.' :
         tabValue === 'completed' ? 'Vaccinations marked as completed will appear here.' : 'No vaccination reminders found.'}
      </p>
    </div>
  );
};
