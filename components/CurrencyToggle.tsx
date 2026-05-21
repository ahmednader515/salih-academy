"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CURRENCY_COOKIE_NAME, SUPPORTED_CURRENCIES, type DisplayCurrency } from "@/lib/currency/constants";
import { useCurrency } from "./CurrencyProvider";
import { useT } from "./LocaleProvider";

/**
 * Floating vertical currency switcher on the physical left edge (MHM-style).
 * Rendered via portal so it is not clipped by page overflow/stacking contexts.
 */
export function CurrencyToggle() {
  const t = useT();
  const router = useRouter();
  const { currency, ratesDate } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSelect(next: DisplayCurrency) {
    if (next === currency) return;
    document.cookie = `${CURRENCY_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const title = `${t("currency.selectLabel", "Currency")} — ${t("currency.rateUpdated", "Rates updated")} ${ratesDate}`;

  const panel = (
    <aside
      className="currency-floating-toggle pointer-events-auto fixed top-1/2 z-[100] -translate-y-1/2 print:hidden"
      aria-label={t("currency.selectLabel", "Currency")}
      title={title}
    >
      <div
        className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--color-primary)]/70 bg-[#0f172a] shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] ring-2 ring-white/15"
        role="group"
      >
        {SUPPORTED_CURRENCIES.map((code, index) => {
          const isActive = currency === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`min-w-[3rem] px-2.5 py-3.5 text-xs font-extrabold tracking-wide transition sm:min-w-[3.25rem] sm:text-sm ${
                index > 0 ? "border-t border-white/15" : ""
              } ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[#1e293b] text-white/95 hover:bg-[#334155]"
              }`}
              aria-pressed={isActive}
              aria-label={t(`currency.${code}`, code)}
              aria-current={isActive ? "true" : undefined}
            >
              {code}
            </button>
          );
        })}
      </div>
    </aside>
  );

  if (!mounted) return null;
  return createPortal(panel, document.body);
}
