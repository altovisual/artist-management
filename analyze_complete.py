import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

xls = pd.ExcelFile('Estados_de_Cuenta.xlsx')

print("=" * 120)
print("ANALISIS COMPLETO DEL DOCUMENTO: Estados_de_Cuenta.xlsx")
print("=" * 120)
print(f"\nTotal de hojas: {len(xls.sheet_names)}")
print(f"\nArtistas encontrados: {', '.join(xls.sheet_names)}\n")

all_artists = []

for sheet_name in xls.sheet_names:
    if sheet_name in ['Base de datos', 'MODELO']:
        continue
        
    print("\n" + "=" * 120)
    print(f"ARTISTA: {sheet_name}")
    print("=" * 120)
    
    # Leer toda la hoja
    df_raw = pd.read_excel('Estados_de_Cuenta.xlsx', sheet_name=sheet_name, header=None)
    
    # Extraer información del artista
    artist_data = {
        'nombre_artistico': sheet_name,
        'nombre_legal': None,
        'fecha_inicio': None,
        'fecha_fin': None,
        'transacciones': []
    }
    
    # Buscar información en las primeras filas
    for i in range(min(10, len(df_raw))):
        row = df_raw.iloc[i]
        if pd.notna(row.get(1)) and pd.notna(row.get(4)):
            label = str(row[1]).strip().lower()
            value = row[4]
            
            if 'nombre legal' in label:
                artist_data['nombre_legal'] = value
            elif 'fecha de inicio' in label or 'fecha inicio' in label:
                artist_data['fecha_inicio'] = value
            elif 'fecha fin' in label or 'fecha de finalizacion' in label:
                artist_data['fecha_fin'] = value
    
    print(f"\nINFORMACION BASICA:")
    print(f"  Nombre Artistico: {artist_data['nombre_artistico']}")
    print(f"  Nombre Legal: {artist_data['nombre_legal']}")
    print(f"  Fecha Inicio: {artist_data['fecha_inicio']}")
    print(f"  Fecha Fin: {artist_data['fecha_fin']}")
    
    # Encontrar la fila de encabezados
    header_row = None
    for i in range(len(df_raw)):
        row_str = ' '.join([str(x) for x in df_raw.iloc[i].values if pd.notna(x)])
        if 'Fecha' in row_str and 'Concepto' in row_str:
            header_row = i
            break
    
    if header_row is not None:
        # Leer transacciones
        df_trans = pd.read_excel('Estados_de_Cuenta.xlsx', sheet_name=sheet_name, header=header_row)
        
        # Limpiar y procesar transacciones
        transactions = []
        total_ingresos = 0
        total_gastos = 0
        total_avances = 0
        balance_final = 0
        
        for idx, row in df_trans.iterrows():
            if pd.notna(row.get('Fecha')):
                trans = {
                    'fecha': row.get('Fecha'),
                    'concepto': row.get('Concepto'),
                    'nombre': row.get('Nombre'),
                    'metodo_pago': row.get('Método de pago'),
                }
                
                # Buscar columnas de montos
                for col in df_trans.columns:
                    if pd.notna(row.get(col)) and isinstance(row.get(col), (int, float)):
                        trans[col] = row[col]
                        
                        # Sumar totales
                        if 'Avance' in str(col):
                            total_avances += row[col]
                        elif 'Balance' in str(col):
                            balance_final = row[col]
                        elif row[col] > 0:
                            total_ingresos += row[col]
                        elif row[col] < 0:
                            total_gastos += abs(row[col])
                
                transactions.append(trans)
        
        artist_data['transacciones'] = transactions
        artist_data['total_transacciones'] = len(transactions)
        artist_data['total_ingresos'] = total_ingresos
        artist_data['total_gastos'] = total_gastos
        artist_data['total_avances'] = total_avances
        artist_data['balance_final'] = balance_final
        
        print(f"\nRESUMEN FINANCIERO:")
        print(f"  Total Transacciones: {len(transactions)}")
        print(f"  Total Ingresos: ${total_ingresos:,.2f}")
        print(f"  Total Gastos: ${total_gastos:,.2f}")
        print(f"  Total Avances: ${total_avances:,.2f}")
        print(f"  Balance Final: ${balance_final:,.2f}")
        
        print(f"\nULTIMAS 5 TRANSACCIONES:")
        for trans in transactions[-5:]:
            fecha = trans.get('fecha', 'N/A')
            concepto = trans.get('concepto', 'N/A')
            print(f"  - {fecha}: {concepto}")
    
    all_artists.append(artist_data)

# Resumen general
print("\n\n" + "=" * 120)
print("RESUMEN GENERAL DE TODOS LOS ARTISTAS")
print("=" * 120)

total_balance_general = 0
total_transacciones_general = 0

for artist in all_artists:
    print(f"\n{artist['nombre_artistico']}:")
    print(f"  Nombre Legal: {artist.get('nombre_legal', 'N/A')}")
    print(f"  Periodo: {artist.get('fecha_inicio', 'N/A')} - {artist.get('fecha_fin', 'N/A')}")
    print(f"  Transacciones: {artist.get('total_transacciones', 0)}")
    if artist.get('balance_final'):
        print(f"  Balance: ${artist['balance_final']:,.2f}")
        total_balance_general += artist['balance_final']
    total_transacciones_general += artist.get('total_transacciones', 0)

print(f"\n" + "=" * 120)
print(f"TOTALES GENERALES:")
print(f"  Total Artistas: {len(all_artists)}")
print(f"  Total Transacciones: {total_transacciones_general}")
print(f"  Balance Total: ${total_balance_general:,.2f}")
print("=" * 120)
