import { describe, it, expect } from "bun:test";
import { normalizeAgeInput, ageToBucket, bucketToMidpoint, isValidAgeBucket, AGE_BUCKETS } from "../utils/ageUtils";

describe("ageUtils", () => {
  it("exposes AGE_BUCKETS and TargetAge values", () => {
    expect(Array.isArray(AGE_BUCKETS)).toBe(true);
    expect(AGE_BUCKETS).toContain("4-6");
    expect(AGE_BUCKETS).toContain("7-9");
    expect(AGE_BUCKETS).toContain("10-12");
  });

  it("validates age buckets", () => {
    expect(isValidAgeBucket("4-6")).toBe(true);
    expect(isValidAgeBucket("7-9")).toBe(true);
    expect(isValidAgeBucket("10-12")).toBe(true);
    expect(isValidAgeBucket("7-12")).toBe(false);
    expect(isValidAgeBucket("kids")).toBe(false);
  });

  it("bucketToMidpoint maps correctly", () => {
    expect(bucketToMidpoint("4-6")).toBe(5);
    expect(bucketToMidpoint("7-9")).toBe(8);
    expect(bucketToMidpoint("10-12")).toBe(11);
  });

  it("ageToBucket maps numeric ages", () => {
    expect(ageToBucket(4)).toBe("4-6");
    expect(ageToBucket(6)).toBe("4-6");
    expect(ageToBucket(7)).toBe("7-9");
    expect(ageToBucket(9)).toBe("7-9");
    expect(ageToBucket(10)).toBe("10-12");
    expect(ageToBucket(12)).toBe("10-12");
    // below min coerces to lowest bucket; above max is undefined
    expect(ageToBucket(3)).toBe("4-6");
    expect(ageToBucket(13)).toBeUndefined();
  });

  it("normalizeAgeInput handles buckets", () => {
    expect(normalizeAgeInput("4-6")).toBe("4-6");
    expect(normalizeAgeInput("7-9")).toBe("7-9");
    expect(normalizeAgeInput("10-12")).toBe("10-12");
  });

  it("normalizeAgeInput handles numbers and ranges", () => {
    expect(normalizeAgeInput("4")).toBe("4-6");
    expect(normalizeAgeInput(8)).toBe("7-9");
    expect(normalizeAgeInput("11")).toBe("10-12");
    expect(normalizeAgeInput("5-7")).toBe("4-6");
    expect(normalizeAgeInput("10 - 12")).toBe("10-12");
    expect(normalizeAgeInput("foo")).toBeUndefined();
    expect(normalizeAgeInput(undefined)).toBeUndefined();
    expect(normalizeAgeInput(null)).toBeUndefined();
  });
});