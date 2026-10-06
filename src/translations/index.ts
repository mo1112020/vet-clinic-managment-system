
import { Language } from '@/contexts/LanguageContext';

type TranslationsType = {
  [key: string]: {
    en: string;
    tr: string;
  };
};

// Common translations used across the application
export const translations: TranslationsType = {
  // Dashboard related translations
  dashboard: { en: 'Dashboard', tr: 'Panel' },
  newPatient: { en: 'New Patient', tr: 'Yeni Hasta' },
  searchRecords: { en: 'Search Records', tr: 'Kayıt Arama' },
  dogs: { en: 'Dogs', tr: 'Köpekler' },
  cats: { en: 'Cats', tr: 'Kediler' },
  birds: { en: 'Birds', tr: 'Kuşlar' },
  completed: { en: 'Completed', tr: 'Tamamlanan' },
  vaccinations: { en: 'Vaccinations', tr: 'Aşılar' },
  inventory: { en: 'Inventory', tr: 'Envanter' },
  records: { en: 'Records', tr: 'Kayıtlar' },
  medicalHistory: { en: 'Medical History', tr: 'Medikal Geçmiş' },
  logout: { en: 'Logout', tr: 'Çıkış' },
  search: { en: 'Search', tr: 'Arama' },
  
  // Medical History page
  medicalRecords: { en: 'Medical Records', tr: 'Medikal Kayıtlar' },
  patient: { en: 'Patient', tr: 'Hasta' },
  owner: { en: 'Owner', tr: 'Sahip' },
  date: { en: 'Date', tr: 'Tarih' },
  procedure: { en: 'Procedure', tr: 'Prosedür' },
  details: { en: 'Details', tr: 'Detaylar' },
  veterinarian: { en: 'Veterinarian', tr: 'Veteriner' },
  patientDetails: { en: 'Patient Details', tr: 'Hasta Detayları' },
  
  // Vaccination page
  sendReminder: { en: 'Send Reminder', tr: 'Hatırlatma Gönder' },
  whatsappReminder: { en: 'WhatsApp Reminder', tr: 'WhatsApp Hatırlatma' },
  today: { en: 'Today', tr: 'Bugün' },
  upcoming: { en: 'Upcoming', tr: 'Yaklaşan' },
  overdue: { en: 'Overdue', tr: 'Gecikmiş' },
  all: { en: 'All', tr: 'Tümü' },
  opening: { en: 'Opening...', tr: 'Açılıyor...' },
  
  // Additional translations for Medical History page
  viewAndSearchRecords: { en: 'View and search medical records', tr: 'Medikal kayıtları görüntüle ve ara' },
  searchPlaceholder: { en: 'Search by patient name, owner...', tr: 'Hasta adı, sahip bilgisi ile ara...' },
  loadingRecords: { en: 'Loading records...', tr: 'Kayıtlar yükleniyor...' },
  noRecordsFound: { en: 'No medical records found', tr: 'Medikal kayıt bulunamadı' },
  
  // Dashboard page
  manageClinicOperations: { en: 'Manage your veterinary clinic operations.', tr: 'Veteriner kliniği operasyonlarınızı yönetin.' },
  totalPatients: { en: 'Total Patients', tr: 'Toplam Hasta' },
  addNewPatient: { en: 'Add New Patient', tr: 'Yeni Hasta Ekle' },
  registerNewAnimal: { en: 'Register a new animal', tr: 'Yeni hayvan kaydı' },
  upcomingVaccinations: { en: 'Upcoming Vaccinations', tr: 'Yaklaşan Aşılar' },
  viewScheduledReminders: { en: 'View scheduled reminders', tr: 'Planlanmış hatırlatıcıları görüntüle' },
  inventoryManagement: { en: 'Inventory Management', tr: 'Envanter Yönetimi' },
  checkStockLevels: { en: 'Check stock levels', tr: 'Stok seviyelerini kontrol et' },
  recentActivity: { en: 'Recent Activity', tr: 'Son Aktivite' },
  viewLatestActivity: { en: 'View latest clinic activity', tr: 'En son klinik aktivitelerini görüntüle' },
  quickActions: { en: 'Quick Actions', tr: 'Hızlı İşlemler' },
  recentPatients: { en: 'Recent Patients', tr: 'Son Hastalar' },
  latestVisits: { en: 'Latest Visits', tr: 'Son Ziyaretler' },
  noRecentPatients: { en: 'No recent patients found', tr: 'Son hasta bulunamadı' },
  loadingDashboard: { en: 'Loading dashboard data...', tr: 'Panel verileri yükleniyor...' },
  errorLoadingDashboard: { en: 'Error Loading Dashboard', tr: 'Panel Yüklenirken Hata' },
  failedToLoad: { en: 'Failed to load dashboard data', tr: 'Panel verileri yüklenemedi' },
};
