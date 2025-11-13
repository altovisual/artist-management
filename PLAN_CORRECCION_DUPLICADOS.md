# 🔧 Plan de Corrección de Duplicados

## 🎯 Objetivo
Identificar y corregir artistas duplicados consolidando sus datos financieros.

---

## 📋 Proceso de Corrección

### **Paso 1: Identificar Duplicados** 🔍

Ejecuta en Supabase SQL Editor:
```sql
-- Ver archivo: VERIFICAR_DUPLICADOS_ESPECIFICOS.sql
```

**Qué hace:**
- ✅ Lista todos los artistas duplicados
- ✅ Muestra cuántos estados de cuenta tiene cada uno
- ✅ Identifica cuál es el perfil más antiguo (el que se mantendrá)

**Resultado esperado:**
```
Duplicados encontrados:
- LANALIZER (2 perfiles)
- MozartMuzik (2 perfiles)
- ECBY (2 perfiles)
- Cesar Da Gold (2 perfiles)
```

---

### **Paso 2: Revisar Plan de Consolidación** 📊

Para cada duplicado, el script hará:

1. **Identificar perfil principal:**
   - El más antiguo (primera fecha de creación)
   - Este perfil SE MANTIENE

2. **Mover datos financieros:**
   - Estados de cuenta → Perfil principal
   - Transacciones → Perfil principal

3. **Eliminar duplicados:**
   - Solo después de mover todos los datos
   - Los perfiles duplicados SE ELIMINAN

---

### **Paso 3: Ejecutar Corrección** ⚙️

Ejecuta en Supabase SQL Editor:
```sql
-- Ver archivo: CORREGIR_TODOS_DUPLICADOS.sql
```

**Qué hace:**
1. ✅ Busca duplicados automáticamente
2. ✅ Consolida datos en el perfil más antiguo
3. ✅ Elimina perfiles duplicados vacíos
4. ✅ Muestra resumen de cambios

**Resultado esperado:**
```
🔍 INICIANDO CORRECCIÓN DE DUPLICADOS...

📋 Duplicado encontrado: lanalizer
   Cantidad de perfiles: 2
   ✅ Perfil principal (mantener): [UUID-1]
   🗑️  Perfiles duplicados (eliminar):
      - [UUID-2]
         Estados de cuenta movidos: 5
         Transacciones movidas: 23
         ✅ Perfil duplicado eliminado

✅ PROCESO COMPLETADO
📊 RESUMEN:
   - Grupos de duplicados corregidos: 4
```

---

### **Paso 4: Verificar Resultado** ✅

Ejecuta nuevamente:
```sql
-- Ver archivo: VERIFICAR_DUPLICADOS_ESPECIFICOS.sql
```

**Debe mostrar:**
- ✅ 0 duplicados encontrados
- ✅ Todos los artistas con nombre único
- ✅ Todos los estados de cuenta consolidados

---

## ⚠️ Importante: Backup

**ANTES de ejecutar la corrección:**

1. **Hacer backup de la base de datos** (recomendado)
2. O ejecutar primero solo la verificación
3. Revisar qué duplicados se encontraron
4. Luego ejecutar la corrección

---

## 🔄 Proceso Seguro

### **Opción 1: Automática (Recomendada)**
```sql
-- Ejecuta todo de una vez:
CORREGIR_TODOS_DUPLICADOS.sql
```

### **Opción 2: Manual (Más Control)**

Para cada duplicado encontrado:

```sql
-- 1. Identificar IDs
SELECT id, name, created_at 
FROM artists 
WHERE LOWER(name) = 'lanalizer';

-- 2. Mover estados de cuenta
UPDATE artist_statements
SET artist_id = '[ID-PRINCIPAL]'
WHERE artist_id = '[ID-DUPLICADO]';

-- 3. Mover transacciones
UPDATE statement_transactions
SET artist_id = '[ID-PRINCIPAL]'
WHERE artist_id = '[ID-DUPLICADO]';

-- 4. Eliminar duplicado
DELETE FROM artists
WHERE id = '[ID-DUPLICADO]';
```

---

## 📊 Casos Específicos

### **LANALIZER**
- Probablemente 2 perfiles con mismo nombre
- Consolidar en el más antiguo
- Mover estados de cuenta de marzo 2021

### **MozartMuzik**
- Probablemente 2 perfiles
- Consolidar en el más antiguo
- Mover estados de cuenta de febrero 2021

### **ECBY**
- Probablemente 2 perfiles
- Consolidar en el más antiguo
- Mover estados de cuenta de julio 2020

### **Cesar Da Gold**
- Ya fue restaurado anteriormente
- Verificar si hay duplicados nuevos

---

## ✅ Resultado Final

Después de la corrección:

**Antes:**
```
Estados de Cuenta:
- LANALIZER (duplicado 1)
- LANALIZER (duplicado 2)
- MozartMuzik (duplicado 1)
- MozartMuzik (duplicado 2)
- ECBY (duplicado 1)
- ECBY (duplicado 2)
Total: 47 períodos
```

**Después:**
```
Estados de Cuenta:
- LANALIZER (único, consolidado)
- MozartMuzik (único, consolidado)
- ECBY (único, consolidado)
Total: ~24 períodos (sin duplicados)
```

---

## 🚀 Próximos Pasos

1. ✅ Ejecutar `VERIFICAR_DUPLICADOS_ESPECIFICOS.sql`
2. ✅ Revisar resultados
3. ✅ Ejecutar `CORREGIR_TODOS_DUPLICADOS.sql`
4. ✅ Verificar que no haya duplicados
5. ✅ Recargar página de Finance

---

¿Listo para ejecutar? 🚀
