import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportPDFProps {
  reportData: any;
  reportType: string;
  user?: any;
}

export function ReportPDF({ reportData, reportType, user }: ReportPDFProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Rapport ${reportType}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Create a temporary hidden div with the report content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.className = 'report-pdf-content';

      const reportTitle = {
        'expenses': 'RAPPORT DES DÉPENSES',
        'categories': 'RAPPORT DES CATÉGORIES',
        'imprest': 'RAPPORT DES FONDS D\'AVANCE',
        'financial': 'RAPPORT FINANCIER'
      }[reportType] || 'RAPPORT';

      // Add report HTML content to temp div
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: black; line-height: 1.6; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0; color: #3b82f6;">${reportTitle}</h1>
            <p style="font-size: 18px; color: #666; margin: 8px 0;">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
            <div>
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Informations de l'entreprise</h3>
              <div style="font-size: 14px; line-height: 1.8;">
                <strong>${user?.company || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mon Entreprise'}</strong><br>
                ${user?.address ? `${user?.address}<br>` : ''}
                ${user?.phone ? `Tél: ${user?.phone}<br>` : ''}
                ${user?.email ? `Email: ${user?.email}` : ''}
              </div>
            </div>
            <div>
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Période du rapport</h3>
              <div style="font-size: 14px; line-height: 1.8;">
                <strong>Date de génération:</strong> ${new Date().toLocaleDateString('fr-FR')}<br>
                <strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}<br>
                <strong>Type:</strong> ${reportTitle}<br>
                <strong>Devise:</strong> FCFA
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Résumé exécutif</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                Ce rapport présente un aperçu détaillé des données comptables pour la période sélectionnée.
                Les informations contenues dans ce document sont extraites directement du système YGestion
                et reflètent l'état actuel des données au moment de la génération.
              </p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Données du rapport</h3>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border: 2px solid #3b82f6;">
              <pre style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; margin: 0; white-space: pre-wrap; word-wrap: break-word;">
${JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 12px; color: #6b7280;">
              <div>
                <strong>Document généré le:</strong><br>
                ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
              </div>
              <div style="text-align: right;">
                <strong>YGestion</strong><br>
                Système de gestion d'entreprise
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        imageTimeout: 15000,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      });

      // Remove temp div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);

      // Calculate dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png', 0.95);

      if (imgHeight <= pageHeight - (2 * margin)) {
        // Single page
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let yPosition = 0;
        const pageContentHeight = pageHeight - (2 * margin);

        while (yPosition < imgHeight) {
          const remainingHeight = imgHeight - yPosition;
          const currentPageHeight = Math.min(pageContentHeight, remainingHeight);

          if (yPosition > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin,
            imgWidth,
            currentPageHeight
          );

          yPosition += currentPageHeight;
        }
      }

      // Save the PDF
      pdf.save(`Rapport_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="print:hidden"
      >
        <Printer className="h-4 w-4 mr-2" />
        Imprimer
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPDF}
        className="print:hidden"
      >
        <Download className="h-4 w-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}