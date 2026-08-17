"use server";

import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";

export async function getAttendanceStats(eventId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) return { error: "No organizer workspace access found." };

  const event = await db.event.findUnique({
    where: { id: eventId, organizerId: organizer.id },
  });

  if (!event) return { error: "Event not found" };

  const stats = await db.ticket.groupBy({
    by: ["status"],
    where: {
      orderItem: { order: { eventId } },
      status: { in: ["VALID", "USED"] },
    },
    _count: { status: true },
  });

  let validCount = 0;
  let usedCount = 0;

  stats.forEach((s) => {
    if (s.status === "VALID") validCount += s._count.status;
    if (s.status === "USED") usedCount += s._count.status;
  });

  return { total: validCount + usedCount, valid: validCount, used: usedCount };
}

export async function verifyTicket(eventId: string, ticketCode: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    // Find the ticket
    const ticket = await db.ticket.findUnique({
      where: { ticketCode },
      include: {
        orderItem: {
          include: {
            order: { include: { customer: true } },
            ticketType: true,
          }
        }
      }
    });

    if (!ticket) {
      return { success: false, message: "Tiket tidak ditemukan di database." };
    }

    if (ticket.orderItem.order.eventId !== eventId) {
      return { success: false, message: "Tiket ini bukan untuk event yang sedang dipilih." };
    }

    if (ticket.status === "CANCELLED") {
      return { success: false, message: "Tiket ini telah dibatalkan." };
    }

    if (ticket.status === "USED") {
      return { 
        success: false, 
        message: "Tiket SUDAH DIGUNAKAN sebelumnya.",
        ticketInfo: {
          name: ticket.orderItem.order.customer.name,
          type: ticket.orderItem.ticketType.name,
          code: ticketCode
        }
      };
    }

    // Mark as USED
    await db.ticket.update({
      where: { id: ticket.id },
      data: { status: "USED" },
    });

    return { 
      success: true, 
      message: "Tiket Valid! Silakan masuk.",
      ticketInfo: {
        name: ticket.orderItem.order.customer.name,
        type: ticket.orderItem.ticketType.name,
        code: ticketCode
      }
    };
  } catch (err: any) {
    return { error: err.message || "Failed to verify ticket" };
  }
}

export async function getAttendeeList(eventId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) return { error: "No organizer workspace access found." };

  const event = await db.event.findUnique({
    where: { id: eventId, organizerId: organizer.id },
  });

  if (!event) return { error: "Event not found" };

  const tickets = await db.ticket.findMany({
    where: {
      orderItem: { order: { eventId } },
      status: { in: ["VALID", "USED"] },
    },
    include: {
      orderItem: {
        include: {
          order: { include: { customer: true } },
          ticketType: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const attendees = tickets.map((t) => ({
    id: t.id,
    code: t.ticketCode,
    status: t.status,
    customerName: t.orderItem.order.customer.name,
    customerEmail: t.orderItem.order.customer.email,
    ticketType: t.orderItem.ticketType.name,
    updatedAt: t.updatedAt,
  }));

  return { attendees };
}
