# 🔄 Guía: Eliminar Artistas Duplicados

## 📋 Problema

Tienes artistas duplicados en la base de datos:
- **Perfil Real:** Tiene Spotify o Muso.AI conectado
- **Perfil Duplicado:** Creado desde el Excel, sin conexiones

## ✅ Solución

Consolidar los duplicados manteniendo:
- ✅ El perfil REAL (con conexiones)
- ✅ TODAS las finanzas del duplicado
- ❌ Eliminar solo el perfil duplicado

---

## 🎯 Ejemplo Visual

### **Antes:**
```
Artista: "Cesar Da Gold" (ID: abc-123)
├─ Spotify: ✅ Conectado
├─ Transacciones: 0
└─ Balance: $0

Artista: "Cesar Da Gold" (ID: xyz-789) ← DUPLICADO
├─ Spotify: ❌ Sin conexión
├─ Transacciones: 25
└─ Balance: $5,000
```

### **Después:**
```
Artista: "Cesar Da Gold" (ID: abc-123) ← CONSOLIDADO
├─ Spotify: ✅ Conectado
├─ Transacciones: 25 ← Transferidas del duplicado
└─ Balance: $5,000 ← Transferido del duplicado

[Duplicado eliminado]
```

---

## 🚀 Cómo Usar

### **Opción 1: Script Automático (Recomendado) ⭐**

1. Abre **Supabase SQL Editor**
2. Copia TODO el contenido de: `ELIMINAR_DUPLICADOS_AUTO.sql`
3. Pégalo en el editor
4. Click en **"Run"**
5. ✅ ¡Listo!

**Resultado:**
```
🔄 Iniciando eliminación de duplicados...
📊 Duplicados encontrados: 8

📋 Artistas que se consolidarán:
   • Cesar Da Gold → Cesar Da Gold (consolidando)
   • Dayan → Dayan (consolidando)
   • ECBY → ECBY (consolidando)
   ...

📤 Transfiriendo transacciones...
   ✅ 125 transacciones transferidas

📤 Transfiriendo estados de cuenta...
   ✅ 15 estados de cuenta transferidos

🗑️  Eliminando duplicados...
   ✅ 8 artistas duplicados eliminados

✅ ¡Proceso completado exitosamente!
```

---

### **Opción 2: Script Paso a Paso**

Si quieres ver cada paso antes de ejecutarlo:

1. Abre: `ELIMINAR_DUPLICADOS.sql`
2. Ejecuta cada sección por separado
3. Revisa los resultados antes de continuar

**Pasos:**
- **PASO 1:** Ver duplicados
- **PASO 2:** Ver detalles de cada uno
- **PASO 3:** Identificar cuál es el real
- **PASO 4:** Transferir finanzas
- **PASO 5:** Eliminar duplicados
- **PASO 6:** Verificar resultado

---

## 🎯 Criterio de Selección

El script mantiene el perfil "REAL" usando este orden:

1. **Prioridad 1:** Artista con Spotify conectado
2. **Prioridad 2:** Artista con Muso.AI conectado
3. **Prioridad 3:** Artista más antiguo (created_at)

---

## 📊 Qué se Transfiere

Del duplicado al perfil real:

✅ **Todas las transacciones** (`statement_transactions`)
✅ **Todos los estados de cuenta** (`artist_statements`)
✅ **Balances y resúmenes** financieros

---

## ⚠️ Importante

- ✅ **Seguro:** No se pierden datos financieros
- ✅ **Automático:** Todo se transfiere automáticamente
- ✅ **Verificable:** Muestra resumen al final
- ⚠️ **Irreversible:** Una vez eliminado, no se puede deshacer

---

## 🔍 Verificación Final

Después de ejecutar, verifica:

```sql
-- No debería haber duplicados
SELECT 
    LOWER(TRIM(name)) as nombre,
    COUNT(*) as cantidad
FROM public.artists
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;
```

Si el resultado está **vacío** → ✅ ¡Éxito!

---

## 📍 Archivos Creados

1. **ELIMINAR_DUPLICADOS_AUTO.sql** ← Usa este (automático)
2. **ELIMINAR_DUPLICADOS.sql** ← Paso a paso (manual)
3. **GUIA_ELIMINAR_DUPLICADOS.md** ← Esta guía

---

## 🎉 Resultado Esperado

Después de ejecutar:

- ✅ **Un solo perfil** por artista
- ✅ **Todas las finanzas** consolidadas
- ✅ **Conexiones** de Spotify/Muso.AI intactas
- ✅ **Sin duplicados**

---

¡Listo para ejecutar! 🚀
