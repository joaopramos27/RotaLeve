const distanceFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

export function formatDistanceMeters(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N/A';
  }

  if (value < 1000) {
    return `${Math.round(value)} m`;
  }

  return `${distanceFormatter.format(value / 1000)} km`;
}

export function formatDurationSeconds(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'N/A';
  }

  const totalMinutes = Math.max(1, Math.round(value / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${totalMinutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

