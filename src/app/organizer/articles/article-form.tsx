"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createArticle, updateArticle } from "./actions";
import { ArrowLeft, User, PlusCircle, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ImageUpload } from "@/components/ui/image-upload";

export function ArticleForm({ initialArticle }: { initialArticle?: any }) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = React.useState(initialArticle?.title || "");
  const [slug, setSlug] = React.useState(initialArticle?.slug || "");
  const [content, setContent] = React.useState(initialArticle?.content || "");
  const [coverImage, setCoverImage] = React.useState(initialArticle?.coverImage || "");
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>(
    initialArticle?.gallery ? JSON.parse(initialArticle.gallery) : []
  );
  const [author, setAuthor] = React.useState(initialArticle?.author || "");
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">(initialArticle?.status || "DRAFT");
  
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialArticle) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast("Validation Error", "Title, slug, and content are required.", "error");
      return;
    }

    setIsLoading(true);
    const payload = {
      title,
      slug,
      content,
      coverImage: coverImage || undefined,
      galleryUrls,
      author: author || undefined,
      status,
    };

    try {
      let res;
      if (initialArticle) {
        res = await updateArticle(initialArticle.id, payload);
      } else {
        res = await createArticle(payload);
      }

      if (res.error) throw new Error(res.error);

      toast(
        initialArticle ? "Article Updated" : "Article Created",
        `Successfully saved article "${title}"`,
        "success"
      );

      router.push("/organizer/articles");
      router.refresh();
    } catch (err: any) {
      toast("Error Saving Article", err.message || "Failed to submit article.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-full">
      {/* Left side: Form Inputs */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/organizer/articles")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {initialArticle ? "Edit Article" : "Write New Article"}
            </h1>
            <p className="text-muted-foreground text-sm">Fill in the details for your blog post.</p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Article Title</label>
              <Input
                placeholder="e.g. 5 Tips to Prepare for Penukaran Tiket"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                disabled={isLoading}
                className="text-lg py-6"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">URL Slug</label>
                <Input
                  placeholder="5-tips-to-prepare"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isLoading}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Author Pen Name</label>
                <Input
                  placeholder="e.g. Event Coordinator"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">Cover Image</label>
                <ImageUpload
                  value={coverImage}
                  onChange={setCoverImage}
                  disabled={isLoading}
                  placeholder="Upload article cover"
                />
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gallery Images</h3>
                  <p className="text-xs text-muted-foreground">Add multiple images for your article.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGalleryUrls([...galleryUrls, ""])}
                  disabled={isLoading}
                  className="gap-1.5 h-8"
                >
                  <PlusCircle className="h-4 w-4" /> Add Image
                </Button>
              </div>

              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex-1">
                        <ImageUpload
                          value={url}
                          onChange={(newUrl) => {
                            const newUrls = [...galleryUrls];
                            newUrls[idx] = newUrl;
                            setGalleryUrls(newUrls);
                          }}
                          disabled={isLoading}
                          placeholder="Upload gallery image"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))} className="shrink-0 h-32 w-12 border border-dashed border-border/60 rounded-xl hover:bg-destructive/10">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">Content (Markdown / Text)</label>
              <Textarea
                placeholder="Write your article content here... You can use markdown syntax."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={isLoading}
                className="min-h-[400px] text-base font-mono leading-relaxed"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/organizer/articles")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Saving..." : "Save Article"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Live Preview */}
      <div className="w-full xl:w-[450px] 2xl:w-[500px] shrink-0 sticky top-24 self-start space-y-2 hidden lg:block">
        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
          Live Markdown Preview <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
        </h3>
        
        <div className="bg-white dark:bg-zinc-950 border border-border/60 rounded-xl overflow-hidden shadow-xl aspect-[9/16] lg:aspect-auto h-[800px] flex flex-col relative pointer-events-none opacity-95">
          <div className="h-48 bg-muted w-full shrink-0 relative">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">Cover Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto no-scrollbar bg-background">
            <h1 className="text-3xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
              {title || "Article Title..."}
            </h1>
            
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/40">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{author || "Author Name"}</p>
                <p className="text-xs text-muted-foreground">Just now • {Math.ceil(content.length / 800) || 1} min read</p>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
              <ReactMarkdown>{content || "Start typing your content..."}</ReactMarkdown>
            </div>
            
            {galleryUrls.filter(Boolean).length > 0 && (
              <div className="mt-8 pt-8 border-t border-border/40">
                <h3 className="font-bold text-foreground mb-4">Gallery</h3>
                <div className="grid grid-cols-2 gap-3">
                  {galleryUrls.filter(Boolean).map((url, idx) => (
                    <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="rounded-xl object-cover aspect-video w-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
