import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EventForm } from "../../event-form";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  const event = await db.event.findUnique({
    where: { id, organizerId: organizer.id },
    include: { tickets: true },
  });

  if (!event) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return <EventForm initialEvent={event} categories={categories} />;
}
