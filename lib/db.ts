export function parseCurrencyValue(value: string | null) {
  return value === null ? null : parseFloat(value);
}
