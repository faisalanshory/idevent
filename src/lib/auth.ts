import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { db } from "./db";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: "SUPERADMIN" | "ORGANIZER" | "CUSTOMER";
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("idevent-token")?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;
    return {
      id: payload.id as string,
      name: (payload.name as string) || null,
      email: payload.email as string,
      role: payload.role as "SUPERADMIN" | "ORGANIZER" | "CUSTOMER",
    };
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
}

export async function getOrganizerAccess(userId: string) {
  try {
    const userAccess = await db.organizerUser.findFirst({
      where: { userId },
      include: {
        organizer: true,
      },
    });
    return userAccess?.organizer || null;
  } catch (error) {
    console.error("Error checking organizer access:", error);
    return null;
  }
}
