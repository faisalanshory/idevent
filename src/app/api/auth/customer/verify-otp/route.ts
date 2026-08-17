import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/customer/verify-otp
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: "Email dan OTP wajib diisi" }, { status: 400 });

    const record = await db.customerOtp.findFirst({
      where: { email: email.toLowerCase(), otp, verified: false },
    });

    if (!record) return NextResponse.json({ error: "OTP tidak valid" }, { status: 400 });
    if (new Date() > record.expiresAt) return NextResponse.json({ error: "OTP sudah kadaluarsa. Minta OTP baru." }, { status: 400 });

    // Mark as verified
    await db.customerOtp.update({ where: { id: record.id }, data: { verified: true } });

    // Fetch all tickets for this email across organizers
    const customers = await db.customer.findMany({
      where: { email: email.toLowerCase() },
      include: {
        orders: {
          where: { paymentStatus: "PAID" },
          include: {
            event: true,
            orderItems: { include: { ticketType: true } },
          },
        },
      },
    });

    const tickets = customers.flatMap(c =>
      c.orders.flatMap(order =>
        order.orderItems.map(item => ({
          orderId: order.id,
          eventTitle: order.event.title,
          eventDate: order.event.startDate.toISOString(),
          venue: order.event.venue || order.event.location,
          ticketType: item.ticketType.name,
          quantity: item.quantity,
          status: order.orderStatus,
        }))
      )
    );

    return NextResponse.json({ success: true, tickets });
  } catch (e) {
    console.error("[verify-otp]", e);
    return NextResponse.json({ error: "Gagal verifikasi OTP" }, { status: 500 });
  }
}
