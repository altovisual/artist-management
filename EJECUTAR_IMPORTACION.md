# 🚀 Ejecutar Importación de Datos

## Pasos Rápidos

### 1. Instalar dependencia faltante
```bash
npm install dotenv
```

### 2. Ejecutar la importación
```bash
npx tsx scripts/import-excel-to-db.ts
```

---

## ✅ Eso es todo!

El script:
- ✅ Cargará las variables de entorno de `.env.local`
- ✅ Leerá `Estados_de_Cuenta.xlsx`
- ✅ Importará los 25 artistas
- ✅ Guardará las 1,042 transacciones
- ✅ Calculará todos los balances

---

## 📊 Después de la Importación

1. Recarga el dashboard: `http://localhost:3000/dashboard/finance`
2. Ve al tab **"Estados de Cuenta"**
3. ¡Verás todos los datos!

---

## 🐛 Si hay errores

El script te dirá exactamente qué falta y cómo solucionarlo.
