/**
 * Construct a fake URL object so that we can lean on the URL object's
 * parsing capabilities.
 * @param path The path portion of the URL (do not include the hostname)
 * @returns A URL object with a dummy hostname and the given route path
 */
export function createURLObj(path: string) {
  /**
   * Used to construct a fake URL object so that we can lean on the
   * URL object's parsing capabilities.
   */
  const DUMMY_URL_ROOT = "http://asdf.com";
  return new URL(`${DUMMY_URL_ROOT}${path}`);
}
