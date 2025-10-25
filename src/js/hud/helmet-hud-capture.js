import html2canvas from 'html2canvas';
import { createHelmetHudDOM } from './helmet-hud-dom';

let _captureInterval = null;

export function startHelmetHudCapture(canvas, desiredWidth, desiredHeight, fps = 6) {
  if (!canvas) return;
  // Ensure we have a DOM HUD sized to match the canvas (or desired dimension)
  const id = 'helmet-react-ui-hidden';
  const container = createHelmetHudDOM(id, desiredWidth, desiredHeight);
  // Ensure container size matches canvas pixel size so html2canvas snapshots at correct resolution
  container.style.width = desiredWidth + 'px';
  container.style.height = desiredHeight + 'px';

  const ctx = canvas.getContext('2d');

  // Capture loop
  if (_captureInterval) clearInterval(_captureInterval);
  const intervalMs = Math.round(1000 / fps);
  _captureInterval = setInterval(async () => {
    try {
      const scale = 1; // canvas already sized
  // Request html2canvas capture with a transparent background
  const opts = { width: desiredWidth, height: desiredHeight, scale, backgroundColor: null, useCORS: true };
  const snapshot = await html2canvas(container, opts);
      // draw into HUD canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(snapshot, 0, 0, canvas.width, canvas.height);
      // if frame image will be drawn later by existing code, we won't overwrite it; texture update will be triggered elsewhere
    } catch (e) {
      // non-fatal
      console.warn('[helmet-hud-capture] snapshot error', e);
    }
  }, intervalMs);

  // return a stop function
  return () => {
    if (_captureInterval) clearInterval(_captureInterval);
    if (container && container._helmetHudDestroy) container._helmetHudDestroy();
  };
}
