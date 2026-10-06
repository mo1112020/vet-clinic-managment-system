
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, File, Loader2 } from 'lucide-react';
import { ListPagination } from '@/components/ui/list-pagination';
import { useListPagination } from '@/hooks/use-list-pagination';
import { format } from 'date-fns';
import { Document } from '@/types/database.types';
import { useToast } from '@/hooks/use-toast';
import { useAnimalDetails } from '@/hooks/use-animal-details';

interface DocumentsTabProps {
  documents: Document[];
  animalId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, animalId }) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const { animal, owner, vaccinations, medicalHistory } = useAnimalDetails(animalId);

  const handleDownloadPatientPdf = async () => {
    if (!animal || !owner) {
      toast({
        title: 'Error',
        description: 'Could not fetch patient information',
        variant: 'destructive',
      });
      return;
    }
    
    setGeneratingPdf(true);
    try {
      toast({
        title: 'Generating PDF',
        description: 'Please wait while we prepare the patient record...',
      });
      
      const { generateAnimalRecordPdf } = await import('@/services/documents/generate-pdf');
      const pdfDataUrl = await generateAnimalRecordPdf({
        animal,
        owner,
        vaccinations: vaccinations || [],
        medicalRecords: medicalHistory || [],
        title: `Medical Record - ${animal.name}`
      });
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `${animal.name.replace(/\s+/g, '_')}_medical_record.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'PDF Generated',
        description: 'Patient record PDF has been downloaded.',
      });
    } catch (error: unknown) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  const pagination = useListPagination(documents);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Documents & Files</CardTitle>
            <CardDescription>Patient documents and files</CardDescription>
          </div>
          <Button 
            variant="outline"
            onClick={handleDownloadPatientPdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Patient PDF
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found for this animal.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagination.items.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="bg-muted p-2 rounded">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{doc.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Uploaded on {format(new Date(doc.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
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

export default DocumentsTab;
