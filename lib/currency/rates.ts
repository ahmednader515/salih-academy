import { getCachedExchangeRates, saveCachedExchangeRates } from "@/lib/db";
import { DEFAULT_EXCHANGE_RATES, type ExchangeRates } from "./convert";

const OPEN_ER_API_EGP_URL = "https://open.er-api.com/v6/latest/EGP";
const CDN_EGP_RATES_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/egp.json";

function isSameUtcDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function parseRatesJson(json: string): ExchangeRates | null {
  try {
    const raw = JSON.parse(json) as Partial<ExchangeRates>;
    const usd = Number(raw.USD);
    const sar = Number(raw.SAR);
    const date = typeof raw.date === "string" ? raw.date.slice(0, 10) : "";
    if (!Number.isFinite(usd) || !Number.isFinite(sar) || usd <= 0 || sar <= 0 || !date) {
      return null;
    }
    return { EGP: 1, USD: usd, SAR: sar, date };
  } catch {
    return null;
  }
}

function buildRates(usd: number, sar: number, date: string): ExchangeRates {
  if (!Number.isFinite(usd) || !Number.isFinite(sar) || usd <= 0 || sar <= 0) {
    throw new Error("Invalid FX rates");
  }
  return { EGP: 1, USD: usd, SAR: sar, date: date.slice(0, 10) };
}

/** open.er-api.com — supports EGP base (Frankfurter does not). */
async function fetchRatesFromOpenErApi(): Promise<ExchangeRates> {
  const res = await fetch(OPEN_ER_API_EGP_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FX API ${res.status}`);
  }
  const data = (await res.json()) as {
    result?: string;
    base_code?: string;
    rates?: { USD?: number; SAR?: number };
    time_last_update_unix?: number;
  };
  if (data.result !== "success" || data.base_code !== "EGP") {
    throw new Error("Invalid open.er-api.com response");
  }
  const date =
    typeof data.time_last_update_unix === "number"
      ? new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  return buildRates(Number(data.rates?.USD), Number(data.rates?.SAR), date);
}

/** jsDelivr mirror of fawazahmed0/currency-api (EGP → USD/SAR multipliers). */
async function fetchRatesFromCdnFallback(): Promise<ExchangeRates> {
  const res = await fetch(CDN_EGP_RATES_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FX CDN ${res.status}`);
  }
  const data = (await res.json()) as {
    date?: string;
    egp?: { usd?: number; sar?: number };
  };
  const date = String(data.date ?? new Date().toISOString().slice(0, 10));
  return buildRates(Number(data.egp?.usd), Number(data.egp?.sar), date);
}

/** Custom URL: Frankfurter-style `{ rates: { USD, SAR }, date }` or open.er-api v6 JSON. */
async function fetchRatesFromCustomUrl(url: string): Promise<ExchangeRates> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FX API ${res.status}`);
  }
  const data = (await res.json()) as {
    result?: string;
    base_code?: string;
    rates?: { USD?: number; SAR?: number };
    date?: string;
    time_last_update_unix?: number;
  };
  if (data.result === "success" && data.rates) {
    const date =
      typeof data.time_last_update_unix === "number"
        ? new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    return buildRates(Number(data.rates.USD), Number(data.rates.SAR), date);
  }
  const date = String(data.date ?? new Date().toISOString().slice(0, 10));
  return buildRates(Number(data.rates?.USD), Number(data.rates?.SAR), date);
}

async function fetchRatesFromApi(): Promise<ExchangeRates> {
  const custom = process.env.FX_API_URL?.trim();
  if (custom) {
    return fetchRatesFromCustomUrl(custom);
  }
  try {
    return await fetchRatesFromOpenErApi();
  } catch (primaryErr) {
    console.warn("Primary FX API failed, using CDN fallback:", primaryErr);
    return fetchRatesFromCdnFallback();
  }
}

/** Daily exchange rates (EGP base). Cached in HomepageSetting; refreshes once per UTC day. */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = new Date();
  const cached = await getCachedExchangeRates();

  if (cached.json && cached.fetchedAt && isSameUtcDay(cached.fetchedAt, now)) {
    const parsed = parseRatesJson(cached.json);
    if (parsed) return parsed;
  }

  try {
    const fresh = await fetchRatesFromApi();
    await saveCachedExchangeRates(JSON.stringify(fresh), now);
    return fresh;
  } catch (e) {
    console.warn("getExchangeRates fetch failed, using cache or defaults:", e);
    if (cached.json) {
      const parsed = parseRatesJson(cached.json);
      if (parsed) return parsed;
    }
    return DEFAULT_EXCHANGE_RATES;
  }
}
