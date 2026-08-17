import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export const revalidate = 0; // Fresh DB query

export default async function OrganizerSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  // Fetch organizer details including siteSettings
  const orgDetails = await db.organizer.findUnique({
    where: { id: organizer.id },
    include: {
      siteSetting: true,
    },
  });

  if (!orgDetails) redirect("/login");

  return <SettingsClient initialSettings={orgDetails as any} />;
}
