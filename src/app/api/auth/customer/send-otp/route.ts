import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/customer/send-otp
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });

    // Delete old OTPs for this email
    await db.customerOtp.deleteMany({ where: { email: email.toLowerCase() } });

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.customerOtp.create({
      data: { email: email.toLowerCase(), otp, expiresAt },
    });

    // In dev mode (MOCK), return the OTP directly
    // In production, this would send via email/WhatsApp
    const isDev = process.env.NODE_ENV !== "production";
    console.log(`[OTP] Email: ${email} | OTP: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP berhasil dikirim",
      ...(isDev ? { mockOtp: otp } : {}), // Only in dev
    });
  } catch (e) {
    console.error("[send-otp]", e);
    return NextResponse.json({ error: "Gagal mengirim OTP" }, { status: 500 });
  }
}
