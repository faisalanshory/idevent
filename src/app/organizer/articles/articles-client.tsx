"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { deleteArticle } from "./actions";
import { Search, Edit2, Trash2, Plus } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  content: string;
  author: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  createdAt: Date;
}

interface ArticlesClientProps {
  initialArticles: Article[];
}

export function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const { toast } = useToast();
  const [articles, setArticles] = React.useState<Article[]>(initialArticles);
  const [search, setSearch] = React.useState("");

  const handleDelete = async (id: string, titleName: string) => {
    if (!confirm(`Are you sure you want to delete "${titleName}"?`)) return;

    try {
      const res = await deleteArticle(id);
      if (res.error) throw new Error(res.error);
      toast("Article Deleted", `Successfully removed article "${titleName}"`, "success");
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err: any) {
      toast("Delete Failed", err.message || "Failed to remove article.", "error");
    }
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.author && a.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Articles</h1>
          <p className="text-muted-foreground text-sm">Write blogs, updates, and announcements for your customers.</p>
        </div>
        <Link href="/organizer/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Write Article
          </Button>
        </Link>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Blogs & Updates</CardTitle>
          <CardDescription>All written articles linked to your storefront.</CardDescription>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No articles written yet. Write your first update!
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4">Article</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        {art.coverImage ? (
                          <img src={art.coverImage} className="w-10 h-10 rounded-md object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold">
                            DOC
                          </div>
                        )}
                        <div>
                          <p className="line-clamp-1">{art.title}</p>
                          <p className="text-xs text-muted-foreground font-normal">
                            slug: {art.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{art.author || "Unknown"}</td>
                    <td className="p-4 text-muted-foreground">
                      {art.publishedAt
                        ? new Date(art.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Not Published"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        art.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-400"
                      }`}>
                        {art.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/organizer/articles/${art.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(art.id, art.title)}>
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
