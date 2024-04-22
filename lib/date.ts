/**
 * Get a date string in ISO format when we don't care about the timezone.
 * 'Date.prototype.toISOString` uses the UTC date value, which might be
 * different from the date we want.
 * @param date The date to translate into a string
 * @returns An ISO-formatted date string (ex. 2012-01-01)
 */
export function toISODateNoTimezone(date: string | Date): string {
  if (date === "") {
    return "";
  }

  const dateObj = new Date(
    typeof date !== "string" ? date : `${date.substring(0, 10)}T00:00:00`,
  );

  return `${dateObj.getFullYear().toString().padStart(2, "0")}-${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`;
}
