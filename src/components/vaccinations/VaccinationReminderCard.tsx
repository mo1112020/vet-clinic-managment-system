import { format } from 'date-fns';
import { MessageCircle, Loader2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { VaccinationStatusBadge } from './VaccinationStatusBadge';
import { VaccinationAnimalIcon } from './VaccinationAnimalIcon';
import { AnimalType } from '@/types/database.types';
import { useLanguage } from '@/contexts/LanguageContext';

import { VaccinationReminderItem } from '@/services/vaccinations/get-vaccinations';
export type { VaccinationReminderItem } from '@/services/vaccinations/get-vaccinations';

interface VaccinationReminderCardProps {
  reminder: VaccinationReminderItem;
  index: number;
  isSending: boolean;
  onSendReminder: (id: string) => void;
  onMarkCompleted?: (id: string) => Promise<void>;
  isCompletingVaccination?: boolean;
}

export const VaccinationReminderCard = ({ 
  reminder, 
  index, 
  isSending, 
  onSendReminder,
  onMarkCompleted,
  isCompletingVaccination = false
}: VaccinationReminderCardProps) => {
  const { t, language } = useLanguage();

  const handleSendReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    onSendReminder(reminder.id);
  };

  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onMarkCompleted) {
      onMarkCompleted(reminder.id);
    }
  };

  return (
    <div
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
            <VaccinationAnimalIcon type={reminder.animalType} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{reminder.animalName}</p>
              <VaccinationStatusBadge status={reminder.completed ? 'completed' : reminder.status} />
            </div>
            <p className="text-sm text-muted-foreground">{reminder.vaccineName}</p>
          </div>
        </div>
        
        <div className="sm:text-right">
          <p className="text-sm">
            <span className="text-muted-foreground">{t('owner')}: </span>
            <span className="font-medium">{reminder.ownerName}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">{t('date')}: </span>
            <span className="font-medium">{format(new Date(reminder.date), 'MMMM d, yyyy')}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {!reminder.completed && onMarkCompleted && (
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleMarkCompleted}
              disabled={isCompletingVaccination}
            >
              {isCompletingVaccination ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  {t('completing')}...
                </div>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('markComplete')}
                </>
              )}
            </Button>
          )}
          
          <Button 
            className="btn-primary w-full sm:w-auto"
            onClick={handleSendReminder}
            disabled={isSending}
          >
            {isSending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('opening')}...
              </div>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                {t('whatsappReminder')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
