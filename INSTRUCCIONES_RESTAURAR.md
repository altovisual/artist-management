# 🔄 Restaurar Cesar Da Gold - Instrucciones Simples

## ✅ Método Más Fácil (2 minutos)

### **Paso 1: Asegúrate que el servidor esté corriendo**

```bash
npm run dev
```

Espera a ver: `✓ Ready in X ms`

---

### **Paso 2: Abre tu navegador**

Ve a una de estas URLs:

- **Opción A (Importar):** `http://localhost:3000/finance/import`
- **Opción B (Statements):** `http://localhost:3000/finance/statements`

---

### **Paso 3: Importar el archivo**

1. **Si estás en `/finance/import`:**
   - Arrastra el archivo `Estados_de_Cuenta.xlsx`
   - O click en "Browse" y selecciónalo
   - Click en "Import" o "Upload"

2. **Si estás en `/finance/statements`:**
   - Busca un botón "Import" o "Upload"
   - Selecciona `Estados_de_Cuenta.xlsx`
   - Click en "Import"

---

### **Paso 4: Verificar**

1. Ve a: `http://localhost:3000/dashboard/analytics`
2. Busca "Cesar Da Gold" en la lista
3. ✅ Deberías verlo con todos sus datos

---

## 📍 Ubicación del Archivo

```
C:\Users\altov\Downloads\artist-management\Estados_de_Cuenta.xlsx
```

---

## ⚠️ Si no funciona

### **Problema: No encuentro la página de importación**

**Solución:** Busca en el menú principal:
- Finance → Import
- Finance → Statements → Import
- Management → Import

### **Problema: Error 401 Unauthorized**

**Solución:** 
1. Inicia sesión primero en: `http://localhost:3000/auth/login`
2. Luego ve a la página de importación

### **Problema: El archivo no se sube**

**Solución:**
1. Verifica que el archivo existe
2. Verifica que el servidor esté corriendo
3. Revisa la consola del navegador (F12) para ver errores

---

## 🎯 Resultado Esperado

Después de importar verás:

✅ **Cesar Da Gold** en la lista de artistas
✅ **Todas sus transacciones** en Finance
✅ **Estados de cuenta** completos
✅ **Balances** calculados automáticamente

---

## 💡 Alternativa: Crear Manualmente

Si la importación no funciona, puedes crear el artista manualmente:

1. Ve a: `http://localhost:3000/artists/new`
2. Completa:
   - **Name:** Cesar Da Gold
   - **Genre:** Unknown (o el que corresponda)
   - **Country:** US
3. Click en "Create Artist"

Luego importa el Excel para agregar las transacciones.

---

¡Listo! 🚀
