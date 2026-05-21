import { cookies } from "next/headers";
import { CURRENCY_COOKIE_NAME, DEFAULT_CURRENCY, normalizeCurrency } from "./constants";
import type { DisplayCurrency } from "./constants";

export async function getCurrencyFromCookie(): Promise<DisplayCurrency> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  return normalizeCurrency(cookieValue ?? DEFAULT_CURRENCY);
}
