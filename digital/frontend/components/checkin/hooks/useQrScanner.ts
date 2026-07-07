"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

type UseQrScannerOptions = {
  /** DOM id of the container element html5-qrcode renders into. */
  elementId: string;
  /** Start/stop the camera. */
  enabled: boolean;
  onScan: (decodedText: string) => void;
};

/**
 * Camera QR scanner backed by the real `html5-qrcode` package
 * (replaces the old `window.Html5Qrcode` global that was never loaded).
 * Torch is feature-detected via track capabilities — iOS Safari has no
 * torch API, so `torchAvailable` stays false there and the UI hides it.
 */
export function useQrScanner({ elementId, enabled, onScan }: UseQrScannerOptions) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const host = document.getElementById(elementId);
    if (!enabled || !host) return;

    // html5-qrcode sets inline `position: relative` on its container, which
    // overrides Tailwind's `absolute` and collapses `inset-0` hosts to 0×0
    // (camera streams into an invisible box → pitch-black screen). Each run
    // also gets a private mount node so a StrictMode-remounted instance can
    // never clear()/stop() the DOM of the instance that replaced it.
    const mount = document.createElement("div");
    mount.id = `${elementId}-${Math.random().toString(36).slice(2)}`;
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.appendChild(mount);

    const scanner = new Html5Qrcode(mount.id, {
      verbose: false,
      // Native BarcodeDetector decodes faster and tolerates blur/angle far
      // better than the JS fallback; html5-qrcode falls back automatically.
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
    });
    scannerRef.current = scanner;
    let cancelled = false;

    // No qrbox: scan the FULL video frame. A qrbox only decodes inside a
    // small region of the raw feed, which never matched the decorative
    // frame overlay — guests had to blindly hit an invisible 220px target.
    const startPromise = scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      (text) => onScanRef.current(text),
      undefined
    );

    startPromise
      .then(() => {
        if (cancelled) return;
        setCameraError(null);
        try {
          const caps = scanner.getRunningTrackCapabilities() as MediaTrackCapabilities & {
            torch?: boolean;
          };
          setTorchAvailable(Boolean(caps.torch));
        } catch {
          setTorchAvailable(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCameraError(err instanceof Error ? err.message : "Camera unavailable");
        }
      });

    return () => {
      cancelled = true;
      scannerRef.current = null;
      setTorchAvailable(false);
      setTorchOn(false);
      // stop() throws synchronously if start() hasn't resolved yet, so wait
      // for start to settle before tearing down.
      startPromise
        .catch(() => {})
        .then(() => (scanner.isScanning ? scanner.stop() : undefined))
        .catch(() => {})
        .finally(() => {
          try {
            scanner.clear();
          } catch {}
          mount.remove();
        });
    };
  }, [elementId, enabled]);

  const toggleTorch = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    const next = !torchOn;
    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      // Torch rejected by the device — hide the control from here on.
      setTorchAvailable(false);
    }
  }, [torchOn]);

  return { torchAvailable, torchOn, toggleTorch, cameraError };
}
