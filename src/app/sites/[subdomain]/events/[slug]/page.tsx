import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import EventDetailClient from "./event-detail-client";

interface Props {
  params: Promise<{ subdomain: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) return {};
  const event = await db.event.findUnique({ where: { organizerId_slug: { organizerId: organizer.id, slug } } });
  if (!event) return {};
  return {
    title: `${event.title} | ${organizer.name}`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.coverImage ? [{ url: event.coverImage }] : [],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: Props) {
  const { subdomain, slug } = await params;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const event = await db.event.findUnique({
    where: { organizerId_slug: { organizerId: organizer.id, slug } },
    include: {
      tickets: { orderBy: { price: "asc" } },
      category: true,
      orders: { select: { id: true } },
    },
  });

  if (!event || event.status === "DRAFT") notFound();

  // Related events
  const relatedEvents = await db.event.findMany({
    where: {
      organizerId: organizer.id,
      status: { in: ["PUBLISHED", "SOLD_OUT"] },
      id: { not: event.id },
    },
    include: { tickets: { select: { price: true } } },
    take: 4,
    orderBy: { startDate: "asc" },
  });

  const serialized = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    tickets: event.tickets.map(t => ({
      ...t,
      saleStart: t.saleStart.toISOString(),
      saleEnd: t.saleEnd.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    category: event.category,
  };

  const relatedSerialized = relatedEvents.map(e => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    tickets: e.tickets,
  }));

  return <EventDetailClient event={serialized} organizer={organizer} relatedEvents={relatedSerialized} />;
}
