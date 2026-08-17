"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Ticket, Users } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number; // capacity
  maxPurchase: number;
  status: "AVAILABLE" | "SOLD_OUT" | "CLOSED";
}

interface TicketSelectorProps {
  tickets: TicketType[];
}

export function TicketSelector({ tickets }: TicketSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  // State to hold quantity selected per ticketTypeId
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const handleIncrement = (id: string, max: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      if (current >= max) {
        toast("Limit Reached", `You can purchase a maximum of ${max} tickets per order for this tier.`, "info");
        return prev;
      }
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleCheckout = (ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      toast("No Tickets Selected", "Please select at least 1 ticket to proceed.", "error");
      return;
    }
    // Redirect to checkout with parameters
    router.push(`/checkout?ticketTypeId=${ticketId}&qty=${quantity}`);
  };

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
          No ticket classes are configured for this event.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {tickets.map((ticket) => {
            const selectedQty = quantities[ticket.id] || 0;
            const isSoldOut = ticket.status === "SOLD_OUT" || ticket.quantity <= 0;
            const maxLimit = Math.min(ticket.maxPurchase, ticket.quantity);

            return (
              <div key={ticket.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary shrink-0" />
                    {ticket.name}
                  </h4>
                  {ticket.description && (
                    <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                      {ticket.description}
                    </p>
                  )}
                  <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-2">
                    <span>Limit: {ticket.maxPurchase} per order</span>
                    <span>&bull;</span>
                    <span className="text-primary font-bold">
                      {isSoldOut ? "SOLD OUT" : `${ticket.quantity} remaining`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 shrink-0 mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Price</p>
                    <p className="text-base font-extrabold text-foreground">
                      Rp {ticket.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {isSoldOut ? (
                    <span className="text-xs font-bold text-destructive px-3 py-2 bg-destructive/5 rounded-md border border-destructive/15 shrink-0">
                      Sold Out
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-border rounded-lg bg-card/50">
                        <button
                          type="button"
                          onClick={() => handleDecrement(ticket.id)}
                          className="px-3 py-1.5 hover:bg-accent text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-foreground">
                          {selectedQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(ticket.id, maxLimit)}
                          className="px-3 py-1.5 hover:bg-accent text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <Button
                        onClick={() => handleCheckout(ticket.id, selectedQty)}
                        disabled={selectedQty <= 0}
                        size="sm"
                      >
                        Buy Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
