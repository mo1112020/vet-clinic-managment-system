
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Animal, Owner, MedicalRecord, Vaccination } from '@/types/database.types';
import { format } from 'date-fns';

export interface PdfGenerationData {
  animal: Animal;
  owner: Owner;
  vaccinations: Vaccination[];
  medicalRecords: MedicalRecord[];
  title?: string;
}

export async function generateAnimalRecordPdf(data: PdfGenerationData): Promise<string> {
  const { animal, owner, vaccinations, medicalRecords, title } = data;
  
  // Create a new PDF document
  const doc = new jsPDF() as jsPDF & { lastAutoTable?: { finalY: number } };
  
  // Add title
  const pdfTitle = title || `Medical Record - ${animal.name}`;
  doc.setFontSize(20);
  doc.text(pdfTitle, 105, 15, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 105, 22, { align: 'center' });
  
  // Add animal information
  doc.setFontSize(16);
  doc.text('Patient Information', 14, 35);
  
  doc.setFontSize(11);
  const animalInfo = [
    ['Name', animal.name],
    ['Type', animal.type],
    ['Breed', animal.breed || 'Not specified'],
    ['Chip No.', animal.chipNo || 'Not specified'],
    ['Health Notes', animal.healthNotes || 'None'],
  ];
  
  autoTable(doc, {
    startY: 38,
    head: [['Field', 'Value']],
    body: animalInfo,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
    tableWidth: 'auto',
  });
  
  // Add owner information
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(16);
  doc.text('Owner Information', 14, finalY);
  
  doc.setFontSize(11);
  const ownerInfo = [
    ['Name', owner.name],
    ['Phone', owner.phone],
    ['Email', owner.email || 'Not specified'],
    ['ID Number', owner.id_number],
  ];
  
  autoTable(doc, {
    startY: finalY + 3,
    head: [['Field', 'Value']],
    body: ownerInfo,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
    tableWidth: 'auto',
  });
  
  // Add vaccination records
  const ownerFinalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(16);
  doc.text('Vaccination Records', 14, ownerFinalY);
  
  if (vaccinations.length === 0) {
    doc.setFontSize(11);
    doc.text('No vaccination records.', 14, ownerFinalY + 8);
  } else {
    const vaccinationData = vaccinations.map(v => [
      v.name,
      format(new Date(v.date), 'MMM d, yyyy'),
      format(new Date(v.next_due), 'MMM d, yyyy'),
      v.status
    ]);
    
    autoTable(doc, {
      startY: ownerFinalY + 3,
      head: [['Vaccine', 'Date', 'Next Due', 'Status']],
      body: vaccinationData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 14 },
    });
  }
  
  // Add medical history
  const vaccinationFinalY = vaccinations.length > 0 ? doc.lastAutoTable.finalY + 10 : ownerFinalY + 15;
  doc.setFontSize(16);
  doc.text('Medical History', 14, vaccinationFinalY);
  
  if (medicalRecords.length === 0) {
    doc.setFontSize(11);
    doc.text('No medical records.', 14, vaccinationFinalY + 8);
  } else {
    const medicalData = medicalRecords.map(m => [
      format(new Date(m.date), 'MMM d, yyyy'),
      m.description,
      m.notes
    ]);
    
    autoTable(doc, {
      startY: vaccinationFinalY + 3,
      head: [['Date', 'Description', 'Notes']],
      body: medicalData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 14 },
      columnStyles: {
        2: { cellWidth: 'auto' }
      },
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    doc.text('Canki Vet Clinic - Confidential Medical Record', 14, 285);
  }
  
  // Return the PDF as a data URL
  return doc.output('dataurlstring');
}
