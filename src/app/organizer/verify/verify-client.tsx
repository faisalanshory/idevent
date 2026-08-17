"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getAttendanceStats, verifyTicket, getAttendeeList } from "./actions";
import { QrCode, CheckCircle2, XCircle, Clock, Users, ArrowRight, List, Search } from "lucide-react";

interface Event {
  id: string;
  title: string;
}

interface ScanHistory {
  id: string;
  code: string;
  time: Date;
  status: "success" | "error";
  message: string;
  name?: string;
  type?: string;
}

interface Attendee {
  id: string;
  code: string;
  status: "VALID" | "USED" | string;
  customerName: string;
  customerEmail: string;
  ticketType: string;
  updatedAt: Date;
}

export function VerifyClient({ events }: { events: Event[] }) {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = React.useState<string>(events[0]?.id || "");
  const [ticketCode, setTicketCode] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(false);
  const [stats, setStats] = React.useState({ total: 0, valid: 0, used: 0 });
  const [history, setHistory] = React.useState<ScanHistory[]>([]);
  const [attendees, setAttendees] = React.useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"scanner" | "list">("scanner");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Status pop (Full screen flash)
  const [scanResult, setScanResult] = React.useState<{ status: "success" | "error", message: string } | null>(null);

  React.useEffect(() => {
    if (selectedEventId) {
      refreshStats();
    }
  }, [selectedEventId]);

  // Auto-focus input on load for barcode scanners
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const refreshStats = async () => {
    if (!selectedEventId) return;
    
    // Fetch stats
    const statsRes = await getAttendanceStats(selectedEventId);
    if (statsRes && !statsRes.error) {
      setStats({ total: statsRes.total || 0, valid: statsRes.valid || 0, used: statsRes.used || 0 });
    }

    // Fetch attendee list
    const listRes = await getAttendeeList(selectedEventId);
    if (listRes && !listRes.error && listRes.attendees) {
      setAttendees(listRes.attendees);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = ticketCode.trim();
    if (!code) return;
    if (!selectedEventId) {
      toast("Error", "Please select an event first", "error");
      return;
    }

    setIsScanning(true);
    setTicketCode(""); // clear input for next scan

    try {
      const res = await verifyTicket(selectedEventId, code);
      
      const newHistory: ScanHistory = {
        id: Math.random().toString(36).substr(2, 9),
        code,
        time: new Date(),
        status: res.success ? "success" : "error",
        message: res.message || (res.success ? "Valid" : "Invalid"),
        name: res.ticketInfo?.name,
        type: res.ticketInfo?.type,
      };

      setHistory(prev => [newHistory, ...prev].slice(0, 50)); // Keep last 50
      setScanResult({ status: newHistory.status, message: newHistory.message });
      refreshStats();

      // Clear flash after 2 seconds
      setTimeout(() => setScanResult(null), 2000);
      
      // Auto focus again
      inputRef.current?.focus();

    } catch (err: any) {
      toast("Verification Error", err.message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Flash Overlay */}
      {scanResult && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 ${
          scanResult.status === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {scanResult.status === "success" ? (
            <CheckCircle2 className="h-32 w-32 mb-6 opacity-90" />
          ) : (
            <XCircle className="h-32 w-32 mb-6 opacity-90" />
          )}
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            {scanResult.status === "success" ? "TIKET VALID" : "TIDAK VALID"}
          </h1>
          <p className="text-2xl font-medium opacity-90">{scanResult.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ticket Verification</h1>
          <p className="text-muted-foreground text-sm">Scan QR codes or view the attendee list.</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("scanner")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${activeTab === "scanner" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <QrCode className="h-4 w-4" /> Scanner
          </button>
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${activeTab === "list" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" /> Attendee List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Select Event</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {events.length === 0 && <option value="">No active events found</option>}
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Attendance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Tickets</span>
                </div>
                <span className="font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Checked In</span>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{stats.used}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Waiting</span>
                </div>
                <span className="font-bold text-amber-700 dark:text-amber-400">{stats.valid}</span>
              </div>
              
              {stats.total > 0 && (
                <div className="pt-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${(stats.used / stats.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {Math.round((stats.used / stats.total) * 100)}% Checked In
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === "scanner" ? (
            <>
              <Card className="border-border/60 bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Scan Ticket
                  </CardTitle>
                  <CardDescription>
                    Use a barcode scanner, or manually type the ticket code and press Enter.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleScan} className="flex gap-3">
                    <Input
                      ref={inputRef}
                      placeholder="Scan or enter ticket code (e.g. TCK-1234)..."
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      disabled={isScanning || !selectedEventId}
                      className="text-lg py-6 shadow-inner font-mono uppercase"
                      autoFocus
                    />
                    <Button type="submit" size="lg" className="h-auto px-8" disabled={isScanning || !selectedEventId}>
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recent Scans</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Waiting for first scan...
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                          <th className="p-4">Time</th>
                          <th className="p-4">Code</th>
                          <th className="p-4">Attendee / Type</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {history.map((h) => (
                          <tr key={h.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 text-muted-foreground font-mono text-xs whitespace-nowrap">
                              {h.time.toLocaleTimeString()}
                            </td>
                            <td className="p-4 font-mono font-medium">{h.code}</td>
                            <td className="p-4">
                              {h.name ? (
                                <div>
                                  <p className="font-semibold text-foreground">{h.name}</p>
                                  <p className="text-xs text-muted-foreground">{h.type}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                h.status === "success"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400"
                              }`}>
                                {h.message}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border/60 flex flex-col h-[calc(100vh-14rem)]">
              <CardHeader className="pb-4 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg">Attendee List</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, email, or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-auto flex-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-background shadow-sm z-10">
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                      <th className="p-4 whitespace-nowrap">Attendee</th>
                      <th className="p-4">Ticket Code</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {attendees
                      .filter(a => 
                        a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.code.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((a) => (
                        <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <p className="font-semibold text-foreground">{a.customerName}</p>
                            <p className="text-xs text-muted-foreground">{a.customerEmail}</p>
                          </td>
                          <td className="p-4 font-mono text-xs font-medium">{a.code}</td>
                          <td className="p-4">
                            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                              {a.ticketType}
                            </span>
                          </td>
                          <td className="p-4">
                            {a.status === "USED" ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                                <CheckCircle2 className="h-4 w-4" /> Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                                <Clock className="h-4 w-4" /> Waiting
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {attendees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No attendees found for this event.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
