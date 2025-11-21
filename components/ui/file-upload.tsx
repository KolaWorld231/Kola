"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  type: "audio" | "image";
  prefix?: string;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSizeLabel?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  type,
  prefix,
  disabled = false,
  className,
  accept,
  maxSizeLabel,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      if (prefix) {
        formData.append("prefix", prefix);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to upload file");
      }

      const data = (await response.json()) as { url: string };
      onChange(data.url);
      setPreview(data.url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAcceptTypes = () => {
    if (accept) return accept;
    if (type === "audio") {
      return ".mp3,.wav,.ogg,.webm,.m4a";
    }
    return ".jpg,.jpeg,.png,.gif,.webp";
  };

  const maxSizeDisplay = maxSizeLabel || (type === "audio" ? "10MB" : "5MB");

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      {preview ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background-dark">
            {type === "image" ? (
              <Image
                src={preview}
                alt="Preview"
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <File className="h-8 w-8 text-primary" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{preview.split("/").pop()}</p>
              <p className="text-xs text-foreground-light">Uploaded</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value);
            }}
            placeholder={`Or enter URL manually (${maxSizeDisplay})`}
            disabled={disabled}
            className="text-sm"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept={getAcceptTypes()}
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              id={`file-upload-${type}-${Math.random()}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {type === "audio" ? "Audio" : "Image"}
                </>
              )}
            </Button>
            <span className="text-sm text-foreground-light">
              Max {maxSizeDisplay}
            </span>
          </div>
          <Input
            type="url"
            value={value || ""}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value);
            }}
            placeholder={`Or enter URL manually (${maxSizeDisplay})`}
            disabled={disabled}
            className="text-sm"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!error && !preview && (
        <p className="text-xs text-foreground-light">
          {type === "audio"
            ? "Supported: MP3, WAV, OGG, WebM, M4A"
            : "Supported: JPG, PNG, GIF, WebP"}
        </p>
      )}
    </div>
  );
}

