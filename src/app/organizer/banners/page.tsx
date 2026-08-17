import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BannersClient } from "./banners-client";

export const revalidate = 0;

export default async function BannersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  const banners = await db.banner.findMany({
    where: { organizerId: organizer.id },
    orderBy: { sortOrder: "asc" },
  });

  return <BannersClient initialBanners={banners as any} />;
}
