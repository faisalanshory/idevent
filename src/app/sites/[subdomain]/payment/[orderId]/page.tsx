import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PaymentStatusClient from "./payment-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string; orderId: string }>;
}

export default async function PaymentPage({ params }: Props) {
  const { subdomain, orderId } = await params;

  const organizer = await db.organizer.findUnique({ where: { subdomain } });
  if (!organizer) notFound();

  const order = await db.order.findFirst({
    where: { id: orderId, organizerId: organizer.id },
    include: {
      event: true,
      customer: true,
      payment: true,
      orderItems: { include: { ticketType: true } },
    },
  });

  if (!order) notFound();

  const serialized = {
    id: order.id,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    customer: { name: order.customer.name, email: order.customer.email },
    event: { title: order.event.title, coverImage: order.event.coverImage },
    payment: order.payment ? {
      paymentMethod: order.payment.paymentMethod,
      amount: order.payment.amount,
      expiredAt: order.payment.expiredAt?.toISOString(),
      rawResponse: order.payment.rawResponse,
    } : null,
    items: order.orderItems.map(i => ({
      name: i.ticketType.name, quantity: i.quantity, price: i.price,
    })),
  };

  return <PaymentStatusClient order={serialized} />;
}
