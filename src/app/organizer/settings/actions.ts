"use server";

import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateOrganizerSettings(formData: {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  siteTitle?: string;
  siteDescription?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    const {
      name,
      description,
      email,
      phone,
      website,
      logo,
      favicon,
      primaryColor,
      secondaryColor,
      siteTitle,
      siteDescription,
    } = formData;

    if (!name || !primaryColor || !secondaryColor) {
      return { error: "Name and colors are required." };
    }

    await db.$transaction(async (tx) => {
      // 1. Update Organizer basic profile
      await tx.organizer.update({
        where: { id: organizer.id },
        data: {
          name,
          description,
          email,
          phone,
          website,
          logo,
          favicon,
          primaryColor,
          secondaryColor,
        },
      });

      // 2. Update/create Site Settings (theme branding details)
      await tx.siteSetting.upsert({
        where: { organizerId: organizer.id },
        update: {
          title: siteTitle || `${name} - Ticket Portal`,
          description: siteDescription || description || `Tickets for ${name} events.`,
          primaryColor,
          secondaryColor,
          logoUrl: logo || null,
          faviconUrl: favicon || null,
        },
        create: {
          organizerId: organizer.id,
          title: siteTitle || `${name} - Ticket Portal`,
          description: siteDescription || description || `Tickets for ${name} events.`,
          primaryColor,
          secondaryColor,
          logoUrl: logo || null,
          faviconUrl: favicon || null,
        },
      });
    });

    revalidatePath("/organizer/settings");
    revalidatePath("/organizer");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return { error: error.message || "Failed to update settings." };
  }
}
