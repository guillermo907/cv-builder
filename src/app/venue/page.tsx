import type { Metadata } from "next";
import { VenueWorkspace } from "@/components/venue/venue-workspace";
import { getAllEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Venue Console | Foro GDL",
  description:
    "Workspace del venue para crear eventos, estructurar ticketing, coordinar artistas y visualizar settlements."
};

export default async function VenuePage() {
  const events = await getAllEvents();
  return <VenueWorkspace initialEvents={events} />;
}
