export type DisplayCurrency = "EGP" | "SAR" | "USD";

export const SUPPORTED_CURRENCIES: DisplayCurrency[] = ["EGP", "SAR", "USD"];

export const DEFAULT_CURRENCY: DisplayCurrency = "EGP";

/** Short codes shown next to formatted amounts */
export const CURRENCY_CODES: Record<DisplayCurrency, string> = {
  EGP: "EGP",
  SAR: "SAR",
  USD: "USD",
};

export function normalizeCurrency(value: string | undefined | null): DisplayCurrency {
  const v = value?.trim().toUpperCase();
  if (v === "USD" || v === "SAR") return v;
  return "EGP";
}
