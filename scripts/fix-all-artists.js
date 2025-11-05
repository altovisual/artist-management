const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllArtists() {
  console.log('🔧 Corrigiendo datos de TODOS los artistas...\n');

  // 1. Obtener todos los estados de cuenta
  const { data: statements, error: statementsError } = await supabase
    .from('artist_statements')
    .select('*, artists(name)')
    .order('artists(name)');

  if (statementsError) {
    console.error('❌ Error obteniendo estados de cuenta:', statementsError);
    return;
  }

  console.log(`📊 Total de artistas con estados de cuenta: ${statements.length}\n`);

  const results = {
    total: statements.length,
    corrected: 0,
    unchanged: 0,
    errors: []
  };

  // 2. Procesar cada artista
  for (const statement of statements) {
    const artistName = statement.artists?.name || 'Desconocido';
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎵 Procesando: ${artistName}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Obtener todas las transacciones del artista
      const { data: transactions } = await supabase
        .from('statement_transactions')
        .select('*')
        .eq('artist_id', statement.artist_id)
        .order('transaction_date', { ascending: true });

      if (!transactions || transactions.length === 0) {
        console.log('⚠️  No hay transacciones para este artista');
        results.unchanged++;
        continue;
      }

      console.log(`📝 Total de transacciones: ${transactions.length}`);

      // 3. Corregir cada transacción
      let correctedCount = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      let totalAdvance = 0;

      for (const t of transactions) {
        let newType = t.transaction_type;
        let newAmount = Math.abs(t.amount); // Siempre positivo
        let needsUpdate = false;

        // Determinar el tipo correcto basado en el concepto
        const concept = t.concept.toLowerCase();
        
        // Si el monto original era negativo y está clasificado como income, revisar
        if (t.amount < 0 && t.transaction_type === 'income') {
          // Verificar si es realmente un ingreso o un gasto
          if (concept.includes('contrato') || 
              concept.includes('deposito') || 
              concept.includes('devolucion de impuestos') ||
              concept.includes('pago recibido') ||
              concept.includes('ingreso')) {
            // Es un ingreso real, mantener como income pero con monto positivo
            newType = 'income';
            needsUpdate = true;
          } else {
            // Es un gasto mal clasificado
            newType = 'expense';
            needsUpdate = true;
          }
        }
        
        // Si es un adelanto, mantenerlo como advance
        if (concept.includes('adelanto') || concept.includes('avance')) {
          newType = 'advance';
          if (t.amount < 0) needsUpdate = true;
        }

        // Si es un pago y no es adelanto, clasificarlo como gasto
        if (concept.includes('pago') && !concept.includes('adelanto') && !concept.includes('pago recibido')) {
          newType = 'expense';
          if (t.transaction_type !== 'expense' || t.amount < 0) needsUpdate = true;
        }

        // Si el monto es negativo en cualquier caso, necesita actualización
        if (t.amount < 0) {
          needsUpdate = true;
        }

        // Actualizar la transacción si cambió
        if (needsUpdate) {
          const { error } = await supabase
            .from('statement_transactions')
            .update({
              transaction_type: newType,
              amount: newAmount
            })
            .eq('id', t.id);

          if (!error) {
            correctedCount++;
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

      // 4. Calcular el nuevo balance
      const newBalance = totalIncome - totalExpense - totalAdvance;

      console.log(`\n✓ Transacciones corregidas: ${correctedCount}`);
      console.log(`\n💰 TOTALES:`);
      console.log(`  Ingresos:  +$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Gastos:    -$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  Avances:   -$${totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log(`  ─────────────────────────────`);
      console.log(`  Balance:    $${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      // Comparar con el balance anterior
      const oldBalance = statement.balance || 0;
      const difference = Math.abs(newBalance - oldBalance);

      if (difference > 0.01) {
        console.log(`\n⚠️  Balance cambió: $${oldBalance.toLocaleString()} → $${newBalance.toLocaleString()}`);
      }

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
        .eq('id', statement.id);

      if (updateError) {
        console.error('❌ Error actualizando estado de cuenta:', updateError);
        results.errors.push({ artist: artistName, error: updateError.message });
      } else {
        console.log('✅ Estado de cuenta actualizado');
        if (correctedCount > 0) {
          results.corrected++;
        } else {
          results.unchanged++;
        }
      }

    } catch (error) {
      console.error(`❌ Error procesando ${artistName}:`, error);
      results.errors.push({ artist: artistName, error: error.message });
    }
  }

  // 6. Resumen final
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 RESUMEN FINAL');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total de artistas procesados: ${results.total}`);
  console.log(`Artistas con correcciones: ${results.corrected}`);
  console.log(`Artistas sin cambios: ${results.unchanged}`);
  console.log(`Errores: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errores encontrados:');
    results.errors.forEach(e => {
      console.log(`  - ${e.artist}: ${e.error}`);
    });
  }

  console.log('\n✅ Corrección completada!');
}

fixAllArtists().catch(console.error);
