import { config } from "dotenv";
config({ path: ".env.local" });

import {
  trackFedExBatch,
  normalizeFedExEvents,
} from "../src/lib/carriers/fedex";

async function main() {
  const trackingNumber = "480792844525"; // replace with a real number if you have one

  try {
    console.log("Fetching token...");
    const raw = await trackFedExBatch([trackingNumber]);
    console.log("Raw response:", JSON.stringify(raw, null, 2));

    const events = normalizeFedExEvents(raw, trackingNumber);
    console.log("\nNormalized events:", events);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
