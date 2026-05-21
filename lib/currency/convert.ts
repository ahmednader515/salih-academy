import type { DisplayCurrency } from "./constants";
import type { Locale } from "@/lib/i18n/types";

export type ExchangeRates = {
  EGP: 1;
  USD: number;
  SAR: number;
  /** ISO date (YYYY-MM-DD) from FX provider */
  date: string;
};

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  EGP: 1,
  USD: 0.0187,
  SAR: 0.0702,
  date: new Date().toISOString().slice(0, 10),
};

export function convertFromEgp(
  amountEgp: number,
  currency: DisplayCurrency,
  rates: ExchangeRates,
): number {
  if (!Number.isFinite(amountEgp)) return 0;
  if (currency === "EGP") return amountEgp;
  const mult = rates[currency];
  if (!Number.isFinite(mult) || mult <= 0) return amountEgp;
  return amountEgp * mult;
}

export function formatAmount(
  amount: number,
  locale: Locale,
  options?: { minFractionDigits?: number; maxFractionDigits?: number },
): string {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    minimumFractionDigits: options?.minFractionDigits ?? 2,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  }).format(amount);
}

export function formatMoneyParts(
  amountEgp: number,
  currency: DisplayCurrency,
  locale: Locale,
  rates: ExchangeRates,
): { amount: string; code: string } {
  const converted = convertFromEgp(amountEgp, currency, rates);
  return {
    amount: formatAmount(converted, locale),
    code: currency,
  };
}

export function formatMoney(
  amountEgp: number,
  currency: DisplayCurrency,
  locale: Locale,
  rates: ExchangeRates,
): string {
  const { amount, code } = formatMoneyParts(amountEgp, currency, locale, rates);
  return `${amount} ${code}`;
}
