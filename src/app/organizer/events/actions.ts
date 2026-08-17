"use server";

import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { EventStatus, TicketStatus } from "@prisma/client";

export async function createEvent(formData: {
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  coverImage?: string;
  gallery?: string[];
  location: string;
  venue?: string;
  address?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  terms?: string;
  tickets: Array<{
    name: string;
    description?: string;
    price: number;
    quantity: number;
    saleStart: string;
    saleEnd: string;
    maxPurchase?: number;
  }>;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    const {
      title,
      slug,
      categoryId,
      description,
      coverImage,
      gallery,
      location,
      venue,
      address,
      startDate,
      endDate,
      status,
      terms,
      tickets,
    } = formData;

    if (!title || !slug || !categoryId || !description || !location || !startDate || !endDate) {
      return { error: "Missing required fields." };
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check slug uniqueness within this organizer
    const existingSlug = await db.event.findFirst({
      where: {
        organizerId: organizer.id,
        slug: cleanSlug,
      },
    });

    if (existingSlug) {
      return { error: "An event with this slug already exists in your workspace." };
    }

    await db.$transaction(async (tx) => {
      // 1. Create Event
      const event = await tx.event.create({
        data: {
          organizerId: organizer.id,
          categoryId,
          title,
          slug: cleanSlug,
          description,
          coverImage: coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
          gallery: gallery ? JSON.stringify(gallery) : null,
          location,
          venue,
          address,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status,
          terms,
        },
      });

      // 2. Create Ticket Types
      if (tickets && tickets.length > 0) {
        await tx.ticketType.createMany({
          data: tickets.map((t) => ({
            eventId: event.id,
            name: t.name,
            description: t.description || null,
            price: Number(t.price),
            quantity: Number(t.quantity),
            saleStart: new Date(t.saleStart),
            saleEnd: new Date(t.saleEnd),
            maxPurchase: Number(t.maxPurchase || 5),
            status: TicketStatus.AVAILABLE,
          })),
        });
      }
    });

    revalidatePath("/organizer/events");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return { error: error.message || "Failed to create event." };
  }
}

export async function updateEvent(
  id: string,
  formData: {
    title: string;
    slug: string;
    categoryId: string;
    description: string;
    coverImage?: string;
    gallery?: string[];
    location: string;
    venue?: string;
    address?: string;
    startDate: string;
    endDate: string;
    status: EventStatus;
    terms?: string;
    tickets: Array<{
      id?: string;
      name: string;
      description?: string;
      price: number;
      quantity: number;
      saleStart: string;
      saleEnd: string;
      maxPurchase?: number;
    }>;
  }
) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    const {
      title,
      slug,
      categoryId,
      description,
      coverImage,
      gallery,
      location,
      venue,
      address,
      startDate,
      endDate,
      status,
      terms,
      tickets,
    } = formData;

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check slug uniqueness
    const existing = await db.event.findFirst({
      where: {
        organizerId: organizer.id,
        slug: cleanSlug,
        id: { not: id },
      },
    });

    if (existing) {
      return { error: "An event with this slug already exists in your workspace." };
    }

    await db.$transaction(async (tx) => {
      // 1. Update Event Info
      await tx.event.update({
        where: { id },
        data: {
          categoryId,
          title,
          slug: cleanSlug,
          description,
          coverImage,
          gallery: gallery ? JSON.stringify(gallery) : null,
          location,
          venue,
          address,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status,
          terms,
        },
      });

      // 2. Refresh Ticket Tiers (simple solution: delete old types and write new ones to avoid complex diffing)
      // Since Ticket Types might have foreign keys from order items, we delete ones that are NOT in the incoming tickets list, or simply overwrite.
      // If tickets are already sold, deleting would fail because of foreign key constraints, which is correct!
      // Let's perform a smart update:
      // First, get all current ticket types
      const currentTiers = await tx.ticketType.findMany({ where: { eventId: id } });
      const currentIds = currentTiers.map((t) => t.id);
      
      const incomingIds = tickets.map((t) => t.id).filter(Boolean) as string[];

      // Delete ticket types that are removed in UI
      const toDelete = currentIds.filter((cid) => !incomingIds.includes(cid));
      if (toDelete.length > 0) {
        await tx.ticketType.deleteMany({
          where: { id: { in: toDelete } }
        });
      }

      // Upsert incoming ticket types
      for (const t of tickets) {
        if (t.id) {
          // Update existing
          await tx.ticketType.update({
            where: { id: t.id },
            data: {
              name: t.name,
              description: t.description || null,
              price: Number(t.price),
              quantity: Number(t.quantity),
              saleStart: new Date(t.saleStart),
              saleEnd: new Date(t.saleEnd),
              maxPurchase: Number(t.maxPurchase || 5),
            }
          });
        } else {
          // Create new
          await tx.ticketType.create({
            data: {
              eventId: id,
              name: t.name,
              description: t.description || null,
              price: Number(t.price),
              quantity: Number(t.quantity),
              saleStart: new Date(t.saleStart),
              saleEnd: new Date(t.saleEnd),
              maxPurchase: Number(t.maxPurchase || 5),
              status: TicketStatus.AVAILABLE,
            }
          });
        }
      }
    });

    revalidatePath("/organizer/events");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return { error: error.message || "Failed to update event." };
  }
}

export async function deleteEvent(id: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    await db.event.delete({
      where: { id, organizerId: organizer.id },
    });

    revalidatePath("/organizer/events");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return { error: error.message || "Failed to delete event." };
  }
}

export async function toggleEventFeatured(id: string, isFeatured: boolean) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    await db.event.update({
      where: { id, organizerId: organizer.id },
      data: { isFeatured },
    });

    revalidatePath("/organizer/events");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle featured status:", error);
    return { error: error.message || "Failed to toggle featured status." };
  }
}
