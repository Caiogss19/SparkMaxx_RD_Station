export const fmtNumber = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('pt-BR');
};

export const fmtPercent = (value: number | null | undefined, decimals = 1): string => {
  if (value == null || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
};

export const fmtDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

export const fmtDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

export const fmtRelative = (value: string | null | undefined): string => {
  if (!value) return '—';
  try {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d atrás`;
    return fmtDate(value);
  } catch {
    return '—';
  }
};

export const fmtDuration = (ms: number | null | undefined): string => {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}m ${rest}s`;
};

export const safeRate = (numerator: number, denominator: number): number => {
  if (!denominator || denominator === 0) return 0;
  return (numerator / denominator) * 100;
};

export const trendDelta = (current: number, previous: number): { value: number; positive: boolean } => {
  if (!previous || previous === 0) return { value: 0, positive: current >= 0 };
  const delta = ((current - previous) / previous) * 100;
  return { value: Math.abs(delta), positive: delta >= 0 };
};
