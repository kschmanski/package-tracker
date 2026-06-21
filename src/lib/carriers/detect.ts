export type Carrier = "UPS" | "USPS" | "FEDEX" | "DHL";

export function detectCarrier(trackingNumber: string): Carrier | null {
  const n = trackingNumber.trim().toUpperCase().replace(/\s/g, "");

  if (/^1Z/.test(n)) return "UPS";

  if (/^(94|93|92|91|9400)\d{16,18}$/.test(n) || /^\d{20,22}$/.test(n))
    return "USPS";

  if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n) || /^96\d{18}$/.test(n))
    return "FEDEX";

  if (/^JD\d{18}$/.test(n) || /^\d{10,11}$/.test(n)) return "DHL";

  return null;
}
