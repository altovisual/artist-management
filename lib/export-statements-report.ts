import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StatementTransaction {
  id: string;
  transaction_date: string;
  invoice_number: string | null;
  transaction_type_code: string | null;
  payment_method_detail: string | null;
  concept: string;
  invoice_value: number | null;
  bank_charges_amount: number | null;
  country_percentage: number | null;
  commission_20_percentage: number | null;
  legal_5_percentage: number | null;
  tax_retention: number | null;
  mvpx_payment: number | null;
  advance_amount: number | null;
  final_balance: number | null;
  amount: number;
  transaction_type: string;
  category: string | null;
  running_balance: number | null;
}

interface ArtistStatement {
  id: string;
  artist_id: string;
  period_start: string;
  period_end: string | null;
  statement_month: string;
  legal_name: string | null;
  total_income: number;
  total_expenses: number;
  total_advances: number;
  balance: number;
  total_transactions: number;
  artists?: {
    name: string;
    profile_image?: string;
  };
}

interface StatementsReportData {
  statements: ArtistStatement[];
  selectedStatement?: ArtistStatement;
  transactions?: StatementTransaction[];
  totalIncome: number;
  totalExpenses: number;
  totalAdvances: number;
  totalBalance: number;
  filterArtist?: string;
  filterMonth?: string;
}

