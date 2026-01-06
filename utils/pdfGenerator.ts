
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Requisition } from '../types';
import { COMPANY_NAME, ZONE_INFO } from '../constants';

/**
 * Draws the company branding and document title on the current page.
 */
const drawHeader = (doc: jsPDF, pageWidth: number) => {
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(COMPANY_NAME, pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text('Zone - 16, National Special Economic Zone', pageWidth / 2, 20, { align: 'center' });
  doc.text('Mirsarai , Chattogram.', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Material Purchase Requisition Slip ( MPRS )', pageWidth / 2, 31, { align: 'center' });
};

export const generatePDF = (req: Requisition) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2); // 190mm
    
    // 1. Initial Header (First Page)
    drawHeader(doc, pageWidth);
    
    // 2. Meta Info Table (Title, Dept, No, Date) - Usually only on page 1
    const metaData = [
      ['Requisition Title :', req.title || ''],
      ['Department :', req.department || ''],
      ['MPRS No :', req.mprs_no || ''],
      ['MPRS Date :', req.mprs_date || '']
    ];

    autoTable(doc, {
      startY: 35,
      margin: { left: margin, right: margin },
      body: metaData,
      theme: 'grid',
      styles: { 
        cellPadding: 1.5, 
        fontSize: 9, 
        textColor: [0, 0, 0], 
        font: 'Helvetica', 
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: contentWidth - 40 }
      }
    });

    // 3. Items Table with Multi-page Robustness
    const tableHeaders = [[
      'Sl No', 
      'Name of Item', 
      'Specification', 
      'Required\nQuantity', 
      'Unit', 
      'Purpose', 
      'Lead\nTime\n(Day/s)', 
      'Item Code', 
      'Remarks'
    ]];

    const tableData = req.items.map((item, index) => [
      index + 1,
      item.item_name || '',
      item.specification || '',
      item.quantity || '',
      item.unit || '',
      item.purpose || '',
      item.lead_time || '',
      item.item_code || '',
      item.remarks || ''
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: (doc as any).lastAutoTable.finalY + 5,
      // margin.top is critical: it defines where the table starts on subsequent pages
      margin: { left: margin, right: margin, top: 40 }, 
      theme: 'grid',
      showHead: 'everyPage', // Explicitly repeat the header row
      tableWidth: contentWidth,
      styles: { 
        fontSize: 8, 
        cellPadding: 2, 
        lineWidth: 0.2, 
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        valign: 'middle',
        font: 'Helvetica',
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold', 
        halign: 'center',
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 10 },
        5: { cellWidth: 25 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 20 },
        8: { cellWidth: 27 }
      },
      // Draw company header on every new page
      didDrawPage: (data) => {
        // Skip drawing header on the first page as we manually drew it to handle the Meta Table startY
        if (data.pageNumber > 1) {
          drawHeader(doc, pageWidth);
        }
      }
    });

    // 4. Footer Section (Signatures)
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let footerY = finalY;
    // If footer doesn't fit, move to new page and redraw header there too
    if (footerY > pageHeight - 20) {
      doc.addPage();
      drawHeader(doc, pageWidth);
      footerY = 50; // Start signatures lower on new page after header
    }

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    
    const footerLabels = ['Requisition By', 'Store Department', 'Plant In-charge', 'Approved By'];
    const footerCount = footerLabels.length;
    const footerSpacing = contentWidth / footerCount;

    footerLabels.forEach((label, i) => {
      const xCenter = margin + (i * footerSpacing) + (footerSpacing / 2);
      doc.text(label, xCenter, footerY, { align: 'center' });
    });

    // Save the PDF
    doc.save(`${req.mprs_no || 'MPRS_Slip'}.pdf`);
  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("Could not generate PDF. Please ensure all data is correctly entered.");
  }
};
