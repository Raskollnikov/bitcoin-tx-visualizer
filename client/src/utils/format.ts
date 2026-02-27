export function satsToBtc(sats: number): string {
  return (sats / 1_000_00_000).toFixed(8);
}

export function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString();
}

export function shortenHash(hash: string, start = 8, end = 6): string {
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}
