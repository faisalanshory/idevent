import { db } from "@/lib/db";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Users, Ticket, Activity, ExternalLink } from "lucide-react";

export const revalidate = 0; // Live data load

export default async function OrganizerOverview() {
  const session = await getSession();
  if (!session) redirect("/login");

  const organizer = await getOrganizerAccess(session.id);
  if (!organizer) redirect("/login");

  // Fetch metrics for this organizer
  const totalEvents = await db.event.count({
    where: { organizerId: organizer.id },
  });

  const activeEvents = await db.event.count({
    where: { organizerId: organizer.id, status: "PUBLISHED" },
  });

  const orders = await db.order.findMany({
    where: { organizerId: organizer.id, paymentStatus: "PAID" },
    include: {
      orderItems: true,
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const ticketsSold = orders.reduce((sum, order) => {
    return sum + order.orderItems.reduce((s, item) => s + item.quantity, 0);
  }, 0);

  const totalCustomers = await db.customer.count({
    where: { organizerId: organizer.id },
  });

  // Fetch recent orders
  const recentOrders = await db.order.findMany({
    where: { organizerId: organizer.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      event: true,
    },
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const storefrontUrl = `http://${organizer.subdomain}.${rootDomain}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Manage your events, sales, and tickets here.</p>
        </div>
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Visit Storefront
          </Button>
        </a>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Calendar className="h-4 w-4" style={{ color: organizer.primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeEvents} published live events</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4" style={{ color: organizer.primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tickets issued</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4" style={{ color: organizer.primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{orders.length} paid orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4" style={{ color: organizer.primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique directory contacts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Recent Ticket Orders</CardTitle>
          <CardDescription>View recent transactions placed on your organizer storefront.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No orders have been placed yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-mono font-semibold text-foreground">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate font-medium">{order.event.title}</td>
                    <td className="p-4 font-bold">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : order.paymentStatus === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
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
