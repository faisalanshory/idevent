import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArticleForm } from "../../article-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  const article = await db.article.findUnique({
    where: { id, organizerId: organizer.id },
  });

  if (!article) notFound();

  return <ArticleForm initialArticle={article} />;
}
