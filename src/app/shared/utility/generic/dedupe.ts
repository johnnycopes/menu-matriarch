export function dedupe<T>(...arrays: T[][]): T[] {
  const allItems = [];
  for (let arr of arrays) {
    allItems.push(...arr);
  }
  return [...new Set(allItems)]
}
