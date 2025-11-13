# 🔄 Restaurar Cesar Da Gold Completo

## ✅ Pasos para Restaurar con TODOS los Datos

### **Opción 1: Usando la Interfaz Web (Más Fácil)**

1. **Ir a Finance → Import Statement**
   - URL: `http://localhost:3000/finance/import` (o tu URL de producción)

2. **Subir el archivo**
   - Archivo: `Estados_de_Cuenta.xlsx`
   - Click en "Upload" o arrastra el archivo

3. **El sistema automáticamente:**
   - ✅ Creará el artista "Cesar Da Gold" si no existe
   - ✅ Importará todas las transacciones
   - ✅ Creará los estados de cuenta
   - ✅ Calculará los balances

4. **Verificar**
   - Ve a Finance → Statements
   - Busca "Cesar Da Gold"
   - Verás todas sus transacciones y estados de cuenta

---

### **Opción 2: Usando la API (Programático)**

```bash
# Desde la terminal en la raíz del proyecto
curl -X POST http://localhost:3000/api/statements/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@Estados_de_Cuenta.xlsx"
```

---

### **Opción 3: Desde el Dashboard**

1. **Navega a:** Dashboard → Finance → Import
2. **Selecciona:** `Estados_de_Cuenta.xlsx`
3. **Click:** "Import Statement"
4. **Espera:** El proceso tarda unos segundos
5. **Verifica:** Ve a Analytics y busca "Cesar Da Gold"

---

## 📊 Qué se Restaurará

El archivo `Estados_de_Cuenta.xlsx` contiene:

- ✅ **Información del artista** (nombre, datos legales)
- ✅ **Transacciones detalladas** (ingresos, gastos, avances)
- ✅ **Estados de cuenta mensuales**
- ✅ **Balances y resúmenes financieros**
- ✅ **Fechas y períodos**

---

## ⚠️ Importante

- Si el artista "Cesar Da Gold" ya existe, se vinculará a ese artista
- Si no existe, se creará automáticamente
- Las transacciones se importarán sin duplicados
- Los estados de cuenta se crearán por período (mes)

---

## 🎯 Recomendación

**Usa la Opción 1** (Interfaz Web):
- Es la más segura
- Muestra el progreso
- Valida los datos automáticamente
- Muestra errores si los hay

---

## 📍 Ubicación del Archivo

```
c:\Users\altov\Downloads\artist-management\Estados_de_Cuenta.xlsx
```

¡Listo para importar! 🚀
