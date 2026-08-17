"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { deleteBanner } from "./actions";
import { Edit2, Trash2, Plus, Image as ImageIcon } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const { toast } = useToast();
  const [banners, setBanners] = React.useState<Banner[]>(initialBanners);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;

    try {
      const res = await deleteBanner(id);
      if (res.error) throw new Error(res.error);
      toast("Banner Deleted", `Successfully removed banner "${title}"`, "success");
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err: any) {
      toast("Delete Failed", err.message || "Failed to remove banner.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Landing Page Banners</h1>
          <p className="text-muted-foreground text-sm">Manage the carousel slides on your storefront homepage.</p>
        </div>
        <Link href="/organizer/banners/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Banner
          </Button>
        </Link>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Banner List</CardTitle>
          <CardDescription>Banners are ordered by their sort order.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {banners.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="font-semibold text-foreground">No banners found</p>
              <p>Create a banner to feature events or your organization.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4 w-24">Image</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {banners.sort((a, b) => a.sortOrder - b.sortOrder).map((banner) => (
                  <tr key={banner.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="w-24 h-14 rounded-md object-cover border border-border/40 bg-muted"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground line-clamp-1">{banner.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{banner.subtitle || "-"}</p>
                    </td>
                    <td className="p-4 text-center font-mono font-medium">
                      {banner.sortOrder}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        banner.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-400"
                      }`}>
                        {banner.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/organizer/banners/${banner.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id, banner.title)}>
                        <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
