export const CURRENCY_CODE = "MXN";
export const CURRENCY_SYMBOL = "$";

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: CURRENCY_CODE,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(n: number): string {
  return fmt.format(Math.abs(n));
}

/**
 * Convert an <input type="date"> value ("YYYY-MM-DD") to an ISO timestamp
 * anchored at LOCAL noon. Anchoring at noon (instead of UTC midnight) keeps
 * the calendar day stable in every timezone — with `new Date("YYYY-MM-DD")`
 * the date is parsed as UTC midnight, which in Mexico displays as the
 * previous day.
 */
export function dateInputToISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

/** Format a Date as the LOCAL "YYYY-MM-DD" an <input type="date"> expects. */
export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return "Today";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
