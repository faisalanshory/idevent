import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/customer/logout
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("customer-token")?.value;

    if (token) {
      await db.customerSession.deleteMany({
        where: { token },
      });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("customer-token");
    
    return res;
  } catch (e) {
    console.error("[customer-logout]", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
