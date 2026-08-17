import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ETicketClient from "./eticket-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string; orderId: string }>;
}

export default async function ETicketPage({ params }: Props) {
  const { subdomain, orderId } = await params;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const order = await db.order.findFirst({
    where: { id: orderId, organizerId: organizer.id },
    include: {
      event: true,
      customer: true,
      orderItems: {
        include: {
          ticketType: true,
          tickets: true,
        },
      },
    },
  });

  if (!order || order.paymentStatus !== "PAID") notFound();

  const serialized = {
    id: order.id,
    customer: { name: order.customer.name, email: order.customer.email },
    event: {
      title: order.event.title,
      coverImage: order.event.coverImage,
      startDate: order.event.startDate.toISOString(),
      endDate: order.event.endDate.toISOString(),
      venue: order.event.venue,
      location: order.event.location,
      address: order.event.address,
    },
    organizer: { name: organizer.name, logo: organizer.logo, primaryColor: organizer.primaryColor },
    items: order.orderItems.map(item => ({
      ticketTypeName: item.ticketType.name,
      quantity: item.quantity,
      price: item.price,
      tickets: item.tickets.map(t => ({
        id: t.id,
        ticketCode: t.ticketCode,
        status: t.status,
      })),
    })),
  };

  return <ETicketClient order={serialized} />;
}
