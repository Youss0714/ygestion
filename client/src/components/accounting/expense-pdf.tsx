import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpensePDFProps {
  expense: any;
  user?: any;
}

export function ExpensePDF({ expense, user }: ExpensePDFProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Dépense ${expense.reference}`;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer');
      return;
    }

    const statusMap = {
      'pending': { label: 'En attente', color: '#f59e0b', icon: '⏳' },
      'approved': { label: 'Approuvée', color: '#10b981', icon: '✅' },
      'rejected': { label: 'Rejetée', color: '#ef4444', icon: '❌' }
    } as const;
    
    const statusInfo = statusMap[expense.status as keyof typeof statusMap] || { label: expense.status, color: '#6b7280', icon: '📄' };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dépense ${expense.reference}</title>
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
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #3b82f6;
            text-align: center;
            margin-bottom: 30px;
          }
          .amount-box h3 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #1e40af;
          }
          .amount-box p {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
            color: #1e40af;
          }
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
          <h1>JUSTIFICATIF DE DÉPENSE</h1>
          <p>${expense.reference}</p>
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
            <h3>Détails de la dépense</h3>
            <div>
              <strong>Date:</strong> ${new Date(expense.expenseDate).toLocaleDateString('fr-FR')}<br>
              <strong>Statut:</strong> <span style="color: ${statusInfo.color};">${statusInfo.icon} ${statusInfo.label}</span><br>
              <strong>Méthode:</strong> ${expense.paymentMethod === 'cash' ? 'Espèces' : expense.paymentMethod === 'check' ? 'Chèque' : expense.paymentMethod === 'transfer' ? 'Virement' : expense.paymentMethod}<br>
              <strong>Catégorie:</strong> ${expense.category?.name || 'Non définie'}
            </div>
          </div>
        </div>

        <div class="description">
          <div class="section">
            <h3>Description</h3>
            <div class="description-content">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${expense.description}</p>
            </div>
          </div>
        </div>

        <div class="amount-box">
          <h3>MONTANT TOTAL</h3>
          <p>${parseFloat(expense.amount).toLocaleString('fr-FR')} FCFA</p>
        </div>

        ${expense.notes ? `
        <div class="description">
          <div class="section">
            <h3>Notes</h3>
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${expense.notes}</p>
            </div>
          </div>
        </div>
        ` : ''}

        ${expense.approvedBy ? `
        <div class="description">
          <div class="section">
            <h3>Approbation</h3>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>Approuvé par:</strong> ${expense.approvedBy}<br>
                <strong>Date d'approbation:</strong> ${new Date(expense.approvedAt).toLocaleDateString('fr-FR')} à ${new Date(expense.approvedAt).toLocaleTimeString('fr-FR')}
              </p>
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

      // Create a temporary hidden div with the expense content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.className = 'expense-pdf-content';

      const statusMap = {
        'pending': { label: 'En attente', color: '#f59e0b', icon: '⏳' },
        'approved': { label: 'Approuvée', color: '#10b981', icon: '✅' },
        'rejected': { label: 'Rejetée', color: '#ef4444', icon: '❌' }
      } as const;
      
      const statusInfo = statusMap[expense.status as keyof typeof statusMap] || { label: expense.status, color: '#6b7280', icon: '📄' };

      // Add expense HTML content to temp div
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: black; line-height: 1.6; max-width: 100%;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0; color: #3b82f6;">JUSTIFICATIF DE DÉPENSE</h1>
            <p style="font-size: 18px; color: #666; margin: 8px 0;">${expense.reference}</p>
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
              <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Détails de la dépense</h3>
              <div style="font-size: 14px; line-height: 1.8;">
                <strong>Date:</strong> ${new Date(expense.expenseDate).toLocaleDateString('fr-FR')}<br>
                <strong>Statut:</strong> <span style="color: ${statusInfo.color};">${statusInfo.icon} ${statusInfo.label}</span><br>
                <strong>Méthode:</strong> ${expense.paymentMethod === 'cash' ? 'Espèces' : expense.paymentMethod === 'check' ? 'Chèque' : expense.paymentMethod === 'transfer' ? 'Virement' : expense.paymentMethod}<br>
                <strong>Catégorie:</strong> ${expense.category?.name || 'Non définie'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Description</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${expense.description}</p>
            </div>
          </div>

          ${expense.notes ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Notes</h3>
            <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">${expense.notes}</p>
            </div>
          </div>
          ` : ''}

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border: 2px solid #3b82f6; text-align: center; margin-bottom: 30px;">
            <h3 style="font-size: 24px; font-weight: bold; margin: 0; color: #1e40af;">MONTANT TOTAL</h3>
            <p style="font-size: 36px; font-weight: bold; margin: 10px 0; color: #1e40af;">${parseFloat(expense.amount).toLocaleString('fr-FR')} FCFA</p>
          </div>

          ${expense.approvedBy ? `
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Approbation</h3>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>Approuvé par:</strong> ${expense.approvedBy}<br>
                <strong>Date d'approbation:</strong> ${new Date(expense.approvedAt).toLocaleDateString('fr-FR')} à ${new Date(expense.approvedAt).toLocaleTimeString('fr-FR')}
              </p>
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
      pdf.save(`Depense_${expense.reference}.pdf`);

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