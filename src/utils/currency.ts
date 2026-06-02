import type { SupportedCurrency, CurrencyInfo } from '../types';

const NO_DECIMAL_CURRENCIES: SupportedCurrency[] = ['JPY', 'IDR'];

export const CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToPHP: 58.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToPHP: 63.2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToPHP: 74.1 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToPHP: 0.39 },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateToPHP: 1.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToPHP: 0.70 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateToPHP: 0.0037 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToPHP: 43.4 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToPHP: 38.2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToPHP: 43.0 },
};

// Convert an amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to PHP first, then to target
  const inPHP = amount * CURRENCIES[fromCurrency].rateToPHP;
  return inPHP / CURRENCIES[toCurrency].rateToPHP;
}

// Format an amount in the given currency
export function formatCurrencyCode(
  amount: number,
  currency: SupportedCurrency,
  options: Partial<{ showSymbol: boolean; compact: boolean }> = {}
): string {
  const { showSymbol = true, compact = false } = options;
  const info = CURRENCIES[currency];

  // For JPY and IDR, no decimal places
  const decimals = NO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 0;

  let value = amount;
  let suffix = '';

  if (compact && amount >= 1000) {
    if (amount >= 1_000_000) {
      value = amount / 1_000_000;
      suffix = 'M';
    } else if (amount >= 1_000) {
      value = amount / 1_000;
      suffix = 'k';
    }
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  if (!showSymbol) {
    return `${formatted}${suffix}`;
  }

  // For IDR and JPY, put symbol after for large numbers, otherwise before
  if (NO_DECIMAL_CURRENCIES.includes(currency)) {
    return `${formatted}${suffix}${info.symbol}`;
  }

  return `${info.symbol}${formatted}${suffix}`;
}

// Get locale code for a currency (for Intl.NumberFormat)
function getCurrencyLocale(currency: SupportedCurrency): string {
  const localeMap: Record<SupportedCurrency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    PHP: 'en-PH',
    INR: 'en-IN',
    IDR: 'id-ID',
    SGD: 'en-SG',
    AUD: 'en-AU',
    CAD: 'en-CA',
  };
  return localeMap[currency];
}

// Format with proper locale (symbol placement varies by currency)
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD'
): string {
  const locale = getCurrencyLocale(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for currencies without locale support
    return `${CURRENCIES[currency].symbol}${amount.toLocaleString()}`;
  }
}

export const CURRENCY_LIST: SupportedCurrency[] = [
  'USD', 'EUR', 'GBP', 'JPY', 'PHP', 'INR', 'IDR', 'SGD', 'AUD', 'CAD',
];

export function getCurrencyInfo(currency: SupportedCurrency): CurrencyInfo {
  return CURRENCIES[currency];
}