import { describe, it, expect } from "vitest";
import { fitWithin } from "../src/util/fit";

describe("fitWithin", () => {
  it("scales down when source is larger than the box (aspect preserved)", () => {
    const r = fitWithin(1280, 720, 800, 520);
    expect(r.scale).toBeCloseTo(0.625);
    expect(r.width).toBeCloseTo(800);
    expect(r.height).toBeCloseTo(450);
  });

  it("does not enlarge when source is smaller than the box", () => {
    const r = fitWithin(400, 300, 1000, 1000);
    expect(r.scale).toBe(1);
    expect(r.width).toBe(400);
    expect(r.height).toBe(300);
  });

  it("respects whichever dimension is the tighter constraint", () => {
    const r = fitWithin(2000, 200, 1000, 100);
    expect(r.scale).toBeCloseTo(0.5);
    expect(r.height).toBeCloseTo(100);
  });

  it("returns zeros for non-positive inputs", () => {
    expect(fitWithin(0, 100, 100, 100)).toEqual({ scale: 0, width: 0, height: 0 });
    expect(fitWithin(100, 100, -1, 100)).toEqual({ scale: 0, width: 0, height: 0 });
  });
});
