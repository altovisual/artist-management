const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJayRozz() {
  console.log('🔍 Buscando datos de JayRozz...\n');

  // 1. Buscar el artista
  const { data: artists, error: artistError } = await supabase
    .from('artists')
    .select('id, name')
    .ilike('name', '%rozz%');

  if (artistError) {
    console.error('Error buscando artista:', artistError);
    return;
  }

  if (!artists || artists.length === 0) {
    console.log('❌ No se encontró el artista JayRozz');
    return;
  }

  const artist = artists[0];
  console.log('✅ Artista encontrado:', artist);
  console.log('');

  // 2. Ver el estado de cuenta
  const { data: statements, error: statementError } = await supabase
    .from('artist_statements')
    .select('*')
    .eq('artist_id', artist.id);

  if (statementError) {
    console.error('Error obteniendo estado de cuenta:', statementError);
    return;
  }

  console.log('📊 Estado de Cuenta:');
  console.log(JSON.stringify(statements, null, 2));
  console.log('');

  // 3. Ver las transacciones
  const { data: transactions, error: transError } = await supabase
    .from('statement_transactions')
    .select('*')
    .eq('artist_id', artist.id)
    .order('transaction_date', { ascending: true });

  if (transError) {
    console.error('Error obteniendo transacciones:', transError);
    return;
  }

  console.log(`💰 Transacciones (${transactions?.length || 0} total):`);
  console.log('');

  // Agrupar por tipo
  const byType = {
    income: [],
    expense: [],
    advance: [],
    payment: []
  };

  transactions?.forEach(t => {
    byType[t.transaction_type]?.push(t);
  });

  console.log('📈 INGRESOS:', byType.income.length);
  let totalIncome = 0;
  byType.income.forEach(t => {
    console.log(`  ${t.transaction_date} - ${t.concept}: $${t.amount.toLocaleString()}`);
    totalIncome += t.amount;
  });
  console.log(`  TOTAL INGRESOS: $${totalIncome.toLocaleString()}`);
  console.log('');

  console.log('💸 GASTOS:', byType.expense.length);
  let totalExpense = 0;
  byType.expense.forEach(t => {
    console.log(`  ${t.transaction_date} - ${t.concept}: $${t.amount.toLocaleString()}`);
    totalExpense += t.amount;
  });
  console.log(`  TOTAL GASTOS: $${totalExpense.toLocaleString()}`);
  console.log('');

  console.log('💵 AVANCES:', byType.advance.length);
  let totalAdvance = 0;
  byType.advance.forEach(t => {
    console.log(`  ${t.transaction_date} - ${t.concept}: $${t.amount.toLocaleString()}`);
    totalAdvance += t.amount;
  });
  console.log(`  TOTAL AVANCES: $${totalAdvance.toLocaleString()}`);
  console.log('');

  console.log('🧮 RESUMEN:');
  console.log(`  Ingresos:  +$${totalIncome.toLocaleString()}`);
  console.log(`  Gastos:    -$${totalExpense.toLocaleString()}`);
  console.log(`  Avances:   -$${totalAdvance.toLocaleString()}`);
  console.log(`  ─────────────────────────────`);
  const calculatedBalance = totalIncome - totalExpense - totalAdvance;
  console.log(`  Balance Calculado: $${calculatedBalance.toLocaleString()}`);
  console.log(`  Balance en BD:     $${statements[0]?.balance?.toLocaleString() || 0}`);
  console.log('');

  if (Math.abs(calculatedBalance - (statements[0]?.balance || 0)) > 0.01) {
    console.log('⚠️  HAY UNA DIFERENCIA entre el balance calculado y el de la BD');
  } else {
    console.log('✅ El balance coincide con las transacciones');
  }
}

checkJayRozz().catch(console.error);
