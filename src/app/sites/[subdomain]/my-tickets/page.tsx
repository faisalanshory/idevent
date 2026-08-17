import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";
import CustomerLogin from "./customer-login";
import CustomerDashboard from "./customer-dashboard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ subdomain: string }>;
}

export default async function MyTicketsPage({ params }: Props) {
  const { subdomain } = await params;

  const organizer = await db.organizer.findUnique({
    where: { subdomain },
  });

  if (!organizer) notFound();

  const customer = await getCustomerSession();

  if (!customer || customer.organizerId !== organizer.id) {
    return <CustomerLogin organizerId={organizer.id} />;
  }

  // Fetch tickets for logged in customer
  const orders = await db.order.findMany({
    where: { customerId: customer.id, paymentStatus: "PAID" },
    include: {
      event: true,
      orderItems: { include: { ticketType: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const tickets = orders.flatMap(order => 
    order.orderItems.map(item => ({
      orderId: order.id,
      eventTitle: order.event.title,
      eventDate: order.event.startDate.toISOString(),
      venue: order.event.venue || order.event.location,
      ticketType: item.ticketType.name,
      quantity: item.quantity,
      status: order.event.status,
    }))
  );

  const customerData = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    notifEmailOrder: customer.notifEmailOrder,
    notifEmailReminder: customer.notifEmailReminder,
    notifWaOrder: customer.notifWaOrder,
    notifWaReminder: customer.notifWaReminder,
  };

  return <CustomerDashboard customer={customerData} tickets={tickets} subdomain={subdomain} />;
}
