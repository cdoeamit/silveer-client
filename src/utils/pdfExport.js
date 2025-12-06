import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBillPDF = (sale, customer) => {
  const doc = new jsPDF();

  // Company header
  doc.setFillColor(25, 47, 89); // Navy blue
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('BILLING', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString('en-GB')}`, 170, 20);

  // Customer info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Customer: ${customer.name}`, 14, 40);
  doc.text(`Billing Date: ${new Date(sale.saleDate).toLocaleDateString('en-GB')}`, 150, 40);

  // Table data
  const tableData = sale.items.map(item => [
    item.description,
    parseFloat(item.netWeight).toFixed(3),
    parseFloat(sale.silverRate).toFixed(2),
    parseFloat(item.touch).toFixed(2),
    parseFloat(item.wastage).toFixed(3),
    item.hihob || '50%',
    parseFloat(item.laborCharges).toFixed(2),
    parseFloat(item.silverWeight).toFixed(3),
    parseFloat(item.itemAmount).toFixed(2)
  ]);

  // Add table
  doc.autoTable({
    startY: 50,
    head: [['Product', 'Net Wt', 'Price', 'Touch', 'Wastage', 'Hi/Hob', 'Labour', 'Silver', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [25, 47, 89],
      textColor: 255,
      fontSize: 9
    },
    columnStyles: {
      7: { textColor: [255, 140, 0] }, // Orange for Silver
      8: { textColor: [0, 128, 0] }    // Green for Amount
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.text('Total:', 120, finalY);
  doc.setTextColor(255, 140, 0);
  doc.text(parseFloat(sale.totalSilverWeight).toFixed(3), 160, finalY);
  doc.setTextColor(0, 128, 0);
  doc.text(parseFloat(sale.totalAmount).toFixed(2), 180, finalY);

  // Previous dues
  if (sale.previousBalance > 0) {
    doc.setTextColor(0, 0, 0);
    doc.text('Dues:', 120, finalY + 7);
    doc.setTextColor(255, 140, 0);
    doc.text(parseFloat(sale.previousBalance).toFixed(2), 160, finalY + 7);
  }

  // Closing balance
  doc.setTextColor(0, 0, 0);
  doc.text('Closing Balance:', 120, finalY + 14);
  doc.setTextColor(0, 128, 0);
  doc.text(parseFloat(sale.closingBalance).toFixed(2), 180, finalY + 14);

  // Description
  if (sale.notes) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Description:', 14, finalY + 25);
    doc.setFontSize(9);
    doc.text(sale.notes, 14, finalY + 32, { maxWidth: 180 });
  }

  // Save
  doc.save(`bill-${sale.voucherNumber}.pdf`);
};
