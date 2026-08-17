"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createEvent, updateEvent } from "./actions";
import { ArrowLeft, PlusCircle, MinusCircle, Plus, Trash2, CalendarDays, MapPin, Ticket } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Category {
  id: string;
  name: string;
}

interface TicketType {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  saleStart: string;
  saleEnd: string;
  maxPurchase?: number;
}

interface EventFormProps {
  initialEvent?: any;
  categories: Category[];
}

export function EventForm({ initialEvent, categories }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  const [title, setTitle] = React.useState(initialEvent?.title || "");
  const [slug, setSlug] = React.useState(initialEvent?.slug || "");
  const [categoryId, setCategoryId] = React.useState(initialEvent?.categoryId || categories[0]?.id || "");
  const [description, setDescription] = React.useState(initialEvent?.description || "");
  const [coverImage, setCoverImage] = React.useState(initialEvent?.coverImage || "");
  
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (initialEvent?.gallery) {
      try { setGalleryUrls(JSON.parse(initialEvent.gallery)); } catch { setGalleryUrls([]); }
    }
  }, [initialEvent]);

  const [location, setLocation] = React.useState(initialEvent?.location || "");
  const [venue, setVenue] = React.useState(initialEvent?.venue || "");
  const [address, setAddress] = React.useState(initialEvent?.address || "");
  const [startDate, setStartDate] = React.useState(initialEvent?.startDate ? formatDateForInput(initialEvent.startDate) : new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = React.useState(initialEvent?.endDate ? formatDateForInput(initialEvent.endDate) : new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CANCELLED">(initialEvent?.status || "DRAFT");
  const [terms, setTerms] = React.useState(initialEvent?.terms || "");

  const [tickets, setTickets] = React.useState<TicketType[]>(
    initialEvent?.tickets?.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
      price: t.price,
      quantity: t.quantity,
      saleStart: formatDateForInput(t.saleStart),
      saleEnd: formatDateForInput(t.saleEnd),
      maxPurchase: t.maxPurchase || 5,
    })) || [{ name: "Regular", price: 0, quantity: 100, saleStart: new Date().toISOString().slice(0, 16), saleEnd: new Date(Date.now() + 86400000).toISOString().slice(0, 16) }]
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialEvent) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleTicketChange = (idx: number, field: keyof TicketType, val: any) => {
    const updated = [...tickets];
    updated[idx] = { ...updated[idx], [field]: val };
    setTickets(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId || !description || !location || !startDate || !endDate) {
      toast("Validation Error", "All event details are required.", "error");
      return;
    }

    if (tickets.length === 0) {
      toast("Validation Error", "Please create at least one ticket tier.", "error");
      return;
    }

    for (const t of tickets) {
      if (!t.name || t.price < 0 || t.quantity <= 0) {
        toast("Validation Error", "Please fill valid names, quantities, and prices for all tickets.", "error");
        return;
      }
    }

    setIsLoading(true);
    const payload = {
      title,
      slug,
      categoryId,
      description,
      coverImage: coverImage || undefined,
      gallery: galleryUrls.filter(u => u.trim() !== ""),
      location,
      venue: venue || undefined,
      address: address || undefined,
      startDate,
      endDate,
      status,
      terms: terms || undefined,
      tickets,
    };

    try {
      let res;
      if (initialEvent) {
        res = await updateEvent(initialEvent.id, payload as any);
      } else {
        res = await createEvent(payload as any);
      }

      if (res.error) throw new Error(res.error);

      toast(
        initialEvent ? "Event Updated" : "Event Created",
        `Successfully saved event ${title}`,
        "success"
      );

      router.push("/organizer/events");
      router.refresh();
    } catch (err: any) {
      toast("Error Saving Event", err.message || "Failed to submit event.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-full">
      {/* Left side: Form Inputs */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/organizer/events")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {initialEvent ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-muted-foreground text-sm">Fill in the event details.</p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border/40 pb-2 text-foreground">1. Basic Info</h3>
              
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">Event Title</label>
                <Input placeholder="e.g. Rock Concert 2026" value={title} onChange={(e) => handleTitleChange(e.target.value)} required disabled={isLoading} className="text-lg py-5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">URL Slug</label>
                  <Input placeholder="rock-concert-2026" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isLoading}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isLoading}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="SOLD_OUT">SOLD OUT</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Cover Image</label>
                  <ImageUpload
                    value={coverImage}
                    onChange={setCoverImage}
                    disabled={isLoading}
                    placeholder="Upload event cover"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea placeholder="Tell guests about your event..." value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isLoading} className="min-h-[120px]" />
              </div>
              
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Gallery Images</label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setGalleryUrls([...galleryUrls, ""])} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add Image
                  </Button>
                </div>
                <div className="space-y-2">
                  {galleryUrls.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No gallery images added yet.</p>
                  ) : (
                    galleryUrls.map((url, idx) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border/40 pb-2 text-foreground">2. Date & Venue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Start Date & Time</label>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">End Date & Time</label>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Location (City)</label>
                  <Input placeholder="e.g. Jakarta, Online" value={location} onChange={(e) => setLocation(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Venue</label>
                  <Input placeholder="e.g. GBK Hall B" value={venue} onChange={(e) => setVenue(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Address</label>
                  <Input placeholder="Street name..." value={address} onChange={(e) => setAddress(e.target.value)} disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* Ticket Tier Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h3 className="text-sm font-bold text-foreground">3. Ticket Tiers</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setTickets([...tickets, { name: "", price: 0, quantity: 100, saleStart: startDate || new Date().toISOString().slice(0, 16), saleEnd: endDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16) }])} disabled={isLoading}>
                  <PlusCircle className="h-4 w-4 mr-1 text-primary" />
                  Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {tickets.map((t, idx) => (
                  <div key={idx} className="flex flex-col gap-3 p-4 border border-border/60 rounded-lg bg-card/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">Tier #{idx + 1}</span>
                      {tickets.length > 1 && (
                        <button type="button" onClick={() => setTickets(tickets.filter((_, i) => i !== idx))} className="text-xs text-destructive hover:underline flex items-center gap-0.5 cursor-pointer" disabled={isLoading}>
                          <MinusCircle className="h-3.5 w-3.5" /> Remove Tier
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="grid gap-1">
                        <label className="text-[10px] font-semibold text-foreground">Tier Name</label>
                        <Input placeholder="e.g. VIP, Regular" value={t.name} onChange={(e) => handleTicketChange(idx, "name", e.target.value)} required disabled={isLoading} />
                      </div>
                      <div className="grid gap-1">
                        <label className="text-[10px] font-semibold text-foreground">Price (IDR)</label>
                        <Input type="number" placeholder="Price" value={t.price} onChange={(e) => handleTicketChange(idx, "price", Number(e.target.value))} required disabled={isLoading} />
                      </div>
                      <div className="grid gap-1">
                        <label className="text-[10px] font-semibold text-foreground">Capacity</label>
                        <Input type="number" placeholder="Capacity" value={t.quantity} onChange={(e) => handleTicketChange(idx, "quantity", Number(e.target.value))} required disabled={isLoading} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold border-b border-border/40 pb-2 text-foreground">4. Terms & Conditions</h3>
              <Textarea placeholder="Cancellation policy, age restrictions, items allowed..." value={terms} onChange={(e) => setTerms(e.target.value)} disabled={isLoading} className="min-h-[80px]" />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => router.push("/organizer/events")} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Live Preview Mockup */}
      <div className="w-full xl:w-[400px] 2xl:w-[500px] shrink-0 sticky top-24 self-start space-y-2 hidden lg:block">
        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
          Storefront Live Preview <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
        </h3>
        
        <div className="bg-white dark:bg-zinc-950 border border-border/60 rounded-xl overflow-hidden shadow-xl aspect-[9/16] lg:aspect-auto h-[700px] flex flex-col relative pointer-events-none opacity-90 scale-95 origin-top-left transition-all">
          <div className="h-48 bg-muted w-full shrink-0 relative">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">Cover Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-medium border border-white/30">
                {categories.find(c => c.id === categoryId)?.name || "Category"}
              </span>
              <h2 className="text-xl font-bold text-white mt-1 line-clamp-2 leading-tight">
                {title || "Event Title"}
              </h2>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-5 no-scrollbar">
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-foreground" />
                <span>
                  {startDate ? new Date(startDate).toLocaleDateString() : "DD/MM/YYYY"}<br/>
                  {startDate ? new Date(startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "00:00"}
                </span>
              </div>
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-foreground" />
                <span>
                  <strong className="text-foreground">{venue || "Venue Name"}</strong><br/>
                  {location || "City Name"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">About Event</h4>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {description || "Event description will appear here..."}
              </p>
            </div>

            {galleryUrls.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">Gallery Preview</h4>
                <div className="flex gap-2 overflow-hidden h-12">
                  {galleryUrls.map((url, i) => url && (
                    <img key={i} src={url} className="h-full w-20 object-cover rounded-md" alt="" />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="font-bold text-foreground text-sm">Tickets</h4>
              {tickets.map((t, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-border/40 bg-muted/20">
                  <div>
                    <p className="font-bold text-sm text-foreground">{t.name || "Tier Name"}</p>
                    <p className="text-[10px] text-muted-foreground">Available: {t.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">
                      {t.price > 0 ? `Rp ${t.price.toLocaleString()}` : "FREE"}
                    </p>
                    <Button size="sm" className="h-6 text-[10px] px-2 mt-1">Select</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
