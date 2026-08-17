import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SearchClient from "./search-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { q } = await searchParams;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  if (!q) {
    return <SearchClient initialQ="" />;
  }

  const [events, articles] = await Promise.all([
    db.event.findMany({
      where: {
        organizerId: organizer.id,
        status: { in: ["PUBLISHED", "SOLD_OUT"] },
        title: { contains: q },
      },
      include: { tickets: { select: { price: true } } },
      take: 10,
    }),
    db.article.findMany({
      where: {
        organizerId: organizer.id,
        status: "PUBLISHED",
        OR: [{ title: { contains: q } }, { excerpt: { contains: q } }],
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const results = {
    events: events.map(e => ({
      id: e.id, title: e.title, slug: e.slug, coverImage: e.coverImage,
      startDate: e.startDate.toISOString(), location: e.location, venue: e.venue,
      status: e.status,
      minPrice: e.tickets.length ? Math.min(...e.tickets.map(t => t.price)) : 0,
    })),
    articles: articles.map(a => ({
      id: a.id, title: a.title, slug: a.slug, coverImage: a.coverImage,
      excerpt: a.excerpt, publishedAt: a.publishedAt?.toISOString() ?? null, category: a.category,
    })),
  };

  return <SearchClient initialQ={q} results={results} />;
}
