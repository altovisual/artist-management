/**
 * API Route para importar estados de cuenta
 * 
 * POST /api/statements/import
 * 
 * Seguridad:
 * - Solo admins pueden importar
 * - Usa service_role key para bypass RLS
 * - Valida el archivo Excel antes de procesar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Función helper para crear cliente admin
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Función helper para crear cliente normal
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface ArtistData {
  nombreArtistico: string;
  nombreLegal?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  transacciones: Transaction[];
  resumen: {
    totalIngresos: number;
    totalGastos: number;
    totalAvances: number;
    balanceFinal: number;
  };
}

interface Transaction {
  fecha: Date;
  concepto: string;
  monto: number;
  tipo: 'income' | 'expense' | 'advance' | 'payment';
  categoria: string;
  balanceAcumulado?: number;
  invoiceNumber?: string;
  transactionTypeCode?: string;
  paymentMethod?: string;
  invoiceValue?: number;
  bankCharges?: number;
  countryPercentage?: number;
  commission20?: number;
  legal5?: number;
  taxRetention?: number;
  mvpxPayment?: number;
  advanceAmount?: number;
  finalBalance?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Crear clientes de Supabase
    const supabaseClient = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // 2. Verificar que el usuario sea admin (por ahora, cualquier usuario autenticado)
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // 3. Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // 4. Validar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
        { status: 400 }
      );
    }

    // 5. Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 6. Procesar cada hoja (cada artista)
    const results = {
      totalArtistas: 0,
      totalTransacciones: 0,
      exitosos: 0,
      fallidos: 0,
      detalles: [] as any[]
    };

    for (const sheetName of workbook.SheetNames) {
      // Saltar hojas de base de datos o modelos
      if (sheetName === 'Base de datos' || sheetName === 'MODELO') {
        continue;
      }

      results.totalArtistas++;

      try {
        const artistData = processArtistSheet(workbook, sheetName);
        
        // Buscar o crear el artista
        let { data: artist, error: artistError } = await supabaseAdmin
          .from('artists')
          .select('id, name')
          .ilike('name', artistData.nombreArtistico)
          .single();

        if (artistError || !artist) {
          // Crear el artista si no existe
          const { data: newArtist, error: createError} = await supabaseAdmin
            .from('artists')
            .insert({
              name: artistData.nombreArtistico,
              legal_name: artistData.nombreLegal,
              genre: 'Unknown',
              country: 'US', // País por defecto
              user_id: user.id // Asociar con el usuario que importa
            })
            .select()
            .single();

          if (createError || !newArtist) {
            throw new Error(`No se pudo crear el artista: ${createError?.message}`);
          }

          artist = newArtist;
        }

        // Guardar el estado de cuenta
        await saveArtistStatement(supabaseAdmin, artist.id, artistData, user.id);

        results.exitosos++;
        results.totalTransacciones += artistData.transacciones.length;
        results.detalles.push({
          artista: artistData.nombreArtistico,
          transacciones: artistData.transacciones.length,
          balance: artistData.resumen.balanceFinal,
          status: 'success'
        });

      } catch (error) {
        results.fallidos++;
        results.detalles.push({
          artista: sheetName,
          error: error instanceof Error ? error.message : 'Error desconocido',
          status: 'error'
        });
      }
    }

    // 7. Registrar la importación
    await supabaseAdmin.from('statement_imports').insert({
      file_name: file.name,
      file_size: file.size,
      total_artists: results.totalArtistas,
      total_transactions: results.totalTransacciones,
      successful_imports: results.exitosos,
      failed_imports: results.fallidos,
      import_summary: results.detalles,
      imported_by: user.id
    });

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Error en importación:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Funciones auxiliares (mismas que en el script)
function processArtistSheet(workbook: XLSX.WorkBook, sheetName: string): ArtistData {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  const artistData: ArtistData = {
    nombreArtistico: sheetName,
    transacciones: [],
    resumen: {
      totalIngresos: 0,
      totalGastos: 0,
      totalAvances: 0,
      balanceFinal: 0
    }
  };

  // Extraer información del artista
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (row[1] && row[4]) {
      const label = String(row[1]).toLowerCase();
      const value = row[4];

      if (label.includes('nombre legal')) {
        artistData.nombreLegal = value;
      } else if (label.includes('fecha de inicio') || label.includes('fecha inicio')) {
        const fecha = parseExcelDate(value);
        if (fecha) artistData.fechaInicio = fecha;
      } else if (label.includes('fecha fin') || label.includes('fecha de finalizacion')) {
        const fecha = parseExcelDate(value);
        if (fecha) artistData.fechaFin = fecha;
      }
    }
  }

  // Encontrar encabezados y procesar transacciones
  let headerRow = -1;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join(' ').toLowerCase();
    if (rowStr.includes('fecha') && rowStr.includes('concepto')) {
      headerRow = i;
      break;
    }
  }

  if (headerRow !== -1) {
    const headers = data[headerRow].map((h: any) => String(h || '').toLowerCase().trim());
    
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      
      // Extraer fecha
      let fecha: Date | null = null;
      for (let col = 0; col < 5; col++) {
        fecha = parseExcelDate(row[col]);
        if (fecha) break;
      }
      
      if (!fecha) continue;

      // Extraer concepto
      let concepto = '';
      const conceptoIdx = headers.findIndex(h => h.includes('concepto'));
      if (conceptoIdx >= 0 && row[conceptoIdx]) {
        concepto = String(row[conceptoIdx]).trim();
      } else {
        for (let col = 0; col < row.length; col++) {
          if (row[col] && typeof row[col] === 'string' && row[col].length > 5) {
            concepto = String(row[col]).trim();
            break;
          }
        }
      }

      if (!concepto) continue;

      // Extraer todos los campos numéricos
      const getNumericValue = (headerName: string): number | undefined => {
        const idx = headers.findIndex(h => h.includes(headerName));
        if (idx >= 0 && typeof row[idx] === 'number') {
          return row[idx];
        }
        return undefined;
      };

      const invoiceNumber = row[headers.findIndex(h => h.includes('factura') && h.includes('nº'))] || undefined;
      const transactionTypeCode = row[headers.findIndex(h => h.includes('tipo'))] || undefined;
      const paymentMethod = row[headers.findIndex(h => h.includes('método') || h.includes('metodo'))] || undefined;
      
      const invoiceValue = getNumericValue('valor factura') || getNumericValue('valor');
      const bankCharges = getNumericValue('cargo') || getNumericValue('cargos banc');
      const countryPercentage = getNumericValue('80%') || getNumericValue('país');
      const commission20 = getNumericValue('20%') || getNumericValue('comisión');
      const legal5 = getNumericValue('5%') || getNumericValue('legal');
      const taxRetention = getNumericValue('retención') || getNumericValue('iva');
      const mvpxPayment = getNumericValue('pagado') || getNumericValue('mvpx');
      const advanceAmount = getNumericValue('avance');
      const finalBalance = getNumericValue('balance');

      // Calcular monto principal (usar invoice_value o buscar el primer valor numérico significativo)
      let monto = invoiceValue || 0;
      if (monto === 0) {
        for (let col = row.length - 1; col >= 0; col--) {
          if (typeof row[col] === 'number' && row[col] !== 0 && col !== headers.findIndex(h => h.includes('balance'))) {
            monto = Math.abs(row[col]);
            break;
          }
        }
      }

      if (monto === 0) continue;

      const { tipo, categoria } = determineTransactionType(concepto);

      artistData.transacciones.push({
        fecha,
        concepto,
        monto,
        tipo,
        categoria,
        balanceAcumulado: finalBalance,
        invoiceNumber: invoiceNumber ? String(invoiceNumber) : undefined,
        transactionTypeCode: transactionTypeCode ? String(transactionTypeCode) : undefined,
        paymentMethod: paymentMethod ? String(paymentMethod) : undefined,
        invoiceValue,
        bankCharges,
        countryPercentage,
        commission20,
        legal5,
        taxRetention,
        mvpxPayment,
        advanceAmount,
        finalBalance
      });

      if (tipo === 'income') {
        artistData.resumen.totalIngresos += monto;
      } else if (tipo === 'expense') {
        artistData.resumen.totalGastos += monto;
      } else if (tipo === 'advance') {
        artistData.resumen.totalAvances += monto;
      }
    }

    if (artistData.transacciones.length > 0) {
      const lastTransaction = artistData.transacciones[artistData.transacciones.length - 1];
      artistData.resumen.balanceFinal = lastTransaction.balanceAcumulado || 0;
    }
  }

  return artistData;
}

function determineTransactionType(concepto: string): {
  tipo: 'income' | 'expense' | 'advance' | 'payment';
  categoria: string;
} {
  const conceptoLower = concepto.toLowerCase();
  
  if (conceptoLower.includes('avance') || conceptoLower.includes('adelanto')) {
    return { tipo: 'advance', categoria: 'Avance' };
  } else if (conceptoLower.includes('factura')) {
    return { tipo: 'income', categoria: 'Factura' };
  } else if (conceptoLower.includes('pago')) {
    return { tipo: 'expense', categoria: 'Pago por servicios' };
  } else if (conceptoLower.includes('gasto') || conceptoLower.includes('viatico')) {
    return { tipo: 'expense', categoria: 'Gastos de producción' };
  } else if (conceptoLower.includes('video') || conceptoLower.includes('produccion')) {
    return { tipo: 'expense', categoria: 'Gastos de producción' };
  } else {
    return { tipo: 'income', categoria: 'Otros' };
  }
}

function parseExcelDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
}

async function saveArtistStatement(supabaseAdmin: any, artistId: string, artistData: ArtistData, userId: string) {
  // Usar fecha actual si no hay fechaInicio
  const now = new Date();
  const fechaInicio = artistData.fechaInicio || new Date(now.getFullYear(), now.getMonth(), 1);
  const fechaFin = artistData.fechaFin || new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const statementMonth = `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}`;

  const { data: statement, error: statementError } = await supabaseAdmin
    .from('artist_statements')
    .upsert({
      artist_id: artistId,
      period_start: fechaInicio.toISOString().split('T')[0],
      period_end: fechaFin.toISOString().split('T')[0],
      statement_month: statementMonth,
      legal_name: artistData.nombreLegal,
      total_income: artistData.resumen.totalIngresos,
      total_expenses: artistData.resumen.totalGastos,
      total_advances: artistData.resumen.totalAvances,
      balance: artistData.resumen.balanceFinal,
      total_transactions: artistData.transacciones.length,
      last_import_date: new Date().toISOString(),
      import_source: 'api'
    }, {
      onConflict: 'artist_id,statement_month'
    })
    .select()
    .single();

  if (statementError) {
    throw new Error(`Error guardando estado de cuenta: ${statementError.message}`);
  }

  await supabaseAdmin
    .from('statement_transactions')
    .delete()
    .eq('statement_id', statement.id);

  const batchSize = 100;
  for (let i = 0; i < artistData.transacciones.length; i += batchSize) {
    const batch = artistData.transacciones.slice(i, i + batchSize);
    
    const transactionsToInsert = batch.map(t => ({
      statement_id: statement.id,
      artist_id: artistId,
      transaction_date: t.fecha.toISOString().split('T')[0],
      concept: t.concepto,
      amount: t.monto,
      transaction_type: t.tipo,
      category: t.categoria,
      running_balance: t.balanceAcumulado,
      invoice_number: t.invoiceNumber,
      transaction_type_code: t.transactionTypeCode,
      payment_method_detail: t.paymentMethod,
      invoice_value: t.invoiceValue,
      bank_charges_amount: t.bankCharges,
      country_percentage: t.countryPercentage,
      commission_20_percentage: t.commission20,
      legal_5_percentage: t.legal5,
      tax_retention: t.taxRetention,
      mvpx_payment: t.mvpxPayment,
      advance_amount: t.advanceAmount,
      final_balance: t.finalBalance
    }));

    const { error: transactionsError } = await supabaseAdmin
      .from('statement_transactions')
      .insert(transactionsToInsert);

    if (transactionsError) {
      throw new Error(`Error guardando transacciones: ${transactionsError.message}`);
    }
  }
}
