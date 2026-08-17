"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { Language } from "./dictionaries";

export function LanguageSwitcher({ currentLang }: { currentLang: Language }) {
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLang = currentLang === "id" ? "en" : "id";
    document.cookie = `NEXT_LOCALE=${nextLang}; path=/; max-age=31536000`; // 1 year
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2 px-3 hover:bg-black/5">
      <Globe className="h-4 w-4" />
      <span className="font-semibold">{currentLang === "id" ? "ID" : "EN"}</span>
    </Button>
  );
}
