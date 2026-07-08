import { createBatches } from "./batching.service";

describe("createBatches", () => {
  it("splits an array into correctly sized batches", () => {
    const items = Array.from({ length: 10 }, (_, i) => i + 1);
    const batches = createBatches(items, 3);

    expect(batches.length).toBe(4);
    expect(batches[0]).toEqual([1, 2, 3]);
    expect(batches[3]).toEqual([10]);
  });

  it("returns a single batch if items are fewer than batch size", () => {
    const items = [1, 2, 3];
    const batches = createBatches(items, 25);

    expect(batches.length).toBe(1);
    expect(batches[0]).toEqual([1, 2, 3]);
  });

  it("returns an empty array when given no items", () => {
    const batches = createBatches([], 25);
    expect(batches.length).toBe(0);
  });

  it("uses default batch size of 25 when not specified", () => {
    const items = Array.from({ length: 30 }, (_, i) => i + 1);
    const batches = createBatches(items);

    expect(batches.length).toBe(2);
    expect(batches[0].length).toBe(25);
    expect(batches[1].length).toBe(5);
  });
});