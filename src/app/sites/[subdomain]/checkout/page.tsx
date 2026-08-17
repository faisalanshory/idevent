import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import CheckoutForm from "./checkout-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ items?: string; event?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { items: itemsParam, event: eventId } = await searchParams;

  if (!itemsParam || !eventId) redirect("/events");

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const event = await db.event.findFirst({
    where: { id: eventId, organizerId: organizer.id },
    include: { tickets: true },
  });
  if (!event) notFound();

  // Parse items: "ticketTypeId:quantity,..."
  const selections: { ticket: any; quantity: number }[] = [];
  for (const part of (itemsParam || "").split(",")) {
    const [id, qty] = part.split(":");
    const q = parseInt(qty);
    if (!id || !q || q < 1) continue;
    const ticket = event.tickets.find(t => t.id === id);
    if (ticket) selections.push({ ticket, quantity: q });
  }
  if (selections.length === 0) redirect(`/events/${event.slug}`);

  const subtotal = selections.reduce((acc, s) => acc + s.ticket.price * s.quantity, 0);

  const serializedEvent = {
    id: event.id, title: event.title, slug: event.slug, coverImage: event.coverImage,
    startDate: event.startDate.toISOString(), location: event.location, venue: event.venue,
  };
  const serializedSelections = selections.map(s => ({
    ticket: { ...s.ticket, saleStart: s.ticket.saleStart.toISOString(), saleEnd: s.ticket.saleEnd.toISOString(), createdAt: s.ticket.createdAt.toISOString(), updatedAt: s.ticket.updatedAt.toISOString() },
    quantity: s.quantity,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest site-primary mb-1">Hampir Selesai!</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Checkout</h1>
        </div>
        <CheckoutForm
          event={serializedEvent}
          selections={serializedSelections}
          subtotal={subtotal}
          organizerId={organizer.id}
        />
      </div>
    </div>
  );
}
