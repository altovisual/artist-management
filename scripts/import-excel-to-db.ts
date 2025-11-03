/**
 * Script para importar Estados_de_Cuenta.xlsx a la base de datos
 * 
 * Uso: npx tsx scripts/import-excel-to-db.ts
 */

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Usar SERVICE_ROLE_KEY para bypass RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('📝 Asegúrate de tener .env.local con:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=tu_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key');
  console.error('');
  console.error('💡 Obtén tu SERVICE_ROLE_KEY en:');
  console.error('   Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

console.log('🔑 Usando Supabase con permisos de administrador...\n');
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
  numeroFactura?: string;
  tipo?: string;
  metodoPago?: string;
  concepto: string;
  valorFactura?: number;
  cargosBancarios?: number;
  porcentajePais?: number;      // 80% País
  porcentajeComision?: number;  // 20% Comisión
  porcentajeLegal?: number;     // 5% Legal
  retencionIVA?: number;
  pagadoPorMVPX?: number;
  avance?: number;
  balance?: number;
  monto: number;
  tipoTransaccion: 'income' | 'expense' | 'advance' | 'payment';
  categoria: string;
  balanceAcumulado?: number;
}

async function importExcelToDatabase() {
  console.log('🚀 Iniciando importación de Estados de Cuenta...\n');

  try {
    // Leer el archivo Excel
    const filePath = path.join(process.cwd(), 'Estados_de_Cuenta.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Error: No se encontró el archivo Estados_de_Cuenta.xlsx');
      console.log('📁 Asegúrate de que el archivo esté en la raíz del proyecto');
      return;
    }

    console.log('📖 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(filePath);
    
    let totalArtistas = 0;
    let totalTransacciones = 0;
    let exitosos = 0;
    let fallidos = 0;

    // Procesar cada hoja (cada artista)
    for (const sheetName of workbook.SheetNames) {
      // Saltar hojas de base de datos o modelos
      if (sheetName === 'Base de datos' || sheetName === 'MODELO') {
        continue;
      }

      totalArtistas++;
      console.log(`\n📊 Procesando: ${sheetName}`);

      try {
        const artistData = processArtistSheet(workbook, sheetName);
        
        // Buscar el artista en la base de datos
        const { data: artist, error: artistError } = await supabase
          .from('artists')
          .select('id, name')
          .ilike('name', artistData.nombreArtistico)
          .single();

        if (artistError || !artist) {
          console.log(`   ⚠️  Artista "${artistData.nombreArtistico}" no encontrado en BD - Creando...`);
          
          // Crear el artista si no existe
          const { data: newArtist, error: createError } = await supabase
            .from('artists')
            .insert({
              name: artistData.nombreArtistico,
              legal_name: artistData.nombreLegal,
              genre: 'Unknown',
              country: 'Unknown'
            })
            .select()
            .single();

          if (createError || !newArtist) {
            throw new Error(`No se pudo crear el artista: ${createError?.message}`);
          }

          console.log(`   ✅ Artista creado con ID: ${newArtist.id}`);
          await saveArtistStatement(newArtist.id, artistData);
        } else {
          console.log(`   ✅ Artista encontrado: ${artist.name}`);
          await saveArtistStatement(artist.id, artistData);
        }

        totalTransacciones += artistData.transacciones.length;
        exitosos++;
        console.log(`   💾 ${artistData.transacciones.length} transacciones guardadas`);
        console.log(`   💰 Balance: $${artistData.resumen.balanceFinal.toFixed(2)}`);
      } catch (error) {
        fallidos++;
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Artistas procesados: ${totalArtistas}`);
    console.log(`✅ Importaciones exitosas: ${exitosos}`);
    console.log(`❌ Importaciones fallidas: ${fallidos}`);
    console.log(`📝 Total de transacciones: ${totalTransacciones}`);
    console.log('='.repeat(60));
    console.log('\n🎉 ¡Importación completada!\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

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

  // Extraer información del artista (primeras filas)
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
    return artistData;
  }

  // Procesar transacciones
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    
    // Extraer todos los campos del Excel según las columnas
    // Columnas: Fecha, Número, Tipo, Método de Pago, Nombre, Concepto, Valor Factura, 
    //           Cargos Bancarios, 80% País, 20% Comisión, 5% Legal, Retención IVA, 
    //           Pagado por MVPX, Avance, Balance
    
    const fecha = parseExcelDate(row[0]);
    if (!fecha) continue;
    
    const numeroFactura = row[1] ? String(row[1]).trim() : undefined;
    const tipo = row[2] ? String(row[2]).trim() : undefined;
    const metodoPago = row[3] ? String(row[3]).trim() : undefined;
    const nombre = row[4] ? String(row[4]).trim() : undefined;
    const concepto = row[5] ? String(row[5]).trim() : '';
    
    if (!concepto) continue;
    
    // Extraer valores numéricos
    const valorFactura = typeof row[6] === 'number' ? row[6] : undefined;
    const cargosBancarios = typeof row[7] === 'number' ? row[7] : undefined;
    const porcentajePais = typeof row[8] === 'number' ? row[8] : undefined;
    const porcentajeComision = typeof row[9] === 'number' ? row[9] : undefined;
    const porcentajeLegal = typeof row[10] === 'number' ? row[10] : undefined;
    const retencionIVA = typeof row[11] === 'number' ? row[11] : undefined;
    const pagadoPorMVPX = typeof row[12] === 'number' ? row[12] : undefined;
    const avance = typeof row[13] === 'number' ? row[13] : undefined;
    const balance = typeof row[14] === 'number' ? row[14] : undefined;
    
    // Calcular monto principal (puede ser valorFactura, pagadoPorMVPX o avance)
    let monto = valorFactura || pagadoPorMVPX || avance || 0;
    if (monto === 0) continue;
    
    // Determinar tipo de transacción
    const { tipo: tipoTransaccion, categoria } = determineTransactionType(concepto);

    const transaction: Transaction = {
      fecha,
      numeroFactura,
      tipo,
      metodoPago,
      concepto,
      valorFactura,
      cargosBancarios,
      porcentajePais,
      porcentajeComision,
      porcentajeLegal,
      retencionIVA,
      pagadoPorMVPX,
      avance,
      balance,
      monto,
      tipoTransaccion,
      categoria,
      balanceAcumulado: balance
    };

    artistData.transacciones.push(transaction);

    // Actualizar resumen
    if (tipoTransaccion === 'income') {
      artistData.resumen.totalIngresos += monto;
    } else if (tipoTransaccion === 'expense') {
      artistData.resumen.totalGastos += monto;
    } else if (tipoTransaccion === 'advance') {
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

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

async function saveArtistStatement(artistId: string, artistData: ArtistData) {
  // Determinar fechas del periodo
  // Si no hay fechas en el Excel, usar la primera y última transacción
  let periodStart: Date;
  let periodEnd: Date;
  
  if (artistData.fechaInicio && artistData.fechaFin) {
    periodStart = artistData.fechaInicio;
    periodEnd = artistData.fechaFin;
  } else if (artistData.transacciones.length > 0) {
    // Usar fechas de las transacciones
    const fechas = artistData.transacciones.map(t => t.fecha);
    periodStart = new Date(Math.min(...fechas.map(f => f.getTime())));
    periodEnd = new Date(Math.max(...fechas.map(f => f.getTime())));
  } else {
    // Fallback: usar mes actual
    periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  }

  const statementMonth = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;

  // Crear o actualizar el estado de cuenta
  const { data: statement, error: statementError } = await supabase
    .from('artist_statements')
    .upsert({
      artist_id: artistId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      statement_month: statementMonth,
      legal_name: artistData.nombreLegal,
      total_income: artistData.resumen.totalIngresos,
      total_expenses: artistData.resumen.totalGastos,
      total_advances: artistData.resumen.totalAvances,
      balance: artistData.resumen.balanceFinal,
      total_transactions: artistData.transacciones.length,
      last_import_date: new Date().toISOString(),
      import_source: 'script'
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

  // Insertar nuevas transacciones en lotes de 100
  const batchSize = 100;
  for (let i = 0; i < artistData.transacciones.length; i += batchSize) {
    const batch = artistData.transacciones.slice(i, i + batchSize);
    
    const transactionsToInsert = batch.map(t => ({
      statement_id: statement.id,
      artist_id: artistId,
      transaction_date: t.fecha.toISOString().split('T')[0],
      concept: t.concepto,
      amount: t.monto,
      transaction_type: t.tipoTransaccion,
      category: t.categoria,
      running_balance: t.balanceAcumulado,
      // Campos adicionales del Excel
      invoice_number: t.numeroFactura,
      transaction_type_code: t.tipo,
      payment_method_detail: t.metodoPago,
      invoice_value: t.valorFactura,
      bank_charges_amount: t.cargosBancarios,
      country_percentage: t.porcentajePais,
      commission_20_percentage: t.porcentajeComision,
      legal_5_percentage: t.porcentajeLegal,
      tax_retention: t.retencionIVA,
      mvpx_payment: t.pagadoPorMVPX,
      advance_amount: t.avance,
      final_balance: t.balance
    }));

    const { error: transactionsError } = await supabase
      .from('statement_transactions')
      .insert(transactionsToInsert);

    if (transactionsError) {
      throw new Error(`Error guardando transacciones: ${transactionsError.message}`);
    }
  }
}

// Ejecutar la importación
importExcelToDatabase();
