import type { Session } from "next-auth";
import { DEFAULT_CURRENCY, normalizeCurrency, type DisplayCurrency } from "./constants";

/** Currency for price display: account preference when logged in, else EGP (guests / legacy). */
export function getCurrencyForRequest(session: Session | null): DisplayCurrency {
  const raw = (session?.user as { displayCurrency?: string | null } | undefined)?.displayCurrency;
  if (raw?.trim()) {
    return normalizeCurrency(raw);
  }
  return DEFAULT_CURRENCY;
}
