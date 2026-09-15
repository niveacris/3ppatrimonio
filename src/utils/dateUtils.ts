/**
 * Utilitários seguros para formatação de datas
 * Suporta formatos SQL ('YYYY-MM-DD HH:MM:SS'), ISO ('YYYY-MM-DDTHH:MM:SSZ') e previne exceções no Safari/Mobile
 */

export function parseSafeDate(dateVal?: any): Date | null {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;

  if (typeof dateVal === 'string') {
    // Normaliza formato MySQL 'YYYY-MM-DD HH:MM:SS' para ISO 'YYYY-MM-DDTHH:MM:SS' para evitar bugs no Safari
    const normalized = dateVal.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2');
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
    
    // Tenta parse direto como fallback
    const fallback = new Date(dateVal);
    if (!isNaN(fallback.getTime())) return fallback;
  }

  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

export function formatSafeDate(dateVal?: any): string {
  const d = parseSafeDate(dateVal);
  if (!d) return 'Data recente';
  try {
    return d.toLocaleDateString('pt-BR');
  } catch {
    return 'Data recente';
  }
}

export function formatSafeTime(dateVal?: any): string {
  const d = parseSafeDate(dateVal);
  if (!d) return '';
  try {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatSafeDateTime(dateVal?: any): string {
  const d = parseSafeDate(dateVal);
  if (!d) return 'Recente';
  try {
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'Recente';
  }
}
