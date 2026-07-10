// Converts an uploaded PNG/JPEG to a resized WebP off the main thread.
// Posts back the WebP Blob, or null to signal "upload the original instead".
self.onmessage = async (e: MessageEvent<File>) => {
  try {
    // "from-image" applies the EXIF orientation tag natively (values 1–8,
    // rotation + mirroring) — no manual EXIF binary parsing needed.
    const bitmap = await createImageBitmap(e.data, { imageOrientation: "from-image" });
    const MAX = 2560; // downscale huge camera shots; invitations never render larger
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
    // Best-effort wide gamut: the platform can't expose the source ICC profile,
    // but a display-p3 context avoids clipping P3 photos to sRGB. Fall back
    // silently where unsupported.
    let ctx: OffscreenCanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d", { colorSpace: "display-p3" });
    } catch {
      /* older browsers reject the colorSpace option */
    }
    ctx ??= canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
    // Old Safari may encode png despite the requested type — signal "keep original".
    self.postMessage(blob.type === "image/webp" ? blob : null);
  } catch {
    self.postMessage(null); // undecodable (e.g. HEIC on non-Safari) → keep original
  }
};

export {};
