/**
 * Sistema de Importación de Estados de Cuenta
 * 
 * Importa automáticamente estados de cuenta desde Excel
 * y los sincroniza con la base de datos
 */

import * as XLSX from 'xlsx';

export interface ArtistStatementData {
  nombreArtistico: string;
  nombreLegal?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  transacciones: StatementTransaction[];
  resumen: {
    totalIngresos: number;
    totalGastos: number;
    totalAvances: number;
    balanceFinal: number;
  };
}

export interface StatementTransaction {
  fecha: Date;
  concepto: string;
  metodoPago?: string;
  monto: number;
  tipo: 'income' | 'expense' | 'advance' | 'payment';
  categoria?: string;
  cargosBancarios?: number;
  porcentajeFee?: number;
  porcentajeComision?: number;
  porcentajeLegal?: number;
  retencionImpuestos?: number;
  balanceAcumulado?: number;
  notas?: string;
}

export interface ImportResult {
  success: boolean;
  totalArtists: number;
  totalTransactions: number;
  successfulImports: number;
  failedImports: number;
  artistsSummary: Array<{
    artistName: string;
    transactions: number;
    balance: number;
    status: 'success' | 'error';
    error?: string;
  }>;
  errors: string[];
}

/**
 * Procesa un archivo Excel de estados de cuenta
 */
