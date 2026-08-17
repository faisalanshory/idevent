"use client";

import * as React from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, disabled, className, placeholder = "Click to upload an image" }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Invalid File", "Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast("File too large", "Image must be under 5MB", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      onChange(data.url);
    } catch (err: any) {
      toast("Upload Failed", err.message, "error");
    } finally {
      setIsUploading(false);
      // reset input
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("relative rounded-xl border border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors overflow-hidden group h-32 w-full flex items-center justify-center", className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled || isUploading}
        className="hidden"
      />
      
      {value ? (
        <>
          <img src={value} alt="Upload" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
              disabled={disabled || isUploading}
            >
              <UploadCloud className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md"
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 mb-2 animate-spin text-primary" />
              <span className="text-xs font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 mb-2 opacity-50" />
              <span className="text-xs font-medium">{placeholder}</span>
              <span className="text-[10px] opacity-70 mt-1">PNG, JPG up to 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
