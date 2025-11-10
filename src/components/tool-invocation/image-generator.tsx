"use client";

import { ToolUIPart } from "ai";
import equal from "lib/equal";
import { cn } from "lib/utils";
import { ImagesIcon, Download } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { TextShimmer } from "ui/text-shimmer";
import LetterGlitch from "ui/letter-glitch";

interface ImageGeneratorToolInvocationProps {
  part: ToolUIPart;
}

interface ImageGenerationResult {
  images: {
    url: string;
    mimeType?: string;
  }[];
  mode?: "create" | "edit" | "composite";
  model: string;
}

function PureImageGeneratorToolInvocation({
  part,
}: ImageGeneratorToolInvocationProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const isGenerating = useMemo(() => {
    return !part.state.startsWith("output");
  }, [part.state]);

  const result = useMemo(() => {
    if (!part.state.startsWith("output")) return null;
    return part.output as ImageGenerationResult;
  }, [part.state, part.output]);

  const images = useMemo(() => {
    return result?.images || [];
  }, [result]);

  const mode = useMemo(() => {
    return result?.mode || "create";
  }, [result]);

  const hasError = useMemo(() => {
    return (
      part.state === "output-error" ||
      (part.state === "output-available" && result?.images.length === 0)
    );
  }, [part.state, result]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const handleDownload = async () => {
    if (!images[0]?.url) return;

    try {
      const response = await fetch(images[0].url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Get mode-specific text
  const getModeText = (mode: string) => {
    switch (mode) {
      case "edit":
        return "Editing image...";
      case "composite":
        return "Compositing images...";
      default:
        return "Generating image...";
    }
  };

  // Compact loading state - ChatGPT style
  if (isGenerating) {
    return (
      <div className="inline-flex flex-col gap-2 max-w-sm">
        <div className="relative w-64 h-64 overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <LetterGlitch />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
              <ImagesIcon className="size-3.5 text-primary animate-pulse flex-shrink-0" />
              <TextShimmer className="text-xs font-medium flex-1 truncate">
                {getModeText(mode)}
              </TextShimmer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact result display - ChatGPT style
  return (
    <div className="inline-flex flex-col gap-2">
      {hasError ? (
        <div className="w-64 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-xl text-xs">
          {part.errorText ??
            (result?.images.length === 0
              ? "No images generated"
              : "Failed to generate image")}
        </div>
      ) : images.length > 0 ? (
        <div className="relative group w-64 h-64 rounded-2xl overflow-hidden border border-border/30 hover:border-border/60 transition-all duration-300 shadow-md hover:shadow-xl bg-card">
          {/* Compact single image */}
          <div
            className={cn(
              "relative w-full h-full transition-all duration-500",
              loadedImages.has(0) ? "opacity-100" : "opacity-0",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0].url}
              loading="lazy"
              alt="Generated image"
              className="w-full h-full object-cover"
              onLoad={() => handleImageLoad(0)}
            />
          </div>

          {/* Loading skeleton */}
          {!loadedImages.has(0) && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
          )}

          {/* Compact hover controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
              <a
                href={images[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/95 hover:bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center backdrop-blur-sm"
              >
                View
              </a>
              <button
                onClick={handleDownload}
                className="flex-1 bg-white/95 hover:bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 backdrop-blur-sm"
              >
                <Download className="size-3" />
                Save
              </button>
            </div>
          </div>

          {/* Model badge */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">
              {result?.model}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-64 bg-muted/50 text-muted-foreground p-3 rounded-xl text-xs border border-border/20">
          No images to display
        </div>
      )}
    </div>
  );
}

export const ImageGeneratorToolInvocation = memo(
  PureImageGeneratorToolInvocation,
  (prev, next) => {
    return equal(prev.part, next.part);
  },
);
