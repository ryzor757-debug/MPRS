
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
    
    // 2. Meta Info Table (Title, Dept, No, Date)
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

    // 3. Items Table with Multi-page Robustness & Fixed Column Widths
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

    // Precise Width Calculation (Sum = 190mm)
    // 7 + 22 + 42 + 16 + 10 + 25 + 15 + 21 + 32 = 190
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 5 : 60,
      margin: { left: margin, right: margin, top: 40 }, 
      theme: 'grid',
      showHead: 'everyPage', 
      tableWidth: contentWidth,
      styles: { 
        fontSize: 8, 
        cellPadding: 2, 
        lineWidth: 0.2, 
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        valign: 'middle',
        font: 'Helvetica',
        overflow: 'linebreak' // Ensures remarks wrap instead of overflowing
      },
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold', 
        halign: 'center',
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 7 },
        1: { cellWidth: 22 },
        2: { cellWidth: 42 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'center', cellWidth: 10 },
        5: { cellWidth: 25 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 21 },
        8: { cellWidth: 32 } // Sufficient space for remarks within 190mm total
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          drawHeader(doc, pageWidth);
        }
      }
    });

    // 4. Footer Section (Signatures)
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let footerY = finalY;
    if (footerY > pageHeight - 20) {
      doc.addPage();
      drawHeader(doc, pageWidth);
      footerY = 50; 
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

    doc.save(`${req.mprs_no || 'MPRS_Slip'}.pdf`);
  } catch (error) {
    console.error("PDF Generation failed:", error);
    alert("Could not generate PDF. Please ensure all data is correctly entered.");
  }
};
