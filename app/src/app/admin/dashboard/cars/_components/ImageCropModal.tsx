"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, CropIcon, Loader2, ZoomIn } from "lucide-react";

interface ImageCropModalProps {
  file: File;
  objectUrl: string;
  onConfirm: (croppedFile: File) => void;
  onSkip: () => void;
  onCancel: () => void;
  /** Total files in queue so user knows progress */
  queueRemaining: number;
}

export default function ImageCropModal({
  file,
  objectUrl,
  onConfirm,
  onSkip,
  onCancel,
  queueRemaining,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedFile(objectUrl, croppedAreaPixels, file.name);
      onConfirm(croppedFile);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/85 backdrop-blur-sm p-4">
      <div className="bg-surface-white rounded-2xl shadow-luxury w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          <div>
            <div className="flex items-center gap-2">
              <CropIcon className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Adjust Photo</h2>
              {queueRemaining > 1 && (
                <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[11px] font-semibold rounded-md">
                  {queueRemaining} remaining
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Crop to <span className="font-semibold text-text-secondary">16:9</span> — required for consistent display across all card views
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-surface-light rounded-lg transition-colors"
            title="Cancel all"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* File info bar */}
        <div className="px-5 py-2 bg-surface-light border-b border-border-light flex items-center gap-2">
          <span className="text-[11px] text-text-muted truncate max-w-[260px]">{file.name}</span>
          <span className="text-[11px] text-text-muted ml-auto shrink-0">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>

        {/* Cropper canvas */}
        <div className="relative w-full bg-brand-dark" style={{ height: 320 }}>
          <Cropper
            image={objectUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            style={{
              containerStyle: { backgroundColor: "#0B111D" },
              cropAreaStyle: {
                border: "2px solid #2563EB",
                boxShadow: "0 0 0 9999px rgba(11,17,29,0.75)",
              },
            }}
          />
        </div>

        {/* Zoom control */}
        <div className="px-5 py-3 border-b border-border-light bg-surface-light">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-brand-primary bg-border-light"
            />
            <span className="text-xs text-text-muted w-8 text-right tabular-nums">{zoom.toFixed(1)}×</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-text-muted hover:text-text-primary transition-colors underline-offset-2 hover:underline"
          >
            Skip this photo
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-60 btn-primary"
          >
            {processing
              ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
              : <><CropIcon className="w-4 h-4" />Crop & Use</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Canvas crop helper ─────────────────────────────────────────────────
async function getCroppedFile(
  imageSrc: string,
  pixelCrop: Area,
  originalName: string
): Promise<File> {
  // Load the image into a bitmap
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const baseName = originalName.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${baseName}_16x9.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}
