// Canvas-based Helmet HUD
// Draws a single high-resolution canvas containing icons + optional text
// and maps it onto a small plane attached to the camera's `#ui-dummy`.

function createCanvas(id, w = 2048, h = 2048) {
  const existing = document.getElementById(id);
    if (existing) {
      existing.width = w;
      existing.height = h;
      return existing;
    }
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.width = w;
  canvas.height = h;
  // keep it out of layout; still accessible as texture by three.js
  canvas.style.position = 'absolute';
  canvas.style.left = '-9999px';
  canvas.style.top = '0';
  document.body.appendChild(canvas);
  return canvas;
}

function drawHUD(canvas, frameImg) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Clear
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) * 0.42;

  // If no frame image provided, draw a soft vignette (fallback)
  if (!frameImg) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15);
    grad.addColorStop(0, 'rgba(0,0,0,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Do not draw any HUD icons — user requested they be removed.
  // If a frame image is provided, composite it on top (it should have alpha center)
  if (frameImg && frameImg.complete) {
    try {
      ctx.drawImage(frameImg, 0, 0, W, H);
    } catch (e) {
      // ignore draw errors
      console.warn('Failed to draw helmet frame image onto HUD canvas', e);
    }
  }

  // HUD label removed per request: do not draw text label in the helmet HUD
}

// utilities
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawBattery(ctx, cx, cy, w, h) {
  const halfH = h / 2;
  const left = cx - w / 2;
  const top = cy - halfH;
  // outer
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, left, top, w * 0.9, h, 6, true, false);
  // inner fill
  ctx.fillStyle = '#0fbf7a';
  roundRect(ctx, left + 6, top + 6, (w * 0.9) * 0.7, h - 12, 4, true, false);
  // positive nub
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(left + (w * 0.9) + 4, cy - h * 0.15, w * 0.06, h * 0.3);
}

function drawHeart(ctx, cx, cy, w, h) {
  const s = Math.min(w, h);
  const x = cx;
  const y = cy + s * 0.05;
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  const topCurveHeight = s * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - s / 2, y + (s / 2), x, y + (s * 0.9), x, y + (s * 1.15));
  ctx.bezierCurveTo(x, y + (s * 0.9), x + s / 2, y + (s / 2), x + s / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
}

function drawPressure(ctx, cx, cy, w, h) {
  const r = Math.min(w, h) * 0.45;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // inner circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.fill();
  // needle
  ctx.strokeStyle = '#133754';
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.6, cy - r * 0.6);
  ctx.stroke();
}

function drawO2(ctx, cx, cy, w, h) {
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  const r = Math.min(w, h) * 0.45;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#133754';
  ctx.font = `${Math.round(r * 1.1)}px Roboto, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O₂', cx, cy + 2);
}

function drawCompass(ctx, cx, cy, w, h) {
  const r = Math.min(w, h) * 0.45;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // triangle pointer
  ctx.fillStyle = '#133754';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.8);
  ctx.lineTo(cx + r * 0.35, cy + r * 0.15);
  ctx.lineTo(cx - r * 0.35, cy + r * 0.15);
  ctx.closePath();
  ctx.fill();
  // N label
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `${Math.round(r * 0.5)}px Roboto, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', cx, cy + r * 0.6);
}

