import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VerifyClient } from "./verify-client";

export const revalidate = 0;

export default async function OrganizerVerifyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  // Fetch only events that are PUBLISHED or SOLD_OUT (which would have tickets)
  const events = await db.event.findMany({
    where: { 
      organizerId: organizer.id,
      status: { in: ["PUBLISHED", "SOLD_OUT"] }
    },
    select: { id: true, title: true },
    orderBy: { startDate: "asc" },
  });

  return <VerifyClient events={events} />;
}