export async function processStatementsExcel(file: File): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalArtists: 0,
    totalTransactions: 0,
    successfulImports: 0,
    failedImports: 0,
    artistsSummary: [],
    errors: []
  };

  try {
    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Procesar cada hoja (cada artista)
    for (const sheetName of workbook.SheetNames) {
      // Saltar hojas de base de datos o modelos
      if (sheetName === 'Base de datos' || sheetName === 'MODELO') {
        continue;
      }

      try {
        const artistData = await processArtistSheet(workbook, sheetName);
        
        result.totalArtists++;
        result.totalTransactions += artistData.transacciones.length;
        
        result.artistsSummary.push({
          artistName: artistData.nombreArtistico,
          transactions: artistData.transacciones.length,
          balance: artistData.resumen.balanceFinal,
          status: 'success'
        });
        
        result.successfulImports++;
      } catch (error) {
        result.failedImports++;
        result.errors.push(`Error procesando ${sheetName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        
        result.artistsSummary.push({
          artistName: sheetName,
          transactions: 0,
          balance: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    result.success = result.successfulImports > 0;
    return result;
  } catch (error) {
    result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return result;
  }
}

/**
 * Procesa una hoja individual de un artista
 */
async function processArtistSheet(
  workbook: XLSX.WorkBook,
  sheetName: string
): Promise<ArtistStatementData> {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const artistData: ArtistStatementData = {
    nombreArtistico: sheetName,
    transacciones: [],
    resumen: {
      totalIngresos: 0,
      totalGastos: 0,
      totalAvances: 0,
      balanceFinal: 0
    }
  };

  // Extraer información del artista (primeras filas)
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (row[1] && row[4]) {
      const label = String(row[1]).toLowerCase();
      const value = row[4];

      if (label.includes('nombre legal')) {
        artistData.nombreLegal = value;
      } else if (label.includes('fecha de inicio') || label.includes('fecha inicio')) {
        artistData.fechaInicio = parseExcelDate(value);
      } else if (label.includes('fecha fin') || label.includes('fecha de finalizacion')) {
        artistData.fechaFin = parseExcelDate(value);
      }
    }
  }

  // Encontrar la fila de encabezados
  let headerRow = -1;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join(' ').toLowerCase();
    if (rowStr.includes('fecha') && rowStr.includes('concepto')) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) {
    throw new Error('No se encontró la fila de encabezados');
  }

  // Procesar transacciones
  const headers = data[headerRow];
  const fechaCol = findColumnIndex(headers, 'fecha');
  const conceptoCol = findColumnIndex(headers, 'concepto');
  const metodoPagoCol = findColumnIndex(headers, 'método de pago', 'metodo pago');
  const balanceCol = findColumnIndex(headers, 'balance');

  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    
    // Verificar que hay una fecha válida
    if (!row[fechaCol]) continue;

    const fecha = parseExcelDate(row[fechaCol]);
    if (!fecha) continue;

    const concepto = String(row[conceptoCol] || '').trim();
    if (!concepto) continue;

    // Determinar tipo de transacción y monto
    const { tipo, monto, categoria } = determineTransactionType(concepto, row);

    const transaction: StatementTransaction = {
      fecha,
      concepto,
      metodoPago: row[metodoPagoCol] ? String(row[metodoPagoCol]) : undefined,
      monto,
      tipo,
      categoria,
      balanceAcumulado: row[balanceCol] ? parseFloat(row[balanceCol]) : undefined
    };

    artistData.transacciones.push(transaction);

    // Actualizar resumen
    if (tipo === 'income') {
      artistData.resumen.totalIngresos += Math.abs(monto);
    } else if (tipo === 'expense') {
      artistData.resumen.totalGastos += Math.abs(monto);
    } else if (tipo === 'advance') {
      artistData.resumen.totalAvances += monto;
    }
  }

  // Balance final
  if (artistData.transacciones.length > 0) {
    const lastTransaction = artistData.transacciones[artistData.transacciones.length - 1];
    artistData.resumen.balanceFinal = lastTransaction.balanceAcumulado || 0;
  }

  return artistData;
}

/**
 * Determina el tipo de transacción basado en el concepto
 */
function determineTransactionType(concepto: string, row: any[]): {
  tipo: 'income' | 'expense' | 'advance' | 'payment';
  monto: number;
  categoria: string;
} {
  const conceptoLower = concepto.toLowerCase();
  
  // Buscar monto en la fila
  let monto = 0;
  for (const cell of row) {
    if (typeof cell === 'number' && cell !== 0) {
      monto = cell;
      break;
    }
  }

  // Determinar tipo
  if (conceptoLower.includes('avance') || conceptoLower.includes('adelanto')) {
    return {
      tipo: 'advance',
      monto: Math.abs(monto),
      categoria: 'Avance'
    };
  } else if (conceptoLower.includes('pago') || conceptoLower.includes('factura')) {
    return {
      tipo: monto > 0 ? 'income' : 'expense',
      monto: Math.abs(monto),
      categoria: conceptoLower.includes('factura') ? 'Factura' : 'Pago por servicios'
    };
  } else if (conceptoLower.includes('gasto') || conceptoLower.includes('viatico')) {
    return {
      tipo: 'expense',
      monto: Math.abs(monto),
      categoria: 'Gastos de producción'
    };
  } else if (conceptoLower.includes('video') || conceptoLower.includes('produccion')) {
    return {
      tipo: 'expense',
      monto: Math.abs(monto),
      categoria: 'Gastos de producción'
    };
  } else {
    // Por defecto, determinar por signo del monto
    return {
      tipo: monto >= 0 ? 'income' : 'expense',
      monto: Math.abs(monto),
      categoria: 'Otros'
    };
  }
}

/**
 * Encuentra el índice de una columna por nombre
 */
function findColumnIndex(headers: any[], ...names: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i] || '').toLowerCase();
    for (const name of names) {
      if (header.includes(name.toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Convierte una fecha de Excel a Date
 */
function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  // Si ya es una fecha
  if (value instanceof Date) {
    return value;
  }

  // Si es un número (fecha de Excel)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }

  // Si es un string
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Guarda los datos procesados en Supabase
 */
export async function saveStatementsToDatabase(
  artistsData: ArtistStatementData[],
  supabase: any,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    totalArtists: artistsData.length,
    totalTransactions: 0,
    successfulImports: 0,
    failedImports: 0,
    artistsSummary: [],
    errors: []
  };

  for (const artistData of artistsData) {
    try {
      // Buscar el artista en la base de datos
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id, name')
        .ilike('name', artistData.nombreArtistico)
        .single();

      if (artistError || !artist) {
        throw new Error(`Artista "${artistData.nombreArtistico}" no encontrado en la base de datos`);
      }

      // Determinar el mes del estado de cuenta
      const statementMonth = artistData.fechaInicio
        ? `${artistData.fechaInicio.getFullYear()}-${String(artistData.fechaInicio.getMonth() + 1).padStart(2, '0')}`
        : new Date().toISOString().slice(0, 7);

      // Crear o actualizar el estado de cuenta
      const { data: statement, error: statementError } = await supabase
        .from('artist_statements')
        .upsert({
          artist_id: artist.id,
          period_start: artistData.fechaInicio,
          period_end: artistData.fechaFin,
          statement_month: statementMonth,
          legal_name: artistData.nombreLegal,
          total_income: artistData.resumen.totalIngresos,
          total_expenses: artistData.resumen.totalGastos,
          total_advances: artistData.resumen.totalAvances,
          balance: artistData.resumen.balanceFinal,
          total_transactions: artistData.transacciones.length,
          last_import_date: new Date().toISOString(),
          import_source: 'excel'
        }, {
          onConflict: 'artist_id,statement_month'
        })
        .select()
        .single();

      if (statementError) {
        throw new Error(`Error guardando estado de cuenta: ${statementError.message}`);
      }

      // Eliminar transacciones anteriores de este periodo
      await supabase
        .from('statement_transactions')
        .delete()
        .eq('statement_id', statement.id);

      // Insertar nuevas transacciones
      const transactionsToInsert = artistData.transacciones.map(t => ({
        statement_id: statement.id,
        artist_id: artist.id,
        transaction_date: t.fecha.toISOString().split('T')[0],
        concept: t.concepto,
        payment_method: t.metodoPago,
        amount: t.monto,
        transaction_type: t.tipo,
        category: t.categoria,
        running_balance: t.balanceAcumulado
      }));

      const { error: transactionsError } = await supabase
        .from('statement_transactions')
        .insert(transactionsToInsert);

      if (transactionsError) {
        throw new Error(`Error guardando transacciones: ${transactionsError.message}`);
      }

      result.totalTransactions += artistData.transacciones.length;
      result.successfulImports++;
      result.artistsSummary.push({
        artistName: artistData.nombreArtistico,
        transactions: artistData.transacciones.length,
        balance: artistData.resumen.balanceFinal,
        status: 'success'
      });
    } catch (error) {
      result.failedImports++;
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      result.errors.push(`${artistData.nombreArtistico}: ${errorMsg}`);
      result.artistsSummary.push({
        artistName: artistData.nombreArtistico,
        transactions: 0,
        balance: 0,
        status: 'error',
        error: errorMsg
      });
    }
  }

  // Registrar la importación
  await supabase.from('statement_imports').insert({
    file_name: 'Estados_de_Cuenta.xlsx',
    total_artists: result.totalArtists,
    total_transactions: result.totalTransactions,
    successful_imports: result.successfulImports,
    failed_imports: result.failedImports,
    import_summary: result.artistsSummary,
    errors: result.errors,
    imported_by: userId
  });

  result.success = result.successfulImports > 0;
  return result;
}
