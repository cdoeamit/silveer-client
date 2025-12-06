import jsPDF from 'jspdf';

export const generateRegularPDF = (sale) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // ===== TITLE =====
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // ===== VOUCHER AND DATE =====
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Voucher: ${sale.voucherNumber}`, 15, yPosition);
    doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString('en-GB')}`, pageWidth - 50, yPosition);
    yPosition += 10;

    // ===== CUSTOMER INFO SECTION =====
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CUSTOMER DETAILS', 15, yPosition);
    yPosition += 5;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${sale.customer?.name || 'N/A'}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${sale.customer?.phone || 'N/A'}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Address: ${sale.customer?.address || 'N/A'}`, 15, yPosition);
    yPosition += 8;

    // ===== TABLE SECTION =====
doc.setFontSize(10);
doc.setFont(undefined, 'bold');
doc.text('ITEMS DETAILS', 15, yPosition);
yPosition += 4;

// Fixed table width
const tableLeft  = 15;
const tableRight = 200;

// Column centers
const xDesc   = 25;   // wide
const xPcs    = 42;
const xGross  = 57;
const xStone  = 72;
const xNet    = 87;
const xTouch  = 102;
const xWast   = 117;
const xSilver = 137;  // more space
const xLabor  = 162;  // more space
const xAmt    = 190;  // more space

// Top line
doc.setDrawColor(0, 0, 0);
doc.setLineWidth(0.4);
doc.line(tableLeft, yPosition, tableRight, yPosition);
yPosition += 5;

// Header
doc.setFontSize(8.5);
doc.setFont(undefined, 'bold');
doc.text('Description', xDesc,  yPosition, { align: 'center' });
doc.text('Pcs',         xPcs,   yPosition, { align: 'center' });
doc.text('Gross Wt',    xGross, yPosition, { align: 'center' });
doc.text('Stone Wt',    xStone, yPosition, { align: 'center' });
doc.text('Net Wt',      xNet,   yPosition, { align: 'center' });
doc.text('Touch',       xTouch, yPosition, { align: 'center' });
doc.text('Wastage',     xWast,  yPosition, { align: 'center' });
doc.text('Silver Wt',   xSilver,yPosition, { align: 'center' });
doc.text('Labor',       xLabor, yPosition, { align: 'center' });
doc.text('Amount',      xAmt,   yPosition, { align: 'center' });

yPosition += 3;
// Header bottom
doc.line(tableLeft, yPosition, tableRight, yPosition);

const headerTopY = yPosition - 8;
yPosition += 5;

doc.setFont(undefined, 'normal');
doc.setFontSize(8.5);
const rowHeight = 6;

sale.items.forEach((item) => {
  const desc   = String(item.description || '-');
  const pcs    = String(item.pieces || '1');
  const gross  = String(parseFloat(item.grossWeight || 0).toFixed(2));
  const stone  = String(parseFloat(item.stoneWeight || 0).toFixed(2));
  const net    = String(parseFloat(item.netWeight || 0).toFixed(2));
  const touch  = String(parseFloat(item.touch || 0).toFixed(2));
  const wast   = String(parseFloat(item.wastage || 0).toFixed(2));
  const silver = String(parseFloat(item.silverWeight || 0).toFixed(2));
  const labor  = 'Rs. ' + String(parseFloat(item.laborCharges || 0).toFixed(2));
  const amt    = 'Rs. ' + String(parseFloat(item.itemAmount || 0).toFixed(2));

  // Data row
  doc.text(desc,   xDesc,   yPosition, { align: 'center', maxWidth: 18 });
  doc.text(pcs,    xPcs,    yPosition, { align: 'center' });
  doc.text(gross,  xGross,  yPosition, { align: 'center' });
  doc.text(stone,  xStone,  yPosition, { align: 'center' });
  doc.text(net,    xNet,    yPosition, { align: 'center' });
  doc.text(touch,  xTouch,  yPosition, { align: 'center' });
  doc.text(wast,   xWast,   yPosition, { align: 'center' });
  doc.text(silver, xSilver, yPosition, { align: 'center' });
  doc.text(labor,  xLabor,  yPosition, { align: 'center' });
  doc.text(amt,    xAmt,    yPosition, { align: 'center' });

  yPosition += rowHeight;
});

const tableBottomY = yPosition;

// Vertical lines for all 10 columns
const vLines = [
  tableLeft,        // start
  35,               // between Desc & Pcs
  49,               // Pcs/Gross
  64,               // Gross/Stone
  79,               // Stone/Net
  94,               // Net/Touch
  109,              // Touch/Wastage
  124,              // Wastage/Silver
  150,              // Silver/Labor
  175,              // Labor/Amount
  tableRight        // end
];

vLines.forEach(x => {
  doc.line(x, headerTopY, x, tableBottomY);
});

// Bottom line
doc.line(tableLeft, tableBottomY, tableRight, tableBottomY);
yPosition += 8;

  // ===== SUMMARY SECTION =====
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 15, yPosition);
    yPosition += 4;

    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    // Calculate values
    const totalSilverWeight = parseFloat(sale.totalSilverWeight || 0);
    const totalLaborCharges = parseFloat(sale.totalLaborCharges || 0);
    const totalAmount = parseFloat(sale.totalAmount || 0);
    const previousBalance = parseFloat(sale.previousBalance || 0);
    const paidAmount = parseFloat(sale.paidAmount || 0);
    const paidSilver = parseFloat(sale.paidSilver || 0);
    const silverRate = parseFloat(sale.silverRate || 0);
    const balanceAmount = parseFloat(sale.balanceAmount || 0);
    const cashPaid = paidAmount - (paidSilver * silverRate);
    const silverValue = paidSilver * silverRate;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const summaryRows = [
      { label: 'Total Silver Weight:', value: `${totalSilverWeight.toFixed(3)} g` },
      { label: 'Total Labor Charges:', value: `Rs. ${totalLaborCharges.toFixed(2)}` },
      { label: 'Today\'s Amount:', value: `Rs. ${totalAmount.toFixed(2)}` },
      { label: 'Previous Balance:', value: `Rs. ${previousBalance.toFixed(2)}` },
      { label: 'Total Due:', value: `Rs. ${(totalAmount + previousBalance).toFixed(2)}` }
    ];

    summaryRows.forEach((row) => {
      doc.setFont(undefined, row.label.includes('Today') || row.label.includes('Total Due') ? 'bold' : 'normal');
      doc.text(row.label, 15, yPosition);
      doc.text(row.value, pageWidth - 35, yPosition, { align: 'right' });
      yPosition += 5;
    });

    yPosition += 2;

    // ===== PAYMENT SECTION =====
    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT RECEIVED', 15, yPosition);
    yPosition += 4;

    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const paymentRows = [
      { label: 'Cash/Card Paid:', value: `Rs. ${cashPaid.toFixed(2)}` },
      { label: `Silver Returned (${paidSilver.toFixed(3)}g):`, value: `Rs. ${silverValue.toFixed(2)}` },
      { label: 'Total Paid:', value: `Rs. ${paidAmount.toFixed(2)}` }
    ];

    paymentRows.forEach((row) => {
      doc.setFont(undefined, row.label.includes('Total Paid') ? 'bold' : 'normal');
      doc.text(row.label, 15, yPosition);
      doc.text(row.value, pageWidth - 35, yPosition, { align: 'right' });
      yPosition += 5;
    });

    yPosition += 3;

    // ===== BALANCE SECTION =====
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 4;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    const remainingLabel = balanceAmount > 0 ? 'BALANCE REMAINING' : 'OVERPAID AMOUNT';
    const remainingValue = balanceAmount > 0 ? `Rs. ${balanceAmount.toFixed(2)}` : `Rs. ${Math.abs(balanceAmount).toFixed(2)}`;

    doc.text(remainingLabel, 15, yPosition);
    doc.text(remainingValue, pageWidth - 35, yPosition, { align: 'right' });
    yPosition += 5;

    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 6;

    // ===== STATUS AND RATE =====
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Status: ${sale.status.toUpperCase()} | Silver Rate: Rs. ${silverRate.toFixed(2)}/g`, 15, yPosition);

    // ===== FOOTER =====
    const footerY = pageHeight - 8;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont(undefined, 'normal');
    doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth / 2, footerY + 3, { align: 'center' });

    // Save PDF
    doc.save(`${sale.voucherNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF: ' + error.message);
  }
};
