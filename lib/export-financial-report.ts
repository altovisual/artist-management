import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  created_at: string;
  artist_id: string;
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
  type: 'income' | 'expense';
  artists?: { name: string };
  transaction_categories?: { name: string; type: string };
}

interface ReportData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  dateRange?: {
    start: string;
    end: string;
  };
  artistName?: string;
}

export function exportFinancialReport(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // HOJA 1: RESUMEN EJECUTIVO
  // ==========================================
  const summaryData = [
    ['ARTIST MANAGEMENT SYSTEM'],
    ['Financial Report'],
    [''],
    ['Generated:', new Date().toLocaleString('es-ES', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })],
    data.dateRange ? ['Period:', `${data.dateRange.start} - ${data.dateRange.end}`] : [],
    data.artistName ? ['Artist:', data.artistName] : ['Artist:', 'All Artists'],
    [''],
    ['EXECUTIVE SUMMARY'],
    [''],
    ['Metric', 'Amount'],
    ['Total Income', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Total Expenses', `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Net Balance', `$${data.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    [''],
    ['STATISTICS'],
    [''],
    ['Total Transactions', data.transactions.length],
    ['Income Transactions', data.transactions.filter(t => t.type === 'income').length],
    ['Expense Transactions', data.transactions.filter(t => t.type === 'expense').length],
    ['Average Transaction', `$${(data.transactions.reduce((sum, t) => sum + t.amount, 0) / data.transactions.length || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ].filter(row => row.length > 0);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Estilos para la hoja de resumen
  summarySheet['!cols'] = [
    { wch: 25 }, // Columna A
    { wch: 30 }  // Columna B
  ];

  summarySheet['!rows'] = [
    { hpt: 30 }, // Fila 1 - Título principal
    { hpt: 25 }, // Fila 2 - Subtítulo
  ];

  // ==========================================
  // HOJA 2: DETALLE DE TRANSACCIONES
  // ==========================================
  const transactionHeaders = [
    'Date',
    'Artist',
    'Category',
    'Description',
    'Type',
    'Amount',
    'Running Balance'
  ];

  let runningBalance = 0;
  const transactionRows = data.transactions
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
    .map(t => {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      runningBalance += amount;
      
      return [
        new Date(t.transaction_date).toLocaleDateString('es-ES'),
        t.artists?.name || 'Unknown',
        t.transaction_categories?.name || 'N/A',
        t.description || '-',
        t.type === 'income' ? 'Income' : 'Expense',
        t.type === 'income' 
          ? `$${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `-$${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ];
    });

  const transactionData = [
    ['TRANSACTION DETAILS'],
    [''],
    transactionHeaders,
    ...transactionRows,
    [''],
    ['', '', '', '', 'TOTALS:', '', ''],
    ['', '', '', '', 'Total Income:', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, ''],
    ['', '', '', '', 'Total Expenses:', `-$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, ''],
    ['', '', '', '', 'Net Balance:', `$${data.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, ''],
  ];

  const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);

  // Anchos de columna para transacciones
  transactionSheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Artist
    { wch: 18 }, // Category
    { wch: 35 }, // Description
    { wch: 10 }, // Type
    { wch: 15 }, // Amount
    { wch: 18 }  // Running Balance
  ];

  // ==========================================
  // HOJA 3: ANÁLISIS POR CATEGORÍA
  // ==========================================
  const categoryAnalysis = new Map<string, { income: number; expense: number; count: number }>();
  
  data.transactions.forEach(t => {
    const category = t.transaction_categories?.name || 'Uncategorized';
    const current = categoryAnalysis.get(category) || { income: 0, expense: 0, count: 0 };
    
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
    current.count += 1;
    
    categoryAnalysis.set(category, current);
  });

  const categoryRows = Array.from(categoryAnalysis.entries())
    .sort((a, b) => (b[1].income + b[1].expense) - (a[1].income + a[1].expense))
    .map(([category, data]) => [
      category,
      data.count,
      `$${data.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${data.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${(data.income - data.expense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

  const categoryData = [
    ['CATEGORY ANALYSIS'],
    [''],
    ['Category', 'Transactions', 'Income', 'Expenses', 'Net'],
    ...categoryRows
  ];

  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);

  categorySheet['!cols'] = [
    { wch: 25 }, // Category
    { wch: 15 }, // Transactions
    { wch: 18 }, // Income
    { wch: 18 }, // Expenses
    { wch: 18 }  // Net
  ];

  // ==========================================
  // HOJA 4: ANÁLISIS POR ARTISTA (si hay múltiples)
  // ==========================================
  const artistAnalysis = new Map<string, { income: number; expense: number; count: number }>();
  
  data.transactions.forEach(t => {
    const artist = t.artists?.name || 'Unknown';
    const current = artistAnalysis.get(artist) || { income: 0, expense: 0, count: 0 };
    
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
    current.count += 1;
    
    artistAnalysis.set(artist, current);
  });

  if (artistAnalysis.size > 1) {
    const artistRows = Array.from(artistAnalysis.entries())
      .sort((a, b) => (b[1].income - b[1].expense) - (a[1].income - a[1].expense))
      .map(([artist, data]) => [
        artist,
        data.count,
        `$${data.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${data.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${(data.income - data.expense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

    const artistData = [
      ['ARTIST ANALYSIS'],
      [''],
      ['Artist', 'Transactions', 'Income', 'Expenses', 'Net Balance'],
      ...artistRows
    ];

    const artistSheet = XLSX.utils.aoa_to_sheet(artistData);

    artistSheet['!cols'] = [
      { wch: 25 }, // Artist
      { wch: 15 }, // Transactions
      { wch: 18 }, // Income
      { wch: 18 }, // Expenses
      { wch: 18 }  // Net Balance
    ];

    XLSX.utils.book_append_sheet(workbook, artistSheet, 'Artist Analysis');
  }

  // Agregar hojas al workbook
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');
  XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Analysis');

  // Generar y descargar el archivo
  const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return fileName;
}
