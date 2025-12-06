import html2pdf from 'html2pdf.js';

export const generatePDF = (sale) => {
  const cashPaid = parseFloat(sale.paidAmount || 0) - (parseFloat(sale.paidSilver || 0) * parseFloat(sale.silverRate || 0));
  const silverValue = parseFloat(sale.paidSilver || 0) * parseFloat(sale.silverRate || 0);
  const totalDue = parseFloat(sale.totalAmount || 0) + parseFloat(sale.previousBalance || 0);

  const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px; font-size: 12px; color:#000;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 15px;">
        <h1 style="font-size: 20px; margin: 0 0 3px 0;">INVOICE</h1>
      </div>
      <div style="width:100%; margin-bottom: 15px; font-size:11px;">
        <span><strong>Voucher:</strong> ${sale.voucherNumber}</span>
        <span style="float:right;"><strong>Date:</strong> ${new Date(sale.saleDate).toLocaleDateString('en-GB')}</span>
      </div>

      <!-- Customer Info ONLY (no sale details box) -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size:11px;">
        <tr>
          <td style="border: 1px solid #000; padding: 8px;">
            <strong>CUSTOMER DETAILS</strong>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${sale.customer?.name || ''}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${sale.customer?.phone || ''}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${sale.customer?.address || ''}</p>
          </td>
        </tr>
      </table>

      <!-- Items Table (same as before) -->
      <div style="font-size:11px; font-weight:bold; margin-bottom:4px;">ITEMS DETAILS</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
        <thead>
          <tr>
            <th style="border: 1px solid #000; padding: 6px; text-align: left;">Description</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">Pcs</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Gross Wt</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Stone Wt</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Net Wt</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Touch</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Wastage</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Silver Wt</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Labor</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${
            (sale.items || []).map(item => `
              <tr>
                <td style="border: 1px solid #000; padding: 6px; text-align: left;">${item.description || ''}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: center;">${item.pieces || ''}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.grossWeight || 0).toFixed(3)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.stoneWeight || 0).toFixed(3)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.netWeight || 0).toFixed(3)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.touch || 0).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.wastage || 0).toFixed(3)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">${parseFloat(item.silverWeight || 0).toFixed(3)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">Rs. ${parseFloat(item.laborCharges || 0).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 6px; text-align: right;">Rs. ${parseFloat(item.itemAmount || 0).toFixed(2)}</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>

      <!-- SUMMARY (left aligned labels & values) -->
      <div style="font-size:11px; font-weight:bold; margin:8px 0 4px 0;">SUMMARY</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
        <tbody>
          <tr>
            <td style="padding: 4px; text-align: left; width: 60%;"><strong>Total Silver Weight:</strong></td>
            <td style="padding: 4px; text-align: right; width: 40%;">${parseFloat(sale.totalSilverWeight || 0).toFixed(3)} g</td>
          </tr>
          <tr>
            <td style="padding: 4px; text-align: left;"><strong>Total Labor Charges:</strong></td>
            <td style="padding: 4px; text-align: right;">Rs. ${parseFloat(sale.totalLaborCharges || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px; text-align: left;"><strong>Today's Amount:</strong></td>
            <td style="padding: 4px; text-align: right;"><strong>Rs. ${parseFloat(sale.totalAmount || 0).toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px; text-align: left;"><strong>Previous Balance:</strong></td>
            <td style="padding: 4px; text-align: right;">Rs. ${parseFloat(sale.previousBalance || 0).toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #000;">
            <td style="padding: 4px; text-align: left;"><strong>Total Due:</strong></td>
            <td style="padding: 4px; text-align: right;"><strong>Rs. ${totalDue.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- PAYMENT RECEIVED (left aligned) -->
      <div style="font-size:11px; font-weight:bold; margin:8px 0 4px 0;">PAYMENT RECEIVED</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 12px;">
        <tbody>
          <tr>
            <td style="padding: 4px; text-align: left; width: 60%;"><strong>Cash/Card Paid:</strong></td>
            <td style="padding: 4px; text-align: right; width: 40%;">Rs. ${cashPaid.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px; text-align: left;"><strong>Silver Returned (${parseFloat(sale.paidSilver || 0).toFixed(3)} g):</strong></td>
            <td style="padding: 4px; text-align: right;">Rs. ${silverValue.toFixed(2)}</td>
          </tr>
          <tr style="border-top:1px solid #000;">
            <td style="padding: 4px; text-align: left;"><strong>Total Paid:</strong></td>
            <td style="padding: 4px; text-align: right;"><strong>Rs. ${parseFloat(sale.paidAmount || 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- BALANCE (left aligned) -->
      <div style="font-size:11px; font-weight:bold; margin:8px 0 4px 0;">BALANCE</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <tr style="border-top:2px solid #000; border-bottom:2px solid #000;">
          <td style="padding: 8px; text-align: left; width: 60%;"><strong>Balance Amount:</strong></td>
          <td style="padding: 8px; text-align: right; width: 40%;"><strong>Rs. ${parseFloat(sale.balanceAmount || 0).toFixed(2)}</strong></td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top: 20px; text-align: center; font-size: 9px; color: #555;">
        <p>This is a computer-generated document. No signature required.</p>
        <p>Generated on: ${new Date().toLocaleString('en-GB')}</p>
      </div>
    </div>
  `;

  const element = document.createElement('div');
  element.innerHTML = content;

  const opt = {
    margin: 10,
    filename: `regular-bill-${sale.voucherNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};
