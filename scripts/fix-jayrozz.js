const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixJayRozz() {
  console.log('🔧 Corrigiendo datos de JayRozz...\n');

  // 1. Buscar el artista
  const { data: artists } = await supabase
    .from('artists')
    .select('id, name')
    .ilike('name', '%rozz%');

  if (!artists || artists.length === 0) {
    console.log('❌ No se encontró el artista JayRozz');
    return;
  }

  const artist = artists[0];
  console.log('✅ Artista encontrado:', artist.name);
  console.log('');

  // 2. Obtener todas las transacciones
  const { data: transactions } = await supabase
    .from('statement_transactions')
    .select('*')
    .eq('artist_id', artist.id)
    .order('transaction_date', { ascending: true });

  console.log(`📊 Total de transacciones: ${transactions.length}`);
  console.log('');

  // 3. Corregir cada transacción
  let corrected = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let totalAdvance = 0;

  for (const t of transactions) {
    let newType = t.transaction_type;
    let newAmount = Math.abs(t.amount); // Siempre positivo

    // Determinar el tipo correcto basado en el concepto
    const concept = t.concept.toLowerCase();
    
    // Si el monto original era negativo y está clasificado como income, es un gasto
    if (t.amount < 0 && t.transaction_type === 'income') {
      // Verificar si es realmente un ingreso o un gasto
      if (concept.includes('contrato') || 
          concept.includes('deposito') || 
          concept.includes('devolucion de impuestos')) {
        // Es un ingreso real, mantener como income pero con monto positivo
        newType = 'income';
      } else {
        // Es un gasto mal clasificado
        newType = 'expense';
      }
    }
    
    // Si es un adelanto, mantenerlo como advance
    if (concept.includes('adelanto') || concept.includes('avance')) {
      newType = 'advance';
    }

    // Si es un pago, clasificarlo correctamente
    if (concept.includes('pago') && !concept.includes('adelanto')) {
      newType = 'expense';
    }

    // Actualizar la transacción si cambió
    if (newType !== t.transaction_type || newAmount !== t.amount) {
      const { error } = await supabase
        .from('statement_transactions')
        .update({
          transaction_type: newType,
          amount: newAmount
        })
        .eq('id', t.id);

      if (!error) {
        corrected++;
        console.log(`✓ Corregido: ${t.concept.substring(0, 50)}... | ${t.transaction_type} → ${newType} | $${t.amount} → $${newAmount}`);
      }
    }

    // Sumar al total correspondiente
    if (newType === 'income') {
      totalIncome += newAmount;
    } else if (newType === 'expense') {
      totalExpense += newAmount;
    } else if (newType === 'advance') {
      totalAdvance += newAmount;
    }
  }

  console.log('');
  console.log(`✅ Transacciones corregidas: ${corrected}`);
  console.log('');

  // 4. Calcular el nuevo balance
  const newBalance = totalIncome - totalExpense - totalAdvance;

  console.log('🧮 NUEVOS TOTALES:');
  console.log(`  Ingresos:  +$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  Gastos:    -$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  Avances:   -$${totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Balance:    $${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log('');

  // 5. Actualizar el estado de cuenta
  const { error: updateError } = await supabase
    .from('artist_statements')
    .update({
      total_income: totalIncome,
      total_expenses: totalExpense,
      total_advances: totalAdvance,
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('artist_id', artist.id);

  if (updateError) {
    console.error('❌ Error actualizando estado de cuenta:', updateError);
  } else {
    console.log('✅ Estado de cuenta actualizado correctamente');
  }

  console.log('');
  console.log('🎉 Corrección completada!');
}

fixJayRozz().catch(console.error);
