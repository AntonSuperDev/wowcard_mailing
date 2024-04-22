/**
 * Convert the given byte array to a hex-encoded string.
 * @param byteArray An array of numbers representing bytes
 * @returns A hex-encoded string
 */
export function toHexString(byteArray: number[]) {
  return Array.from(byteArray, (byte) =>
    ("0" + (byte & 0xff).toString(16)).slice(-2),
  ).join("");
}

/**
 * Convert the given hex-encoded string to a byte array.
 * @param str A hex-encoded string
 * @returns A byte array
 */
export function toByteArray(str: string) {
  return Buffer.from(str, "hex");
}
