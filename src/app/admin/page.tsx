import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Calendar, CreditCard, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Always fetch live statistics

export default async function SuperadminOverview() {
  // Fetch real counts from DB
  const totalOrganizers = await db.organizer.count();
  const totalEvents = await db.event.count();
  const totalCustomers = await db.customer.count();
  const totalOrders = await db.order.count();
  
  // Calculate total revenue
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: "PAID" },
    select: { totalAmount: true }
  });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Fetch recent organizers
  const recentOrganizers = await db.organizer.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  // Fetch recent orders
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      organizer: true,
      customer: true,
      event: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm">Monitor platform-wide tenants, ticketing metrics, and transactions.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Organizers</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tenant workspaces</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Created across all tenants</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform-wide unique buyers</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{totalOrders} transaction orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Organizers */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Recent Organizers</CardTitle>
            <CardDescription>Recently registered event organizers</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentOrganizers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No organizers registered yet.</p>
            ) : (
              <div className="divide-y divide-border/40">
                {recentOrganizers.map((org) => (
                  <div key={org.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-md object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{org.name}</p>
                        <p className="text-xs text-muted-foreground">slug: {org.slug}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest orders placed on the platform</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No transactions logged yet.</p>
            ) : (
              <div className="divide-y divide-border/40">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[200px]">{order.event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        By {order.customer.name} &bull; {order.organizer.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        Rp {order.totalAmount.toLocaleString("id-ID")}
                      </p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                        order.paymentStatus === "PAID" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400" 
                          : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
