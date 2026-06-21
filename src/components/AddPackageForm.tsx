"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPackageForm() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber, label }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setTrackingNumber("");
    setLabel("");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold">Track a Package</h2>
      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className="w-full border rounded px-3 py-2 font-mono text-sm"
      />
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional) — e.g. 'Birthday gift'"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading || !trackingNumber.trim()}
        className="w-full bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Package"}
      </button>
    </div>
  );
}
