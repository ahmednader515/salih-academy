"use client";

import { createContext, useContext, useMemo } from "react";
import {
  convertFromEgp,
  formatMoney,
  formatMoneyParts,
  type ExchangeRates,
} from "@/lib/currency/convert";
import type { DisplayCurrency } from "@/lib/currency/constants";
import { useLocale } from "./LocaleProvider";

type CurrencyContextValue = {
  currency: DisplayCurrency;
  rates: ExchangeRates;
  ratesDate: string;
  formatPrice: (amountEgp: number) => string;
  formatPriceParts: (amountEgp: number) => { amount: string; code: string };
  convertPrice: (amountEgp: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  rates,
  children,
}: {
  currency: DisplayCurrency;
  rates: ExchangeRates;
  children: React.ReactNode;
}) {
  const locale = useLocale();

  const value = useMemo<CurrencyContextValue>(() => {
    return {
      currency,
      rates,
      ratesDate: rates.date,
      formatPrice: (amountEgp: number) => formatMoney(amountEgp, currency, locale, rates),
      formatPriceParts: (amountEgp: number) => formatMoneyParts(amountEgp, currency, locale, rates),
      convertPrice: (amountEgp: number) => convertFromEgp(amountEgp, currency, rates),
    };
  }, [currency, rates, locale]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
