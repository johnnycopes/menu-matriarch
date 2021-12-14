import { TrackByFunction } from "@angular/core";

export function trackByFactory<TItem, TId>(getId: (item: TItem) => TId): TrackByFunction<TItem> {
  return function(index: number, item: TItem): TId {
    return getId(item);
  }
}
