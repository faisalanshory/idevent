import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/payment-status?orderId=...
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true, orderStatus: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ status: order.paymentStatus, orderStatus: order.orderStatus });
}
