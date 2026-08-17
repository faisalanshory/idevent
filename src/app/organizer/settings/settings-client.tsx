"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { updateOrganizerSettings } from "./actions";
import { Settings, Eye } from "lucide-react";

interface OrganizerSettings {
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  siteSetting: {
    title: string | null;
    description: string | null;
  } | null;
}

interface SettingsClientProps {
  initialSettings: OrganizerSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { toast } = useToast();
  const [name, setName] = React.useState(initialSettings.name);
  const [description, setDescription] = React.useState(initialSettings.description || "");
  const [email, setEmail] = React.useState(initialSettings.email || "");
  const [phone, setPhone] = React.useState(initialSettings.phone || "");
  const [website, setWebsite] = React.useState(initialSettings.website || "");
  const [logo, setLogo] = React.useState(initialSettings.logo || "");
  const [favicon, setFavicon] = React.useState(initialSettings.favicon || "");
  const [primaryColor, setPrimaryColor] = React.useState(initialSettings.primaryColor);
  const [secondaryColor, setSecondaryColor] = React.useState(initialSettings.secondaryColor);
  
  const [siteTitle, setSiteTitle] = React.useState(initialSettings.siteSetting?.title || "");
  const [siteDescription, setSiteDescription] = React.useState(initialSettings.siteSetting?.description || "");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !primaryColor || !secondaryColor) {
      toast("Validation Error", "Name and branding colors are required.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateOrganizerSettings({
        name,
        description: description || undefined,
        email: email || undefined,
        phone: phone || undefined,
        website: website || undefined,
        logo: logo || undefined,
        favicon: favicon || undefined,
        primaryColor,
        secondaryColor,
        siteTitle: siteTitle || undefined,
        siteDescription: siteDescription || undefined,
      });

      if (res.error) throw new Error(res.error);

      toast("Settings Saved", "Your organization profile and theme branding were updated.", "success");
      // Fast reload to update sidebar state & icons
      window.location.reload();
    } catch (err: any) {
      toast("Error Saving", err.message || "Failed to update settings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your organization branding, profile info, and custom styles.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Organization Profile */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Organization Profile</CardTitle>
              <CardDescription>Public identity details of your event organizer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">Organizer Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">About Description</label>
                <Textarea
                  placeholder="Tell clients about your organization..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">External Website</label>
                <Input
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Colors & Branding */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Custom Styles & Branding</CardTitle>
              <CardDescription>These colors are loaded dynamically on your customer-facing website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Logo Image URL</label>
                  <Input
                    placeholder="https://..."
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Favicon Image URL</label>
                  <Input
                    placeholder="https://..."
                    value={favicon}
                    onChange={(e) => setFavicon(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storefront SEO Metadata */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">SEO & Meta Tags</CardTitle>
              <CardDescription>Optimize search engine headers for your storefront domain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">Homepage Title Tag</label>
                <Input
                  placeholder="e.g. Jakarta Rock Arena - Official Tickets"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Description</label>
                <Textarea
                  placeholder="Meta text displayed in Google search listings..."
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-border/40">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving changes..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Col: Theme Previewer */}
        <div className="space-y-6">
          <Card className="border-border/60 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Branding Preview
              </CardTitle>
              <CardDescription>Visual mock-up of how colors will skin your storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Banner preview */}
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs">
                {/* Header Mock */}
                <div className="h-10 bg-white dark:bg-card border-b border-border/40 px-3 flex items-center justify-between text-[10px]">
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {name || "Logo Logo"}
                  </span>
                  <div className="flex gap-2">
                    <span className="opacity-80">Events</span>
                    <span className="opacity-80">Blog</span>
                  </div>
                </div>

                {/* Hero Banner Mock */}
                <div
                  className="p-6 text-center space-y-2 text-white relative flex flex-col justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  <p className="font-bold text-xs">Discover Awesome Events</p>
                  <p className="text-[8px] opacity-90 max-w-xs mx-auto">
                    {siteDescription || "Welcome to our premium multi-tenant ticket booking site."}
                  </p>
                  <button
                    className="self-center text-[8px] font-bold px-3 py-1 bg-white rounded-md mt-2 shadow-xs cursor-default"
                    style={{ color: primaryColor }}
                  >
                    Buy Ticket
                  </button>
                </div>

                {/* Listing Grid Mock */}
                <div className="p-4 bg-muted/20 space-y-3">
                  <p className="text-[10px] font-bold text-foreground">Upcoming Events</p>
                  <div className="border border-border/60 bg-white dark:bg-card rounded-lg overflow-hidden flex flex-col">
                    <div className="h-16 bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                      IMAGE MOCKUP
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-[9px] font-bold text-foreground">Music Carnival 2026</p>
                      <button
                        className="w-full text-center text-[8px] font-bold py-1 text-white rounded-md cursor-default"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Select Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 border border-border text-xs text-muted-foreground leading-normal">
                Adjust the primary and secondary colors using the pickers. The preview card skins immediately to help you check contrast.
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
