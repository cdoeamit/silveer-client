import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  try {
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate file
    XLSX.writeFile(workbook, filename);

    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
};

export const exportCustomersToExcel = (customers) => {
  const data = customers.map(customer => ({
    'Name': customer.name,
    'Phone': customer.phone,
    'Email': customer.email || '-',
    'GST Number': customer.gstNumber || '-',
    'Address': customer.address || '-',
    'Balance': parseFloat(customer.balance).toFixed(2)
  }));

  const filename = `customers-${new Date().toISOString().split('T')[0]}.xlsx`;
  return exportToExcel(data, filename, 'Customers');
};

export const exportSalesToExcel = (sales) => {
  const data = sales.map(sale => ({
    'Voucher Number': sale.voucherNumber,
    'Date': new Date(sale.saleDate).toLocaleDateString('en-GB'),
    'Customer': sale.customer?.name || '-',
    'Type': sale.billingType.toUpperCase(),
    'Net Weight (g)': parseFloat(sale.totalNetWeight).toFixed(3),
    'Silver Weight (kg)': parseFloat(sale.totalSilverWeight).toFixed(3),
    'Total Amount': parseFloat(sale.totalAmount).toFixed(2),
    'Paid': parseFloat(sale.paidAmount).toFixed(2),
    'Balance': parseFloat(sale.balanceAmount).toFixed(2),
    'Status': sale.status.toUpperCase()
  }));

  const filename = `sales-${new Date().toISOString().split('T')[0]}.xlsx`;
  return exportToExcel(data, filename, 'Sales');
};
