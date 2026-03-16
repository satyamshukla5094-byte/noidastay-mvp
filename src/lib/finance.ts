import { Decimal } from "decimal.js";

const GST_RATE = new Decimal(0.18);

export interface RevenueBreakdown {
  gross: Decimal;
  tax: Decimal;
  net: Decimal;
}

/**
 * Calculates financial breakdown for a transaction
 * Ensures high precision for currency calculations
 */
export function calculateRevenueBreakdown(amount: number | string | Decimal): RevenueBreakdown {
  const gross = new Decimal(amount);
  const tax = gross.mul(GST_RATE).toDecimalPlaces(2);
  const net = gross.minus(tax).toDecimalPlaces(2);

  return { gross, tax, net };
}

/**
 * Calculates referral debt subtraction
 */
export function calculateNetWithReferral(brokerageFee: number | string | Decimal, referralCredits: number | string | Decimal): Decimal {
  const fee = new Decimal(brokerageFee);
  const credits = new Decimal(referralCredits);
  
  // Credits cannot exceed the fee
  const subtraction = Decimal.min(fee, credits);
  return fee.minus(subtraction).toDecimalPlaces(2);
}
