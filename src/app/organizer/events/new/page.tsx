import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "../event-form";

export const revalidate = 0;

export default async function NewEventPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return <EventForm categories={categories} />;
}
