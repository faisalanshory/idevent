import { cookies } from "next/headers";
import { db } from "./db";

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer-token")?.value;

  if (!token) return null;

  const session = await db.customerSession.findUnique({
    where: { token },
    include: { customer: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.customer;
}
