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
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const slots = Array.from({ length: maxImages }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="mb-2">
        <h2 className="font-serif text-3xl sm:text-4xl mb-2">
          Drop your <span className="italic">screenshots</span>
        </h2>
        <p className="text-text-secondary text-sm">
          {images.length}/{maxImages} added
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        {slots.map((i) => {
          const img = images[i];
          return (
            <div
              key={i}
              className="relative aspect-[3/4] rounded-xl overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={!img ? handleDrop : undefined}
            >
              {img ? (
                <>
                  <img
                    src={img}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                    aria-label="Remove"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[10px] text-text-primary font-medium shadow-sm">
                    {i + 1}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="w-full h-full border border-dashed border-border hover:border-accent/40 rounded-xl flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-accent transition-colors cursor-pointer bg-bg-secondary"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[11px]">Add</span>
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
    </div>
  );
}
