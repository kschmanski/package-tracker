"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type TrackingEvent = {
  id: string;
  description: string;
  location: string | null;
  timestamp: Date;
  status: string;
};

type Props = {
  pkg: {
    id: string;
    carrier: string;
    trackingNumber: string;
    label: string | null;
    delivered: boolean;
    lastChecked: Date | null;
    events: TrackingEvent[];
  };
};

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PackageCard({ pkg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const latestEvent = pkg.events[0];

  const refresh = async () => {
    setLoading(true);
    await fetch(`/api/track/${pkg.carrier.toLowerCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: pkg.id }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <li className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{pkg.label ?? pkg.trackingNumber}</div>
          {pkg.label && (
            <div className="font-mono text-xs text-gray-400">
              {pkg.trackingNumber}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-0.5">{pkg.carrier}</div>
        </div>
        {pkg.delivered && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Delivered
          </span>
        )}
      </div>

      {latestEvent ? (
        <div className="text-sm text-gray-600">
          <span>{latestEvent.description}</span>
          {latestEvent.location && (
            <span className="text-gray-400"> · {latestEvent.location}</span>
          )}
          <div className="text-xs text-gray-400 mt-0.5">
            {formatTimestamp(latestEvent.timestamp)}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          No tracking updates yet. Hit refresh.
        </div>
      )}

      {pkg.events.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {expanded
            ? "▲ Hide history"
            : `▼ Show ${pkg.events.length - 1} more event${pkg.events.length - 1 === 1 ? "" : "s"}`}
        </button>
      )}

      {expanded && (
        <ul className="border-l-2 border-gray-100 ml-1 pl-3 space-y-3 pt-1 max-h-48 overflow-y-auto">
          {pkg.events.slice(1).map((event) => (
            <li key={event.id} className="space-y-0.5">
              <div className="text-sm text-gray-600">{event.description}</div>
              {event.location && (
                <div className="text-xs text-gray-400">{event.location}</div>
              )}
              <div className="text-xs text-gray-400">
                {formatTimestamp(event.timestamp)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">
          {pkg.lastChecked
            ? `Updated ${new Date(pkg.lastChecked).toLocaleString()}`
            : "Never checked"}
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </li>
  );
}
