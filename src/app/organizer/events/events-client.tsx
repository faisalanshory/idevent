"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { deleteEvent, toggleEventFeatured } from "./actions";
import { Search, Edit2, Trash2, Plus, Star } from "lucide-react";

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

interface Event {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  coverImage: string | null;
  gallery: string | null;
  location: string;
  venue: string | null;
  address: string | null;
  startDate: Date;
  endDate: Date;
  status: "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "COMPLETED" | "CANCELLED";
  isFeatured: boolean;
  terms: string | null;
  tickets: TicketType[];
}

interface EventsClientProps {
  initialEvents: Event[];
  categories: Category[];
}

export function EventsClient({ initialEvents, categories }: EventsClientProps) {
  const { toast } = useToast();
  const [events, setEvents] = React.useState<Event[]>(initialEvents);
  const [search, setSearch] = React.useState("");

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await deleteEvent(id);
      if (res.error) throw new Error(res.error);
      toast("Event Deleted", `Successfully removed event ${name}`, "success");
      setEvents(events.filter((e) => e.id !== id));
    } catch (err: any) {
      toast("Delete Failed", err.message || "Failed to remove event.", "error");
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean, name: string) => {
    try {
      // Optimistic update
      setEvents(events.map(e => e.id === id ? { ...e, isFeatured: !currentStatus } : e));
      const res = await toggleEventFeatured(id, !currentStatus);
      if (res.error) throw new Error(res.error);
      toast("Status Updated", `Event "${name}" is ${!currentStatus ? 'now featured' : 'no longer featured'}.`, "success");
    } catch (err: any) {
      // Revert on error
      setEvents(events.map(e => e.id === id ? { ...e, isFeatured: currentStatus } : e));
      toast("Update Failed", err.message || "Failed to update featured status.", "error");
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm">Create, publish, and manage ticketing classes for your events.</p>
        </div>
        <Link href="/organizer/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Event Catalogue</CardTitle>
          <CardDescription>All events registered under your organizer profile.</CardDescription>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No events found. Let&apos;s create one!
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Venue & Location</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        {event.coverImage ? (
                          <img src={event.coverImage} className="w-10 h-10 rounded-md object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold">
                            EVT
                          </div>
                        )}
                        <div>
                          <p>{event.title}</p>
                          <p className="text-xs text-muted-foreground font-normal">
                            slug: {event.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{event.venue || "Online"}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-0.5 text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          Start: {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p>
                          End: {new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        event.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : event.status === "DRAFT"
                          ? "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-400"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleFeatured(event.id, event.isFeatured, event.title)}
                        title={event.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                      >
                        <Star className={`h-4 w-4 ${event.isFeatured ? "fill-amber-400 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} />
                      </Button>
                      <Link href={`/organizer/events/${event.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id, event.title)}>
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
