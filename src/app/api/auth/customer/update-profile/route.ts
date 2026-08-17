import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notifEmailOrder, notifEmailReminder, notifWaOrder, notifWaReminder, phone } = await req.json();

    const updated = await db.customer.update({
      where: { id: customer.id },
      data: {
        phone,
        notifEmailOrder,
        notifEmailReminder,
        notifWaOrder,
        notifWaReminder,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (e) {
    console.error("[update-profile]", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
