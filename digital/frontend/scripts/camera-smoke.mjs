// Camera smoke check for the operator check-in scanner.
// Guards against the "pitch black camera" regression: html5-qrcode sets inline
// `position: relative` on its container, which collapses `absolute inset-0`
// hosts to 0x0 (see useQrScanner.ts). Fails if the video renders at zero size,
// if StrictMode remount leaks a second video, or if any page error fires.
//
// Prereqs: dev stack running (postgres :5433, backend :8080, frontend :3000),
// a check-in event with the code/PIN below, and `playwright-core` available
// (npx -y playwright-core works; adjust executablePath to a local Chromium).
//
// Usage: node scripts/camera-smoke.mjs [eventCode] [pin]

import { chromium } from "playwright-core";

const EVENT_CODE = process.argv[2] ?? "64YKP5";
const PIN = process.argv[3] ?? "123456";

const browser = await chromium.launch({
  channel: process.env.SMOKE_CHANNEL || "chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
  ],
});
const context = await browser.newContext({ permissions: ["camera"] });
const page = await context.newPage();

const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

await page.goto(`http://localhost:3000/checkin/${EVENT_CODE}`, {
  waitUntil: "networkidle",
});

const pin = page.getByTestId("pin-input");
if (await pin.isVisible().catch(() => false)) {
  await pin.fill(PIN);
  await page.getByTestId("pin-submit").click();
}
await page.waitForTimeout(5000);

// Reload with the persisted session: scanner mounts with enabled=true and
// React StrictMode double-invokes the effect — the historically racy path.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(5000);

const state = await page.evaluate(() => {
  const el = document.getElementById("operator-checkin-reader");
  if (!el) return { missing: true };
  const videos = [...el.querySelectorAll("video")].map((v) => ({
    width: v.clientWidth,
    height: v.clientHeight,
    playing: !v.paused && v.readyState === 4,
    live: v.srcObject?.getVideoTracks().every((t) => t.readyState === "live") ?? false,
  }));
  return { missing: false, videos };
});

await browser.close();

const failures = [];
if (state.missing) failures.push("scanner container missing");
else {
  if (state.videos.length !== 1)
    failures.push(`expected 1 video, got ${state.videos.length} (StrictMode leak?)`);
  const v = state.videos[0];
  if (v && (v.width === 0 || v.height === 0))
    failures.push(`video rendered at ${v.width}x${v.height} — pitch-black regression`);
  if (v && (!v.playing || !v.live)) failures.push("video not playing a live stream");
}
if (pageErrors.length) failures.push(`page errors: ${pageErrors.join("; ")}`);

if (failures.length) {
  console.error("CAMERA SMOKE FAILED:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("camera smoke OK:", JSON.stringify(state.videos[0]));
