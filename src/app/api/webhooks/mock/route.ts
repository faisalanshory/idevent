import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/webhooks/mock?orderId=...
// Simulates a successful payment notification for MOCK mode
export async function POST(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const order = await db.order.findUnique({ where: { id: orderId }, include: { payment: true, orderItems: { include: { ticketType: true } } } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ message: "Already paid" });

    // Mark order as paid
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
    });

    if (order.payment) {
      await db.payment.update({
        where: { id: order.payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    // Generate ticket instances for each order item
    for (const item of order.orderItems) {
      const tickets = [];
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          orderItemId: item.id,
          ticketTypeId: item.ticketTypeId,
          customerId: order.customerId,
          ticketCode: `TCK-${orderId}-${item.ticketTypeId.slice(-4).toUpperCase()}-${i + 1}`,
          status: "VALID" as const,
        });
      }
      await db.ticket.createMany({ data: tickets });
    }

    return NextResponse.json({ success: true, orderId, status: "PAID" });
  } catch (e: any) {
    console.error("[mock-webhook] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
