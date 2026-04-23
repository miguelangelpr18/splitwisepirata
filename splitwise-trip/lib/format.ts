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
