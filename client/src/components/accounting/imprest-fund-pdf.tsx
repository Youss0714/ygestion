import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImprestFundPDFProps {
  imprestFund: any;
  user?: any;
}

export function ImprestFundPDF({ imprestFund, user }: ImprestFundPDFProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Fonds d'avance ${imprestFund.reference}`;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer');
      return;
    }

    const statusMap = {
      'active': { label: 'Actif', color: '#10b981', icon: '✅' },
      'depleted': { label: 'Épuisé', color: '#ef4444', icon: '⚠️' },
      'closed': { label: 'Fermé', color: '#6b7280', icon: '🔒' }
    } as const;
    
    const statusInfo = statusMap[imprestFund.status as keyof typeof statusMap] || { label: imprestFund.status, color: '#6b7280', icon: '📄' };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fonds d'avance ${imprestFund.reference}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: black;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 36px;
            font-weight: bold;
            margin: 0;
            color: #3b82f6;
          }
          .header p {
            font-size: 18px;
            color: #666;
            margin: 8px 0;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .section h3 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .section div {
            font-size: 14px;
            line-height: 1.8;
          }
          .description {
            margin-bottom: 30px;
          }
          .description-content {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .amount-box {
            padding: 20px;
            border-radius: 8px;
            border: 2px solid;
            text-align: center;
          }
          .amount-box.initial {
            background-color: #f0f9ff;
            border-color: #3b82f6;
          }
          .amount-box.current {
            background-color: #f0fdf4;
            border-color: #10b981;
          }
          .amount-box.used {
            background-color: #fffbeb;
            border-color: #f59e0b;
            margin-bottom: 30px;
          }
          .amount-box h3 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .amount-box.initial h3 { color: #1e40af; }
          .amount-box.current h3 { color: #047857; }
          .amount-box.used h3 { color: #d97706; }
          .amount-box p {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .amount-box.initial p { color: #1e40af; }
          .amount-box.current p { color: #047857; }
          .amount-box.used p { color: #d97706; }
          .footer {
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            font-size: 12px;
            color: #6b7280;
          }
          .footer-right {
            text-align: right;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FONDS D'AVANCE</h1>
          <p>${imprestFund.reference}</p>
        </div>

        <div class="grid">
          <div class="section">
            <h3>Informations de l'entreprise</h3>
            <div>
              <strong>${user?.company || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mon Entreprise'}</strong><br>
              ${user?.address ? `${user?.address}<br>` : ''}
              ${user?.phone ? `Tél: ${user?.phone}<br>` : ''}
              ${user?.email ? `Email: ${user?.email}` : ''}
            </div>
          </div>
          <div class="section">
            <h3>Détails du fonds</h3>
            <div>
              <strong>Date de création:</strong> ${new Date(imprestFund.createdAt).toLocaleDateString('fr-FR')}<br>
              <strong>Statut:</strong> <span style="color: ${statusInfo.color};">${statusInfo.icon} ${statusInfo.label}</span><br>
              <strong>Responsable:</strong> ${imprestFund.holder || 'Non défini'}<br>
              <strong>Département:</strong> ${imprestFund.department || 'Non défini'}
            </div>
          </div>
        </div>

        <div class="description">
          <div class="section">
            <h3>Description</h3>
            <div class="description-content">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${imprestFund.description}</p>
            </div>
          </div>
        </div>

        <div class="grid-3">
          <div class="amount-box initial">
            <h3>MONTANT INITIAL</h3>
            <p>${parseFloat(imprestFund.initialAmount).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div class="amount-box current">
            <h3>SOLDE ACTUEL</h3>
            <p>${parseFloat(imprestFund.currentBalance).toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        <div class="amount-box used">
          <h3>MONTANT UTILISÉ</h3>
          <p>${(parseFloat(imprestFund.initialAmount) - parseFloat(imprestFund.currentBalance)).toLocaleString('fr-FR')} FCFA</p>
          <p style="font-size: 14px; margin: 5px 0 0 0; color: #92400e;">
            Taux d'utilisation: ${(((parseFloat(imprestFund.initialAmount) - parseFloat(imprestFund.currentBalance)) / parseFloat(imprestFund.initialAmount)) * 100).toFixed(1)}%
          </p>
        </div>

        ${imprestFund.notes ? `
        <div class="description">
          <div class="section">
            <h3>Notes</h3>
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${imprestFund.notes}</p>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <div>
            <strong>Document généré le:</strong><br>
            ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </div>
          <div class="footer-right">
            <strong>YGestion</strong><br>
            Système de gestion d'entreprise
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Create a temporary hidden div with the imprest fund content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.className = 'imprest-fund-pdf-content';

      const statusMap = {
        'active': { label: 'Actif', color: '#10b981', icon: '✅' },
        'depleted': { label: 'Épuisé', color: '#ef4444', icon: '⚠️' },
        'closed': { label: 'Fermé', color: '#6b7280', icon: '🔒' }
      } as const;
      
      const statusInfo = statusMap[imprestFund.status as keyof typeof statusMap] || { label: imprestFund.status, color: '#6b7280', icon: '📄' };

      // Add imprest fund HTML content to temp div
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: black; line-height: 1.6; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0; color: #3b82f6;">FONDS D'AVANCE</h1>
            <p style="font-size: 18px; color: #666; margin: 8px 0;">${imprestFund.reference}</p>
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
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Détails du fonds</h3>
              <div style="font-size: 14px; line-height: 1.8;">
                <strong>Date de création:</strong> ${new Date(imprestFund.createdAt).toLocaleDateString('fr-FR')}<br>
                <strong>Statut:</strong> <span style="color: ${statusInfo.color};">${statusInfo.icon} ${statusInfo.label}</span><br>
                <strong>Responsable:</strong> ${imprestFund.holder || 'Non défini'}<br>
                <strong>Département:</strong> ${imprestFund.department || 'Non défini'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Description</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${imprestFund.description}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border: 2px solid #3b82f6; text-align: center;">
              <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #1e40af;">MONTANT INITIAL</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #1e40af;">${parseFloat(imprestFund.initialAmount).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #10b981; text-align: center;">
              <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #047857;">SOLDE ACTUEL</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #047857;">${parseFloat(imprestFund.currentBalance).toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>

          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b; text-align: center; margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #d97706;">MONTANT UTILISÉ</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0; color: #d97706;">${(parseFloat(imprestFund.initialAmount) - parseFloat(imprestFund.currentBalance)).toLocaleString('fr-FR')} FCFA</p>
            <p style="font-size: 14px; margin: 5px 0 0 0; color: #92400e;">
              Taux d'utilisation: ${(((parseFloat(imprestFund.initialAmount) - parseFloat(imprestFund.currentBalance)) / parseFloat(imprestFund.initialAmount)) * 100).toFixed(1)}%
            </p>
          </div>

          ${imprestFund.notes ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Notes</h3>
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${imprestFund.notes}</p>
            </div>
          </div>
          ` : ''}

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
      pdf.save(`Fonds_Avance_${imprestFund.reference}.pdf`);

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