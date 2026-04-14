/**
 * Formats a number to Indian currency format with Cr/Lakh suffixes.
 * Removes trailing zeros in decimals (e.g., ₹46.00 Lakh -> ₹46 Lakh).
 */
export function formatPrice(price: number, options: { short?: boolean } = {}): string {
  const { short = false } = options;

  if (price >= 10000000) {
    const val = Number((price / 10000000).toFixed(2));
    return `₹${val} Cr`;
  } else if (price >= 100000) {
    const val = Number((price / 100000).toFixed(2));
    const suffix = short ? "L" : "Lakh";
    return `₹${val} ${suffix}`;
  }
  
  return `₹${price.toLocaleString("en-IN")}`;
}
