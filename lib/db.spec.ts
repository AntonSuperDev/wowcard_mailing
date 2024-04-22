import { parseCurrencyValue } from "./db";

describe("db - parseCurrencyValue", () => {
  it("should return null for a null value", () => {
    expect(parseCurrencyValue(null)).toEqual(null);
  });

  it("should parse an integer", () => {
    expect(parseCurrencyValue("123")).toEqual(123);
  });

  it("should parse a float", () => {
    expect(parseCurrencyValue("123.456")).toEqual(123.456);
  });
});
