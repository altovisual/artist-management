import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

/**
 * Exporta el reporte financiero a PDF con logo de la empresa
 */
export function exportFinancialReportToPDF(data: ReportData, companyLogo?: string) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    // ==========================================
    // HEADER CON LOGO
    // ==========================================
    if (companyLogo) {
      try {
        // Agregar logo (si está disponible)
        doc.addImage(companyLogo, 'PNG', 14, 10, 30, 30);
        currentY = 45;
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
        currentY = 20;
      }
    }

    // Título principal
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Financial Report', companyLogo ? 50 : 14, companyLogo ? 25 : currentY);

    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    const infoY = companyLogo ? 35 : currentY + 8;
    doc.text(`Generated: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`, companyLogo ? 50 : 14, infoY);
    
    if (data.dateRange) {
      doc.text(`Period: ${data.dateRange.start} - ${data.dateRange.end}`, companyLogo ? 50 : 14, infoY + 5);
    }
    
    const artistText = data.artistName || 'All Artists';
    doc.text(`Artist: ${artistText}`, companyLogo ? 50 : 14, infoY + (data.dateRange ? 10 : 5));

    currentY = companyLogo ? 55 : currentY + 25;

    // ==========================================
    // RESUMEN EJECUTIVO
    // ==========================================
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Executive Summary', 14, currentY);
    currentY += 10;

    // Tabla de resumen
    const summaryData = [
      ['Total Income', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Total Expenses', `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Net Balance', `$${data.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 82, halign: 'right', fontStyle: 'bold', textColor: data.netBalance >= 0 ? [22, 163, 74] : [220, 38, 38] }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // ==========================================
    // ESTADÍSTICAS
    // ==========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Statistics', 14, currentY);
    currentY += 8;

    const statsData = [
      ['Total Transactions', data.transactions.length.toString()],
      ['Income Transactions', data.transactions.filter(t => t.type === 'income').length.toString()],
      ['Expense Transactions', data.transactions.filter(t => t.type === 'expense').length.toString()],
      ['Average Transaction', `$${(data.transactions.reduce((sum, t) => sum + t.amount, 0) / data.transactions.length || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ];

    autoTable(doc, {
      startY: currentY,
      body: statsData,
      theme: 'plain',
      bodyStyles: {
        fontSize: 9,
        textColor: [71, 85, 105]
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 82, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Nueva página para transacciones
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    // ==========================================
    // DETALLE DE TRANSACCIONES
    // ==========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Transaction Details', 14, currentY);
    currentY += 8;

    const transactionRows = data.transactions
      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
      .map(t => [
        new Date(t.transaction_date).toLocaleDateString('es-ES'),
        t.artists?.name || 'Unknown',
        t.transaction_categories?.name || 'N/A',
        t.description || '-',
        t.type === 'income' ? 'Income' : 'Expense',
        t.type === 'income' 
          ? `$${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `-$${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Artist', 'Category', 'Description', 'Type', 'Amount']],
      body: transactionRows,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 28 },
        2: { cellWidth: 28 },
        3: { cellWidth: 45 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Nueva página para análisis por categoría si es necesario
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    // ==========================================
    // ANÁLISIS POR CATEGORÍA
    // ==========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Category Analysis', 14, currentY);
    currentY += 8;

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
        data.count.toString(),
        `$${data.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${data.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${(data.income - data.expense).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Category', 'Count', 'Income', 'Expenses', 'Net']],
      body: categoryRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    // ==========================================
    // PIE DE PÁGINA EN TODAS LAS PÁGINAS
    // ==========================================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} | Artist Management System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Guardar archivo
    const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return fileName;
  } catch (error) {
    console.error('Error exporting financial report to PDF:', error);
    throw error;
  }
}
