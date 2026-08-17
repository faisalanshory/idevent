import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventsClient } from "./events-client";

export const revalidate = 0; // Fetch fresh data

export default async function OrganizerEventsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  // Fetch events for this organizer, including their tickets
  const events = await db.event.findMany({
    where: { organizerId: organizer.id },
    include: {
      tickets: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch categories for dropdown
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <EventsClient
      initialEvents={events as any}
      categories={categories}
    />
  );
}
