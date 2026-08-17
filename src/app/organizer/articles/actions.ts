"use server";

import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";

export async function createArticle(formData: {
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  galleryUrls?: string[];
  author?: string;
  status: ArticleStatus;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    const { title, slug, content, coverImage, galleryUrls, author, status } = formData;

    if (!title || !slug || !content) {
      return { error: "Title, slug, and content are required." };
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check slug uniqueness per organizer
    const existing = await db.article.findFirst({
      where: {
        organizerId: organizer.id,
        slug: cleanSlug,
      },
    });

    if (existing) {
      return { error: "An article with this slug already exists." };
    }

    await db.article.create({
      data: {
        organizerId: organizer.id,
        title,
        slug: cleanSlug,
        content,
        coverImage: coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
        gallery: galleryUrls && galleryUrls.length > 0 ? JSON.stringify(galleryUrls) : null,
        author: author || session.name || "Administrator",
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidatePath("/organizer/articles");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create article:", error);
    return { error: error.message || "Failed to create article." };
  }
}

export async function updateArticle(
  id: string,
  formData: {
    title: string;
    slug: string;
    content: string;
    coverImage?: string;
    galleryUrls?: string[];
    author?: string;
    status: ArticleStatus;
  }
) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    const { title, slug, content, coverImage, galleryUrls, author, status } = formData;

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "");

    // Check slug uniqueness
    const existing = await db.article.findFirst({
      where: {
        organizerId: organizer.id,
        slug: cleanSlug,
        id: { not: id },
      },
    });

    if (existing) {
      return { error: "An article with this slug already exists." };
    }

    const currentArticle = await db.article.findUnique({ where: { id } });
    const publishDate =
      status === "PUBLISHED"
        ? currentArticle?.publishedAt || new Date()
        : null;

    await db.article.update({
      where: { id, organizerId: organizer.id },
      data: {
        title,
        slug: cleanSlug,
        content,
        coverImage,
        gallery: galleryUrls ? JSON.stringify(galleryUrls) : null,
        author,
        status,
        publishedAt: publishDate,
      },
    });

    revalidatePath("/organizer/articles");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update article:", error);
    return { error: error.message || "Failed to update article." };
  }
}

export async function deleteArticle(id: string) {
  try {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const organizer = await getOrganizerAccess(session.id);
    if (!organizer) return { error: "No organizer workspace access found." };

    await db.article.delete({
      where: { id, organizerId: organizer.id },
    });

    revalidatePath("/organizer/articles");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete article:", error);
    return { error: error.message || "Failed to delete article." };
  }
}
