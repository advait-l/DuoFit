"use client";

import { useRef, useState } from "react";

function proxyUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

interface Props {
  imageUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  readOnly?: boolean;
  inline?: boolean;
}

export default function ImageUpload({ imageUrl, onUpload, onRemove, readOnly, inline }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        onUpload(url);
      }
    } finally {
      setUploading(false);
    }
  }

  if (readOnly) {
    if (!imageUrl) return null;
    const src = proxyUrl(imageUrl);
    return (
      <>
        <button onClick={() => setLightbox(true)} className={inline ? "" : "block mt-1.5"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="attachment" className={`rounded-lg object-cover ${inline ? "h-12 w-12" : "max-w-[120px] h-20 w-full"}`} />
        </button>
        {lightbox && <Lightbox url={src} onClose={() => setLightbox(false)} />}
      </>
    );
  }

  const src = imageUrl ? proxyUrl(imageUrl) : null;

  if (inline) {
    return (
      <>
        {src ? (
          <div className="relative inline-block">
            <button onClick={() => setLightbox(true)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="attachment" className="rounded-lg object-cover h-12 w-12" />
            </button>
            <button
              onClick={onRemove}
              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center shadow hover:bg-destructive/80 transition-colors"
              aria-label="Remove image"
            >
              ✕
            </button>
            {lightbox && <Lightbox url={src} onClose={() => setLightbox(false)} />}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Add photo"
          >
            {uploading ? (
              <span className="animate-pulse">…</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </>
    );
  }

  return (
    <div className="mt-1.5">
      {src ? (
        <div className="relative inline-block">
          <button onClick={() => setLightbox(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="attachment" className="rounded-lg object-cover max-w-[120px] h-20 w-full" />
          </button>
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-destructive/80 transition-colors"
            aria-label="Remove image"
          >
            ✕
          </button>
          {lightbox && <Lightbox url={src} onClose={() => setLightbox(false)} />}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-2.5 py-1.5 transition-colors hover:border-brand-300 disabled:opacity-50"
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Add photo</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt="full size" className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
