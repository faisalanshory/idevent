"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createOrganizer, updateOrganizer, deleteOrganizer } from "./actions";
import { Building2, Search, Edit2, Trash2, Plus, ExternalLink } from "lucide-react";

interface Organizer {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
}

interface OrganizersClientProps {
  initialOrganizers: Organizer[];
}

export function OrganizersClient({ initialOrganizers }: OrganizersClientProps) {
  const { toast } = useToast();
  const [organizers, setOrganizers] = React.useState<Organizer[]>(initialOrganizers);
  const [search, setSearch] = React.useState("");

  // Modal control
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingOrg, setEditingOrg] = React.useState<Organizer | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [subdomain, setSubdomain] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = React.useState("#1e3a8a");
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle name change to auto-suggest slug and subdomain
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingOrg) {
      const suggested = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(suggested);
      setSubdomain(suggested);
    }
  };

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setName("");
    setSlug("");
    setSubdomain("");
    setDescription("");
    setEmail("");
    setPhone("");
    setPrimaryColor("#2563eb");
    setSecondaryColor("#1e3a8a");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organizer) => {
    setEditingOrg(org);
    setName(org.name);
    setSlug(org.slug);
    setSubdomain(org.subdomain);
    setDescription(org.description || "");
    setEmail(org.email || "");
    setPhone(org.phone || "");
    setPrimaryColor(org.primaryColor);
    setSecondaryColor(org.secondaryColor);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !subdomain) {
      toast("Validation Error", "Name, slug, and subdomain are required.", "error");
      return;
    }

    setIsLoading(true);
    const payload = {
      name,
      slug,
      subdomain,
      description: description || undefined,
      email: email || undefined,
      phone: phone || undefined,
      primaryColor,
      secondaryColor,
    };

    try {
      let res;
      if (editingOrg) {
        res = await updateOrganizer(editingOrg.id, payload);
      } else {
        res = await createOrganizer(payload);
      }

      if (res.error) {
        throw new Error(res.error);
      }

      toast(
        editingOrg ? "Organizer Updated" : "Organizer Created",
        `Successfully saved organizer ${name}`,
        "success"
      );
      
      setIsModalOpen(false);
      // Fast state reload
      window.location.reload();
    } catch (err: any) {
      toast("Error Saving Organizer", err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete ${orgName}? All associated events and data will be permanently removed.`)) {
      return;
    }

    try {
      const res = await deleteOrganizer(id);
      if (res.error) throw new Error(res.error);
      toast("Organizer Deleted", `Organizer ${orgName} has been deleted.`, "success");
      window.location.reload();
    } catch (err: any) {
      toast("Deletion Failed", err.message || "Something went wrong", "error");
    }
  };

  // Filter list
  const filteredOrganizers = organizers.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  const rootDomain = typeof window !== "undefined" ? window.location.host : "localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Organizers</h1>
          <p className="text-muted-foreground text-sm">Manage client tenant accounts, subdomains, and configurations.</p>
        </div>
        <Button onClick={handleOpenCreate} className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Create Organizer
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Organizer Accounts</CardTitle>
          <CardDescription>A list of all client event organizations hosted on your SaaS.</CardDescription>
          {/* Search bar */}
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or subdomain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredOrganizers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No organizers found matching your search.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Subdomain URL</th>
                  <th className="p-4">Colors</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrganizers.map((org) => {
                  const url = `http://${org.subdomain}.${rootDomain}`;
                  return (
                    <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        <div>
                          <p>{org.name}</p>
                          <p className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                            {org.email || "No contact email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          {org.subdomain}.{rootDomain.split(":")[0]}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-border/80"
                            style={{ backgroundColor: org.primaryColor }}
                            title={`Primary: ${org.primaryColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-border/80"
                            style={{ backgroundColor: org.secondaryColor }}
                            title={`Secondary: ${org.secondaryColor}`}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(org)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(org.id, org.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Creation / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? "Edit Organizer" : "Create New Organizer"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-foreground">Organizer Name</label>
            <Input
              placeholder="e.g. Jakarta Concerts"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Slug</label>
              <Input
                placeholder="e.g. jakarta-concerts"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Subdomain</label>
              <Input
                placeholder="e.g. jakartaconcerts"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              placeholder="Brief description about the organization..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="info@org.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Phone</label>
              <Input
                placeholder="+62..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 p-0 border cursor-pointer shrink-0"
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 font-mono uppercase"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-foreground">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 p-0 border cursor-pointer shrink-0"
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 font-mono uppercase"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Organizer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
