"use client";

import { SUPPORTED_CURRENCIES, type DisplayCurrency } from "@/lib/currency/constants";
import { useT } from "./LocaleProvider";

type CurrencySelectFieldProps = {
  value: DisplayCurrency;
  onChange: (currency: DisplayCurrency) => void;
  id?: string;
};

export function CurrencySelectField({ value, onChange, id = "display_currency" }: CurrencySelectFieldProps) {
  const t = useT();

  return (
    <div>
      <div
        id={id}
        className="mt-1 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={t("currency.selectLabel", "Currency")}
      >
        {SUPPORTED_CURRENCIES.map((code) => {
          const selected = value === code;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(code)}
              className={`min-w-[4.5rem] rounded-[var(--radius-btn)] border px-4 py-2.5 text-sm font-bold tracking-wide transition ${
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              {code}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {t("currency.accountPermanentNote", "This currency will be used for all prices on your account and cannot be changed later.")}
      </p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        {t("currency.chargedInEgpNote", "Charges are deducted from your balance in EGP.")}
      </p>
    </div>
  );
}
