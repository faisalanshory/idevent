"use server";

import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBanner(formData: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaUrl?: string;
  isActive: boolean;
  sortOrder: number;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    if (!formData.title || !formData.imageUrl) {
      return { error: "Title and Image URL are required." };
    }

    await db.banner.create({
      data: {
        organizerId: organizer.id,
        title: formData.title,
        subtitle: formData.subtitle || null,
        imageUrl: formData.imageUrl,
        ctaLabel: formData.ctaLabel || null,
        ctaUrl: formData.ctaUrl || null,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
      },
    });

    revalidatePath("/organizer/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create banner:", error);
    return { error: error.message || "Failed to create banner." };
  }
}

export async function updateBanner(
  id: string,
  formData: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaLabel?: string;
    ctaUrl?: string;
    isActive: boolean;
    sortOrder: number;
  }
) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    if (!formData.title || !formData.imageUrl) {
      return { error: "Title and Image URL are required." };
    }

    await db.banner.update({
      where: { id, organizerId: organizer.id },
      data: {
        title: formData.title,
        subtitle: formData.subtitle || null,
        imageUrl: formData.imageUrl,
        ctaLabel: formData.ctaLabel || null,
        ctaUrl: formData.ctaUrl || null,
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
      },
    });

    revalidatePath("/organizer/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update banner:", error);
    return { error: error.message || "Failed to update banner." };
  }
}

export async function deleteBanner(id: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    await db.banner.delete({
      where: { id, organizerId: organizer.id },
    });

    revalidatePath("/organizer/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete banner:", error);
    return { error: error.message || "Failed to delete banner." };
  }
}
