const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function recalculateStatements() {
  console.log('🔧 Recalculando estados de cuenta desde las transacciones...\n');

  // Obtener todos los estados de cuenta
  const { data: statements, error: statementsError } = await supabase
    .from('artist_statements')
    .select('*, artists(name)')
    .order('artists(name)');

  if (statementsError) {
    console.error('❌ Error:', statementsError);
    return;
  }

  console.log(`📊 Total de artistas: ${statements.length}\n`);

  const artistsToSkip = ['Alex Nuñez']; // Excluir por moneda diferente
  let corrected = 0;

  for (const statement of statements) {
    const artistName = statement.artists?.name || 'Desconocido';

    if (artistsToSkip.includes(artistName)) {
      console.log(`⏭️  SALTADO: ${artistName} (Pesos Dominicanos)`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎵 ${artistName}`);
    console.log(`${'='.repeat(60)}`);

    // Obtener transacciones
    const { data: transactions } = await supabase
      .from('statement_transactions')
      .select('*')
      .eq('artist_id', statement.artist_id);

    if (!transactions || transactions.length === 0) {
      console.log('⚠️  Sin transacciones');
      continue;
    }

    // Calcular totales
    let totalIncome = 0;
    let totalExpense = 0;
    let totalAdvance = 0;

    transactions.forEach(t => {
      const amount = Math.abs(t.amount);
      if (t.transaction_type === 'income') {
        totalIncome += amount;
      } else if (t.transaction_type === 'expense') {
        totalExpense += amount;
      } else if (t.transaction_type === 'advance') {
        totalAdvance += amount;
      }
    });

    const balance = totalIncome - totalExpense - totalAdvance;

    console.log(`💰 Ingresos:  +$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`💸 Gastos:    -$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`💵 Avances:   -$${totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`   ─────────────────────────────`);
    console.log(`   Balance:    $${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

    // Actualizar
    const { error: updateError } = await supabase
      .from('artist_statements')
      .update({
        total_income: totalIncome,
        total_expenses: totalExpense,
        total_advances: totalAdvance,
        balance: balance,
        updated_at: new Date().toISOString()
      })
      .eq('id', statement.id);

    if (updateError) {
      console.error('❌ Error:', updateError.message);
    } else {
      console.log('✅ Actualizado');
      corrected++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 COMPLETADO`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total actualizados: ${corrected}`);
}

recalculateStatements().catch(console.error);
