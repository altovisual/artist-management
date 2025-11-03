import pandas as pd
import sys

try:
    # Leer el archivo Excel
    xls = pd.ExcelFile('Estados_de_Cuenta.xlsx')
    
    print("=" * 80)
    print("ANÁLISIS DEL ARCHIVO: Estados_de_Cuenta.xlsx")
    print("=" * 80)
    print(f"\nHojas disponibles: {xls.sheet_names}\n")
    
    # Analizar cada hoja
    for sheet_name in xls.sheet_names:
        print("\n" + "=" * 80)
        print(f"HOJA: {sheet_name}")
        print("=" * 80)
        
        df = pd.read_excel('Estados_de_Cuenta.xlsx', sheet_name=sheet_name)
        
        print(f"\nDimensiones: {df.shape[0]} filas x {df.shape[1]} columnas")
        print(f"\nColumnas: {list(df.columns)}")
        print(f"\nPrimeras 15 filas:")
        print(df.head(15).to_string())
        
        # Información adicional
        print(f"\n\nInformación de tipos de datos:")
        print(df.dtypes)
        
        print(f"\n\nEstadísticas básicas (columnas numéricas):")
        print(df.describe())
        
        print("\n" + "-" * 80)

except Exception as e:
    print(f"Error al leer el archivo: {e}")
    sys.exit(1)
