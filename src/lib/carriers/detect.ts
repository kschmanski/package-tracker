export type Carrier = "UPS" | "USPS" | "FEDEX" | "DHL";

// helpful function to detect the Carrier for the given trackingNumber
export function detectCarrier(trackingNumber: string): Carrier | null {
  // trim, cast to uppercase, and remove whitespace
  const n = trackingNumber.trim().toUpperCase().replace(/\s/g, "");

  // all UPS packages start with "1Z"
  if (/^1Z/.test(n)) return "UPS";

  // USPS packages start with "9x" and 16-18 more digits
  if (/^(94|93|92|91|9400)\d{16,18}$/.test(n) || /^\d{20,22}$/.test(n))
    return "USPS";

  // Fedex have 12 digits, 15 digits, or start with "96" and have 20 digits total
  if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n) || /^96\d{18}$/.test(n))
    return "FEDEX";

  // DHL starts with "JD" followed by 18 digits, or just 10-11 digits
  if (/^JD\d{18}$/.test(n) || /^\d{10,11}$/.test(n)) return "DHL";

  // Can't detect carrier so return null
  return null;
}
