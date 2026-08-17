import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArticleForm } from "../article-form";

export default async function NewArticlePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  return <ArticleForm />;
}
