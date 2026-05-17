"use client";

import Link from "next/link";
import { useCachedData } from "@/hooks/useCachedData";

type PublicEventCard = {
  slug: string;
  title: string;
  startsAt: string;
  venueName: string;
  ticketPriceMXN: number;
  availability: number;
};

type EventFeedProps = {
  seedEvents: PublicEventCard[];
};

async function fetchPublicEvents() {
  const response = await fetch("/api/public/events", {
    method: "GET",
    cache: "no-store",
    headers: {
      "x-client-profile": "low-bandwidth-4g"
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load upcoming events.");
  }

  return (await response.json()) as PublicEventCard[];
}

export function EventFeed({ seedEvents }: EventFeedProps) {
  const { data, isLoading, isStale } = useCachedData<PublicEventCard[]>({
    cacheKey: "foro-gdl-public-events-feed",
    fetcher: fetchPublicEvents,
    initialData: seedEvents,
    ttlMs: 1000 * 30,
    revalidateOnMount: true,
  });

  const events = data ?? seedEvents;

  return (
    <section aria-labelledby="upcoming-events-title">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
        <h2 id="upcoming-events-title" style={{ margin: 0 }}>
          Upcoming public drops
        </h2>
        <small>{isLoading ? "Refreshing..." : isStale ? "Cached, refresh pending" : "Fresh local cache"}</small>
      </div>
      <div
        style={{
          display: "grid",
          gap: "0.875rem",
          marginTop: "1rem"
        }}
      >
        {events.map((event) => (
          <article
            key={event.slug}
            style={{
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              background: "var(--panel)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 0.35rem 0" }}>{event.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {new Date(event.startsAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}{" "}
                  at {event.venueName}
                </p>
              </div>
              <strong>${event.ticketPriceMXN} MXN</strong>
            </div>
            <div style={{ marginTop: "0.85rem", display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
              <span style={{ color: "var(--muted)" }}>{event.availability} tickets left</span>
              <Link href={`/events/${event.slug}`}>Open event</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