export function exportStatementsReport(data: StatementsReportData) {
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // HOJA 1: RESUMEN EJECUTIVO
  // ==========================================
  const summaryData = [
    ['ARTIST MANAGEMENT SYSTEM'],
    ['Estados de Cuenta - Financial Statements Report'],
    [''],
    ['Generated:', new Date().toLocaleString('es-ES', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })],
    data.filterArtist ? ['Artist Filter:', data.filterArtist] : [],
    data.filterMonth ? ['Period Filter:', new Date(data.filterMonth + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })] : [],
    [''],
    ['RESUMEN EJECUTIVO'],
    [''],
    ['Métrica', 'Monto'],
    ['Ingresos Totales', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Gastos Totales', `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Avances Totales', `$${Math.abs(data.totalAdvances).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Balance Total', `$${data.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    [''],
    ['ESTADÍSTICAS'],
    [''],
    ['Total de Estados de Cuenta', data.statements.length],
    ['Total de Transacciones', data.statements.reduce((sum, s) => sum + s.total_transactions, 0)],
    ['Promedio por Estado', `$${(data.totalBalance / data.statements.length || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
  ].filter(row => row.length > 0);

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet['!cols'] = [
    { wch: 30 },
    { wch: 25 }
  ];

  summarySheet['!rows'] = [
    { hpt: 30 },
    { hpt: 25 },
  ];

  // ==========================================
  // HOJA 2: TODOS LOS ESTADOS DE CUENTA
  // ==========================================
  const statementsHeaders = [
    'Artista',
    'Nombre Legal',
    'Mes',
    'Inicio Periodo',
    'Fin Periodo',
    'Ingresos',
    'Gastos',
    'Avances',
    'Balance',
    'Transacciones'
  ];

  const statementsRows = data.statements
    .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
    .map(s => [
      s.artists?.name || 'Unknown',
      s.legal_name || 'N/A',
      new Date(s.statement_month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
      new Date(s.period_start).toLocaleDateString('es-ES'),
      s.period_end ? new Date(s.period_end).toLocaleDateString('es-ES') : 'N/A',
      `$${s.total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${s.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${Math.abs(s.total_advances).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${s.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      s.total_transactions
    ]);

  const statementsData = [
    ['TODOS LOS ESTADOS DE CUENTA'],
    [''],
    statementsHeaders,
    ...statementsRows,
    [''],
    ['', '', '', '', 'TOTALES:', '', '', '', '', ''],
    ['', '', '', '', 'Ingresos:', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '', '', '', ''],
    ['', '', '', '', 'Gastos:', `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '', '', '', ''],
    ['', '', '', '', 'Avances:', `$${Math.abs(data.totalAdvances).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '', '', '', ''],
    ['', '', '', '', 'Balance:', `$${data.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '', '', '', ''],
  ];

  const statementsSheet = XLSX.utils.aoa_to_sheet(statementsData);

  statementsSheet['!cols'] = [
    { wch: 20 }, // Artista
    { wch: 25 }, // Nombre Legal
    { wch: 18 }, // Mes
    { wch: 15 }, // Inicio
    { wch: 15 }, // Fin
    { wch: 15 }, // Ingresos
    { wch: 15 }, // Gastos
    { wch: 15 }, // Avances
    { wch: 15 }, // Balance
    { wch: 12 }  // Transacciones
  ];

  // ==========================================
  // HOJA 3: DETALLE DE TRANSACCIONES (si hay un statement seleccionado)
  // ==========================================
  if (data.selectedStatement && data.transactions && data.transactions.length > 0) {
    const transactionHeaders = [
      'Fecha',
      'Número',
      'Tipo',
      'Método Pago',
      'Concepto',
      'Valor Factura',
      'Cargos Banc.',
      '80% País',
      '20% Comisión',
      '5% Legal',
      'Retención IVA',
      'Pagado MVPX',
      'Avance',
      'Balance Final'
    ];

    const transactionRows = data.transactions
      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
      .map(t => [
        new Date(t.transaction_date).toLocaleDateString('es-ES'),
        t.invoice_number || '—',
        t.transaction_type_code || '—',
        t.payment_method_detail || '—',
        t.concept,
        t.invoice_value ? `$${t.invoice_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.bank_charges_amount ? `$${t.bank_charges_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.country_percentage ? `$${t.country_percentage.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.commission_20_percentage ? `$${t.commission_20_percentage.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.legal_5_percentage ? `$${t.legal_5_percentage.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.tax_retention ? `$${t.tax_retention.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.mvpx_payment ? `$${t.mvpx_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.advance_amount ? `$${t.advance_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
        t.final_balance !== null ? `$${t.final_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'
      ]);

    const transactionData = [
      [`DETALLE DE TRANSACCIONES - ${data.selectedStatement.artists?.name}`],
      [`Periodo: ${new Date(data.selectedStatement.statement_month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}`],
      [''],
      transactionHeaders,
      ...transactionRows,
      [''],
      ['', '', '', '', 'TOTALES:', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', 'Ingresos:', `$${data.selectedStatement.total_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '', '', '', '', '', '', '', ''],
      ['', '', '', '', 'Gastos:', `$${data.selectedStatement.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '', '', '', '', '', '', '', ''],
      ['', '', '', '', 'Balance:', `$${data.selectedStatement.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '', '', '', '', '', '', '', ''],
    ];

    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);

    transactionSheet['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Número
      { wch: 10 }, // Tipo
      { wch: 15 }, // Método Pago
      { wch: 35 }, // Concepto
      { wch: 15 }, // Valor Factura
      { wch: 13 }, // Cargos Banc.
      { wch: 13 }, // 80% País
      { wch: 13 }, // 20% Comisión
      { wch: 12 }, // 5% Legal
      { wch: 14 }, // Retención IVA
      { wch: 13 }, // Pagado MVPX
      { wch: 12 }, // Avance
      { wch: 15 }  // Balance Final
    ];

    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Detalle Transacciones');
  }

  // ==========================================
  // HOJA 4: ANÁLISIS POR ARTISTA
  // ==========================================
  const artistAnalysis = new Map<string, {
    statements: number;
    income: number;
    expenses: number;
    advances: number;
    balance: number;
    transactions: number;
  }>();

  data.statements.forEach(s => {
    const artist = s.artists?.name || 'Unknown';
    const current = artistAnalysis.get(artist) || {
      statements: 0,
      income: 0,
      expenses: 0,
      advances: 0,
      balance: 0,
      transactions: 0
    };

    current.statements += 1;
    current.income += s.total_income;
    current.expenses += s.total_expenses;
    current.advances += s.total_advances;
    current.balance += s.balance;
    current.transactions += s.total_transactions;

    artistAnalysis.set(artist, current);
  });

  const artistRows = Array.from(artistAnalysis.entries())
    .sort((a, b) => b[1].balance - a[1].balance)
    .map(([artist, data]) => [
      artist,
      data.statements,
      data.transactions,
      `$${data.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${data.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${Math.abs(data.advances).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${(data.balance / data.statements).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ]);

  const artistData = [
    ['ANÁLISIS POR ARTISTA'],
    [''],
    ['Artista', 'Estados', 'Transacciones', 'Ingresos', 'Gastos', 'Avances', 'Balance', 'Promedio/Estado'],
    ...artistRows
  ];

  const artistSheet = XLSX.utils.aoa_to_sheet(artistData);

  artistSheet['!cols'] = [
    { wch: 25 }, // Artista
    { wch: 10 }, // Estados
    { wch: 15 }, // Transacciones
    { wch: 15 }, // Ingresos
    { wch: 15 }, // Gastos
    { wch: 15 }, // Avances
    { wch: 15 }, // Balance
    { wch: 18 }  // Promedio
  ];

  // ==========================================
  // HOJA 5: ANÁLISIS POR MES
  // ==========================================
  const monthAnalysis = new Map<string, {
    statements: number;
    income: number;
    expenses: number;
    advances: number;
    balance: number;
  }>();

  data.statements.forEach(s => {
    const month = s.statement_month;
    const current = monthAnalysis.get(month) || {
      statements: 0,
      income: 0,
      expenses: 0,
      advances: 0,
      balance: 0
    };

    current.statements += 1;
    current.income += s.total_income;
    current.expenses += s.total_expenses;
    current.advances += s.total_advances;
    current.balance += s.balance;

    monthAnalysis.set(month, current);
  });

  const monthRows = Array.from(monthAnalysis.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, data]) => [
      new Date(month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
      data.statements,
      `$${data.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${data.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${Math.abs(data.advances).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `$${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ]);

  const monthData = [
    ['ANÁLISIS POR MES'],
    [''],
    ['Mes', 'Estados', 'Ingresos', 'Gastos', 'Avances', 'Balance'],
    ...monthRows
  ];

  const monthSheet = XLSX.utils.aoa_to_sheet(monthData);

  monthSheet['!cols'] = [
    { wch: 20 }, // Mes
    { wch: 10 }, // Estados
    { wch: 15 }, // Ingresos
    { wch: 15 }, // Gastos
    { wch: 15 }, // Avances
    { wch: 15 }  // Balance
  ];

  // Agregar hojas al workbook
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Ejecutivo');
  XLSX.utils.book_append_sheet(workbook, statementsSheet, 'Estados de Cuenta');
  XLSX.utils.book_append_sheet(workbook, artistSheet, 'Análisis por Artista');
  XLSX.utils.book_append_sheet(workbook, monthSheet, 'Análisis por Mes');

  // Generar y descargar el archivo
  const fileName = `Statements_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return fileName;
}

/**
 * Exporta el reporte de estados de cuenta a PDF con logo de la empresa
 */
export function exportStatementsReportToPDF(data: StatementsReportData, companyLogo?: string) {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
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
    doc.setTextColor(30, 41, 59);
    doc.text('Estados de Cuenta', companyLogo ? 50 : 14, companyLogo ? 25 : currentY);

    // Información del reporte
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const infoY = companyLogo ? 35 : currentY + 8;
    doc.text(`Generado: ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}`, companyLogo ? 50 : 14, infoY);
    
    if (data.filterArtist) {
      doc.text(`Artista: ${data.filterArtist}`, companyLogo ? 50 : 14, infoY + 5);
    }
    
    if (data.filterMonth) {
      const monthText = new Date(data.filterMonth + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      doc.text(`Periodo: ${monthText}`, companyLogo ? 50 : 14, infoY + (data.filterArtist ? 10 : 5));
    }

    currentY = companyLogo ? 55 : currentY + 25;

    // ==========================================
    // RESUMEN EJECUTIVO
    // ==========================================
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Resumen Ejecutivo', 14, currentY);
    currentY += 10;

    const summaryData = [
      ['Ingresos Totales', `$${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Gastos Totales', `$${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Avances Totales', `$${Math.abs(data.totalAdvances).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Balance Total', `$${data.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Métrica', 'Monto']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 130, fontStyle: 'bold' },
        1: { cellWidth: 130, halign: 'right', fontStyle: 'bold', textColor: data.totalBalance >= 0 ? [22, 163, 74] : [220, 38, 38] }
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
    doc.text('Estadísticas', 14, currentY);
    currentY += 8;

    const totalTransactions = data.statements.reduce((sum, s) => sum + s.total_transactions, 0);
    const avgPerStatement = data.statements.length > 0 ? data.totalBalance / data.statements.length : 0;

    const statsData = [
      ['Total de Estados de Cuenta', data.statements.length.toString()],
      ['Total de Transacciones', totalTransactions.toString()],
      ['Promedio por Estado', `$${avgPerStatement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
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
        0: { cellWidth: 130 },
        1: { cellWidth: 130, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Nueva página si es necesario
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }

    // ==========================================
    // ESTADOS DE CUENTA
    // ==========================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Estados de Cuenta', 14, currentY);
    currentY += 8;

    const statementsRows = data.statements
      .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
      .map(s => [
        s.artists?.name || 'Unknown',
        new Date(s.statement_month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }),
        new Date(s.period_start).toLocaleDateString('es-ES'),
        `$${s.total_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `$${s.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `$${Math.abs(s.total_advances).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `$${s.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        s.total_transactions.toString()
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Artista', 'Mes', 'Inicio', 'Ingresos', 'Gastos', 'Avances', 'Balance', 'Trans.']],
      body: statementsRows,
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
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 22 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 18, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // ==========================================
    // DETALLE DE TRANSACCIONES (si hay un statement seleccionado)
    // ==========================================
    if (data.selectedStatement && data.transactions && data.transactions.length > 0) {
      // Nueva página
      doc.addPage();
      currentY = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Detalle de Transacciones - ${data.selectedStatement.artists?.name}`, 14, currentY);
      currentY += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const monthText = new Date(data.selectedStatement.statement_month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      doc.text(`Periodo: ${monthText}`, 14, currentY);
      currentY += 10;

      const transactionRows = data.transactions
        .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
        .map(t => [
          new Date(t.transaction_date).toLocaleDateString('es-ES'),
          t.invoice_number || '—',
          t.concept.substring(0, 30) + (t.concept.length > 30 ? '...' : ''),
          t.invoice_value ? `$${t.invoice_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
          t.mvpx_payment ? `$${t.mvpx_payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
          t.advance_amount ? `$${t.advance_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
          t.final_balance !== null ? `$${t.final_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'
        ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Fecha', 'Número', 'Concepto', 'Valor', 'Pagado', 'Avance', 'Balance']],
        body: transactionRows,
        theme: 'grid',
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
          1: { cellWidth: 22 },
          2: { cellWidth: 70 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
          6: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });
    }

    // ==========================================
    // PIE DE PÁGINA
    // ==========================================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} | Artist Management System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Guardar archivo
    const fileName = `Statements_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return fileName;
  } catch (error) {
    console.error('Error exporting statements report to PDF:', error);
    throw error;
  }
}
