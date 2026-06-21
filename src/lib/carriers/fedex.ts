let tokenCache: { token: string; expiresAt: number } | null = null;

const BASE_URL = "https://apis.fedex.com";

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.FEDEX_CLIENT_ID!,
      client_secret: process.env.FEDEX_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`FedEx auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function trackFedExBatch(trackingNumbers: string[]) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/track/v1/trackingnumbers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-locale": "en_US",
    },
    body: JSON.stringify({
      includeDetailedScans: true,
      trackingInfo: trackingNumbers.map((n) => ({
        trackingNumberInfo: { trackingNumber: n },
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`FedEx tracking failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function normalizeFedExEvents(raw: any, trackingNumber: string) {
  const result = raw?.output?.completeTrackResults?.find(
    (r: any) => r.trackingNumber === trackingNumber,
  );
  const trackResult = result?.trackResults?.[0];
  const scans = trackResult?.scanEvents ?? [];

  return scans.map((s: any) => ({
    status: s.derivedStatus ?? "UNKNOWN",
    description: s.eventDescription ?? "",
    location: [s.scanLocation?.city, s.scanLocation?.stateOrProvinceCode]
      .filter(Boolean)
      .join(", "),
    timestamp: new Date(s.date),
  }));
}
