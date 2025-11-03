/**
 * Utilidades de formateo para la aplicación
 * Formato español: 40.000,00
 */

/**
 * Formatea un número como moneda en formato español
 * @param amount - Monto a formatear
 * @param currency - Símbolo de moneda (default: '$')
 * @returns String formateado: $40.000,00
 */
export function formatCurrency(amount: number | null | undefined, currency: string = '$'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0,00`;
  }

  // Formatear con locale español
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency}${formatted}`;
}

/**
 * Formatea un número sin símbolo de moneda
 * @param amount - Número a formatear
 * @param decimals - Cantidad de decimales (default: 2)
 * @returns String formateado: 40.000,00
 */
export function formatNumber(amount: number | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00';
  }

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formatea un número como porcentaje
 * @param value - Valor a formatear (0-100)
 * @returns String formateado: 80,00%
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + '%';
}

/**
 * Formatea un número grande de forma compacta
 * @param amount - Número a formatear
 * @returns String formateado: 1,2M o 45,3K
 */
export function formatCompactNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Formatea una fecha en formato español
 * @param date - Fecha a formatear
 * @returns String formateado: 3 nov 2025
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formatea una fecha completa en formato español
 * @param date - Fecha a formatear
 * @returns String formateado: 3 de noviembre de 2025
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Parsea un string con formato español a número
 * @param value - String a parsear (ej: "40.000,00")
 * @returns Número parseado
 */
export function parseSpanishNumber(value: string): number {
  if (!value) return 0;
  
  // Remover puntos de miles y reemplazar coma por punto
  const normalized = value
    .replace(/\./g, '')  // Quitar puntos
    .replace(',', '.');  // Reemplazar coma por punto
  
  return parseFloat(normalized) || 0;
}
