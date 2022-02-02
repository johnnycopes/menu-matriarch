import { calculateTallyChange } from "./calculate-tally-change";

describe('calculateTallyChange', () => {
  const tally: Record<string, number> = {
    fruits: 3,
    vegetables: 1,
    produce: 0,
  };

  it('returns 1 on increment when value is 0', () => {
    expect(calculateTallyChange({
      tally,
      key: 'produce',
      change: 'increment',
    })).toBe(1);
  });

  it('returns 0 on increment when value is greater than 0', () => {
    expect(calculateTallyChange({
      tally,
      key: 'vegetables',
      change: 'increment',
    })).toBe(0);
  });

  it('returns 0 on decrement when value is greater than 1', () => {
    expect(calculateTallyChange({
      tally,
      key: 'fruits',
      change: 'decrement',
    })).toBe(0);
  });

  it('returns -1 on decrement when value is 1', () => {
    expect(calculateTallyChange({
      tally,
      key: 'vegetables',
      change: 'decrement',
    })).toBe(-1);
  });

  it('returns -1 on clear, regardless of value', () => {
    expect(calculateTallyChange({
      tally,
      key: 'fruits',
      change: 'clear',
    })).toBe(-1);

    expect(calculateTallyChange({
      tally,
      key: 'produce',
      change: 'clear',
    })).toBe(-1);
  });
});
