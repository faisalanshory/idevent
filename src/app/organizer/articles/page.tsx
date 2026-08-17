import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArticlesClient } from "./articles-client";

export const revalidate = 0; // Fetch fresh data

export default async function OrganizerArticlesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  // Fetch articles for this organizer
  const articles = await db.article.findMany({
    where: { organizerId: organizer.id },
    orderBy: { createdAt: "desc" },
  });

  return <ArticlesClient initialArticles={articles as any} />;
}
