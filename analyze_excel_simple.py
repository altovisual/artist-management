import pandas as pd
import json
import sys

# Configurar encoding para Windows
sys.stdout.reconfigure(encoding='utf-8')

# Leer el archivo Excel
xls = pd.ExcelFile('Estados_de_Cuenta.xlsx')

print("=" * 100)
print("ANALISIS COMPLETO: Estados_de_Cuenta.xlsx")
print("=" * 100)
print(f"\nTotal de hojas: {len(xls.sheet_names)}")
print(f"Nombres de hojas: {', '.join(xls.sheet_names)}\n")

all_data = {}

for sheet_name in xls.sheet_names:
    print("\n" + "=" * 100)
    print(f"HOJA: {sheet_name}")
    print("=" * 100)
    
    # Leer la hoja completa
    df = pd.read_excel('Estados_de_Cuenta.xlsx', sheet_name=sheet_name, header=None)
    
    # Extraer información del artista (primeras filas)
    artist_info = {}
    for i in range(min(6, len(df))):
        row = df.iloc[i]
        if pd.notna(row[1]) and pd.notna(row[4]):
            key = str(row[1]).strip().replace(':', '')
            value = row[4]
            if key and key != 'nan':
                artist_info[key] = value
    
    print("\nINFORMACION DEL ARTISTA:")
    for key, value in artist_info.items():
        print(f"  - {key}: {value}")
    
    # Encontrar la fila de encabezados (buscar "Fecha")
    header_row = None
    for i in range(len(df)):
        if 'Fecha' in str(df.iloc[i].values):
            header_row = i
            break
    
    if header_row is not None:
        # Leer datos con el encabezado correcto
        df_data = pd.read_excel('Estados_de_Cuenta.xlsx', sheet_name=sheet_name, header=header_row)
        
        print(f"\nDAT OS DE TRANSACCIONES:")
        print(f"  - Total de transacciones: {len(df_data)}")
        print(f"  - Columnas: {', '.join([str(c) for c in df_data.columns])}")
        
        # Calcular totales
        numeric_columns = df_data.select_dtypes(include=['float64', 'int64']).columns
        print(f"\nRESUMEN FINANCIERO:")
        for col in numeric_columns:
            total = df_data[col].sum()
            if abs(total) > 0.01:
                print(f"  - Total {col}: ${total:,.2f}")
        
        # Balance final
        if 'Balance' in df_data.columns:
            final_balance = df_data['Balance'].dropna().iloc[-1] if len(df_data['Balance'].dropna()) > 0 else 0
            print(f"\nBALANCE FINAL: ${final_balance:,.2f}")
        
        all_data[sheet_name] = {
            'artist_info': artist_info,
            'transactions': len(df_data),
            'final_balance': final_balance if 'Balance' in df_data.columns else None
        }
    else:
        all_data[sheet_name] = {
            'artist_info': artist_info,
            'transactions': 0,
            'final_balance': None
        }

print("\n\n" + "=" * 100)
print("RESUMEN GENERAL DE TODOS LOS ARTISTAS")
print("=" * 100)
total_balance = 0
for sheet, data in all_data.items():
    print(f"\n{sheet}:")
    print(f"  Transacciones: {data['transactions']}")
    if data['final_balance'] is not None:
        print(f"  Balance Final: ${data['final_balance']:,.2f}")
        total_balance += data['final_balance']

print(f"\n" + "=" * 100)
print(f"BALANCE TOTAL DE TODOS LOS ARTISTAS: ${total_balance:,.2f}")
print("=" * 100)