export function initHelmetHUDCanvas() {
  const uiDummy = document.getElementById('ui-dummy');
  if (!uiDummy) {
    console.warn('helmet-hud-canvas: #ui-dummy not found');
    return;
  }

  const sceneEl = document.querySelector('a-scene');

  // compute sizes based on camera FOV so the plane fills the viewport
  function setupHUD() {
    console.log('[helmet-hud] setupHUD');
    const dpr = window.devicePixelRatio || 1;
    const aspect = window.innerWidth / window.innerHeight;
    const baseHeight = 1024; // logical base height for canvas
    const canvasH = Math.round(baseHeight * dpr * 2);
    const canvasW = Math.round(baseHeight * aspect * dpr * 2);

  const canvas = createCanvas('hud-canvas', canvasW, canvasH);
  console.log('[helmet-hud] canvas created', canvas.width, canvas.height);

    // attempt to load the helmet frame image from public/img/helmet_frame.png
    const frameImg = new Image();
    frameImg.crossOrigin = 'anonymous';
    frameImg.src = 'img/helmet_frame.png';
    frameImg.onload = () => {
      console.log('[helmet-hud] frame image loaded');
      drawHUD(canvas, frameImg);
      // force texture update on the A-Frame material if created
      const hudEl = document.getElementById('helmet-hud-canvas');
      if (hudEl && hudEl.getObject3D) {
        const mesh = hudEl.getObject3D('mesh');
        if (mesh && mesh.material && mesh.material.map) {
          mesh.material.map.needsUpdate = true;
          console.log('[helmet-hud] texture needsUpdate set');
        } else {
          console.warn('[helmet-hud] mesh/material/map not found to set needsUpdate');
        }
      }
    };
    frameImg.onerror = () => {
      console.warn('[helmet-hud] failed to load frame image, using fallback vignette');
      // fallback: draw programmatic vignette
      drawHUD(canvas, null);
    };

    // choose desired distance (relative to camera) for the plane
    const distance = 0.8;
    // get camera fov from three camera if available
    let fov = 60; // default
    if (sceneEl && sceneEl.camera && sceneEl.camera.fov) fov = sceneEl.camera.fov;

    // account for uiDummy offset: uiDummy is already positioned (e.g. -1.75)
    // compute total distance from camera to plane in world space
    let uiOffsetZ = 0;
    try {
      const pos = uiDummy.getAttribute('position');
      uiOffsetZ = pos && typeof pos.z === 'number' ? Math.abs(pos.z) : Math.abs(parseFloat(pos && pos.split ? pos.split(' ')[2] : 0) || 0);
    } catch (e) {
      uiOffsetZ = 0;
    }
    const totalDistance = uiOffsetZ + distance;
    const height = 2 * totalDistance * Math.tan((fov * Math.PI) / 180 / 2);
    const width = height * aspect;
    console.log('[helmet-hud] uiOffsetZ=', uiOffsetZ, 'totalDistance=', totalDistance, 'fov=', fov, 'width,height=', width, height);

    // Create or update plane mapped to canvas texture (icons & text)
    let hud = document.getElementById('helmet-hud-canvas');
    if (!hud) {
      hud = document.createElement('a-entity');
      hud.setAttribute('id', 'helmet-hud-canvas');
      hud.setAttribute('material', 'shader: flat; src: #hud-canvas; transparent: true; side: double');
      uiDummy.appendChild(hud);
    }
    hud.setAttribute('geometry', `primitive: plane; width: ${width}; height: ${height}`);
    console.log('[helmet-hud] set geometry', width, height, 'position', `0 0 -${distance}`);
    hud.setAttribute('position', `0 0 -${distance}`);
    hud.setAttribute('scale', '1 1 1');

    // Also create a separate plane for the static helmet frame image (so it reliably overlays)
    // Create a hidden img element as source if not present
    let frameImgEl = document.getElementById('helmet-frame-img');
    if (!frameImgEl) {
      frameImgEl = document.createElement('img');
      frameImgEl.id = 'helmet-frame-img';
      frameImgEl.src = 'img/helmet_frame.png';
      frameImgEl.style.display = 'none';
      document.body.appendChild(frameImgEl);
    }

    let framePlane = document.getElementById('helmet-frame-plane');
    if (!framePlane) {
      framePlane = document.createElement('a-entity');
      framePlane.setAttribute('id', 'helmet-frame-plane');
      // put frame slightly closer to camera so it overlays the canvas icons
      framePlane.setAttribute('material', 'shader: flat; src: #helmet-frame-img; transparent: true; side: double');
      uiDummy.appendChild(framePlane);
    }
    framePlane.setAttribute('geometry', `primitive: plane; width: ${width}; height: ${height}`);
    framePlane.setAttribute('position', `0 0 -${distance - 0.01}`);
    framePlane.setAttribute('scale', '1 1 1');

    // ensure visibility in both modes
    if (sceneEl) {
      sceneEl.addEventListener('enter-vr', () => hud.setAttribute('visible', 'true'));
      sceneEl.addEventListener('exit-vr', () => hud.setAttribute('visible', 'true'));
    }
  }

  // initial setup
  setupHUD();
  // update on resize
  window.addEventListener('resize', () => {
    setupHUD();
  });
}

export default { initHelmetHUDCanvas };
