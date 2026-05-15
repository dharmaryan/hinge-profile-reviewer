"use client";

import { useCallback, useRef } from "react";
import { compressImage } from "@/lib/images/compress";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      const compressed = await Promise.all(
        filesToProcess.map((f) => compressImage(f))
      );

      onImagesChange([...images, ...compressed]);
    },
    [images, onImagesChange, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const slots = Array.from({ length: maxImages }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upload your profile screenshots</h3>
        <span className="text-sm text-text-secondary">
          {images.length}/{maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((i) => {
          const img = images[i];
          return (
            <div
              key={i}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={!img ? handleDrop : undefined}
            >
              {img ? (
                <>
                  <img
                    src={img}
                    alt={`Profile screenshot ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                    aria-label="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-xs text-white font-medium">
                    {i + 1}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="w-full h-full border-2 border-dashed border-text-muted/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent-rose/50 hover:text-accent-rose/70 transition-colors cursor-pointer"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-text-muted mt-3 text-center">
        Drag & drop or tap to upload. JPEG, PNG, or WebP.
      </p>
    </div>
  );
}
