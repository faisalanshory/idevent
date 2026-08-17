import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// POST /api/auth/customer/login
// Body: { email, password, organizerId }
export async function POST(req: NextRequest) {
  try {
    const { email, password, organizerId } = await req.json();

    if (!email || !password || !organizerId) {
      return NextResponse.json({ error: "Email, password, dan organizerId wajib diisi" }, { status: 400 });
    }

    const customer = await db.customer.findUnique({
      where: { organizerId_email: { organizerId, email: email.toLowerCase() } },
    });

    if (!customer || !customer.password) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Create session token
    const token = nanoid(48);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.customerSession.create({
      data: { customerId: customer.id, token, expiresAt },
    });

    // Set cookie
    const res = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notifEmailOrder: customer.notifEmailOrder,
        notifEmailReminder: customer.notifEmailReminder,
        notifWaOrder: customer.notifWaOrder,
        notifWaReminder: customer.notifWaReminder,
      },
    });

    res.cookies.set("customer-token", token, {
      httpOnly: true,
      secure: false, // dev mode
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (e) {
    console.error("[customer-login]", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
