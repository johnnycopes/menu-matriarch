import { lower } from "./format";

export function includes(collection: string[], value: string): boolean {
  return collection.some(str => lower(str).includes(lower(value)));
}
