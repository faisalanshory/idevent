"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createOrganizer(formData: {
  name: string;
  slug: string;
  subdomain: string;
  description?: string;
  email?: string;
  phone?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  try {
    const { name, slug, subdomain, description, email, phone, primaryColor, secondaryColor } = formData;

    if (!name || !slug || !subdomain) {
      return { error: "Name, slug, and subdomain are required." };
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");
    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check if slug or subdomain already exists
    const existingSlug = await db.organizer.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { subdomain: cleanSubdomain }
        ]
      }
    });

    if (existingSlug) {
      return { error: "Slug or subdomain is already in use by another organizer." };
    }

    // Create organizer and associated default settings
    await db.$transaction(async (tx) => {
      const org = await tx.organizer.create({
        data: {
          name,
          slug: cleanSlug,
          subdomain: cleanSubdomain,
          description,
          email,
          phone,
          primaryColor: primaryColor || "#2563eb",
          secondaryColor: secondaryColor || "#1e3a8a",
        }
      });

      // Create site setting
      await tx.siteSetting.create({
        data: {
          organizerId: org.id,
          title: `${name} - Ticket Portal`,
          description: description || `Welcome to ${name}'s ticketing portal.`,
          primaryColor: primaryColor || "#2563eb",
          secondaryColor: secondaryColor || "#1e3a8a",
        }
      });

      // Create domain
      const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
      await tx.organizerDomain.create({
        data: {
          organizerId: org.id,
          domain: `${cleanSubdomain}.${root}`,
          type: "SUBDOMAIN",
          verified: true
        }
      });
    });

    revalidatePath("/admin/organizers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create organizer:", error);
    return { error: error.message || "Failed to create organizer." };
  }
}

export async function updateOrganizer(
  id: string,
  formData: {
    name: string;
    slug: string;
    subdomain: string;
    description?: string;
    email?: string;
    phone?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }
) {
  try {
    const { name, slug, subdomain, description, email, phone, primaryColor, secondaryColor } = formData;

    if (!name || !slug || !subdomain) {
      return { error: "Name, slug, and subdomain are required." };
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");
    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check if slug or subdomain is in use by another organizer
    const existing = await db.organizer.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [{ slug: cleanSlug }, { subdomain: cleanSubdomain }] }
        ]
      }
    });

    if (existing) {
      return { error: "Slug or subdomain is already in use by another organizer." };
    }

    await db.$transaction(async (tx) => {
      await tx.organizer.update({
        where: { id },
        data: {
          name,
          slug: cleanSlug,
          subdomain: cleanSubdomain,
          description,
          email,
          phone,
          primaryColor: primaryColor || "#2563eb",
          secondaryColor: secondaryColor || "#1e3a8a",
        }
      });

      // Update Site Setting
      await tx.siteSetting.upsert({
        where: { organizerId: id },
        update: {
          title: `${name} - Ticket Portal`,
          description: description || `Welcome to ${name}'s ticketing portal.`,
          primaryColor: primaryColor || "#2563eb",
          secondaryColor: secondaryColor || "#1e3a8a",
        },
        create: {
          organizerId: id,
          title: `${name} - Ticket Portal`,
          description: description || `Welcome to ${name}'s ticketing portal.`,
          primaryColor: primaryColor || "#2563eb",
          secondaryColor: secondaryColor || "#1e3a8a",
        }
      });
    });

    revalidatePath("/admin/organizers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update organizer:", error);
    return { error: error.message || "Failed to update organizer." };
  }
}

export async function deleteOrganizer(id: string) {
  try {
    await db.organizer.delete({
      where: { id }
    });

    revalidatePath("/admin/organizers");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete organizer:", error);
    return { error: error.message || "Failed to delete organizer." };
  }
}
