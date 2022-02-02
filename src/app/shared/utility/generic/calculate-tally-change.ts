export function calculateTallyChange({ tally, key, change }: {
  tally: Record<string, number>,
  key: string,
  change: 'increment' | 'decrement' | 'clear',
}): 1 | 0 | -1 {
  const count = tally[key] ?? 0;
  if (count === 0 && change === 'increment') {
    return 1;
  } else if ((count === 1 && change === 'decrement') || change === 'clear') {
    return -1;
  }
  return 0;
}
