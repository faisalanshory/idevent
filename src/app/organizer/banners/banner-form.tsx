"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { createBanner, updateBanner } from "./actions";
import { ArrowLeft } from "lucide-react";

export function BannerForm({ initialBanner }: { initialBanner?: any }) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = React.useState(initialBanner?.title || "");
  const [subtitle, setSubtitle] = React.useState(initialBanner?.subtitle || "");
  const [imageUrl, setImageUrl] = React.useState(initialBanner?.imageUrl || "");
  const [ctaLabel, setCtaLabel] = React.useState(initialBanner?.ctaLabel || "");
  const [ctaUrl, setCtaUrl] = React.useState(initialBanner?.ctaUrl || "");
  const [isActive, setIsActive] = React.useState<boolean>(initialBanner?.isActive ?? true);
  const [sortOrder, setSortOrder] = React.useState(initialBanner?.sortOrder || 0);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast("Validation Error", "Title and Image are required.", "error");
      return;
    }

    setIsLoading(true);
    const payload = {
      title,
      subtitle: subtitle || undefined,
      imageUrl,
      ctaLabel: ctaLabel || undefined,
      ctaUrl: ctaUrl || undefined,
      isActive,
      sortOrder: Number(sortOrder),
    };

    try {
      let res;
      if (initialBanner) {
        res = await updateBanner(initialBanner.id, payload);
      } else {
        res = await createBanner(payload);
      }

      if (res.error) throw new Error(res.error);

      toast(
        initialBanner ? "Banner Updated" : "Banner Created",
        `Successfully saved banner "${title}"`,
        "success"
      );

      router.push("/organizer/banners");
      router.refresh();
    } catch (err: any) {
      toast("Error Saving Banner", err.message || "Failed to submit banner.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/organizer/banners")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {initialBanner ? "Edit Banner" : "Create New Banner"}
          </h1>
          <p className="text-muted-foreground text-sm">Design a carousel slide for your storefront.</p>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-foreground">Banner Image</label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              disabled={isLoading}
              placeholder="Upload 16:9 banner image"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-foreground">Title</label>
            <Input
              placeholder="e.g. Welcome to Our Events"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-foreground">Subtitle / Description</label>
            <Input
              placeholder="Brief description below title"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Button Label (CTA)</label>
              <Input
                placeholder="e.g. View All Events"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Button Link</label>
              <Input
                placeholder="e.g. /events"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Sort Order</label>
              <Input
                type="number"
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Status</label>
              <select
                value={isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setIsActive(e.target.value === "ACTIVE")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/organizer/banners")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Banner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
