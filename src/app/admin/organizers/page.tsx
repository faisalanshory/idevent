import { db } from "@/lib/db";
import { OrganizersClient } from "./organizers-client";

export const revalidate = 0; // Disable page caching to load real-time additions/deletions

export default async function AdminOrganizersPage() {
  const organizers = await db.organizer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <OrganizersClient initialOrganizers={organizers} />;
}
