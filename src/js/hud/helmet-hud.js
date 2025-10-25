// Helmet HUD: creates a static set of small icon planes attached to the
// `#ui-dummy` camera child so the icons stay fixed to the user's view.
// Icons are simple inline SVG textures so no new image assets are required.

function svgToDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeIconEntity(id, svgDataUrl, w, h, x, y, z) {
  const ent = document.createElement('a-entity');
  ent.setAttribute('id', id);
  ent.setAttribute('geometry', `primitive: plane; width: ${w}; height: ${h}`);
  // use flat shader so color is uncompromised
  ent.setAttribute('material', `shader: flat; src: ${svgDataUrl}; transparent: true; side: double`);
  ent.setAttribute('position', `${x} ${y} ${z}`);
  return ent;
}

export function initHelmetHUD() {
  const uiDummy = document.getElementById('ui-dummy');
  if (!uiDummy) {
    console.warn('helmet-hud: #ui-dummy not found - cannot attach HUD');
    return;
  }

  // Container positioned relative to camera so it appears top-left of view
  const hud = document.createElement('a-entity');
  hud.setAttribute('id', 'helmet-hud');
  // tune this position for a comfortable HUD distance/placement
  hud.setAttribute('position', '-0.9 0.45 -1.25');
  hud.setAttribute('scale', '0.6 0.6 0.6');

  // Icon layout: horizontal row, small gaps
  const iconSize = 0.18;
  const gap = 0.03;
  const icons = [];

  // Battery icon (simple battery shape)
  const batterySVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <rect x='2' y='16' width='48' height='32' rx='3' ry='3' fill='#ffffff' opacity='0.12'/>
    <rect x='6' y='20' width='40' height='24' rx='2' ry='2' fill='#ffffff' />
    <rect x='50' y='26' width='6' height='12' rx='1' ry='1' fill='#ffffff' />
    <rect x='6' y='24' width='32' height='16' rx='1' ry='1' fill='#133754' />
  </svg>`;
  icons.push({ id: 'hud-battery', svg: batterySVG });

  // Heart / heart-rate icon
  const heartSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <path d='M32 48s-20-12-20-22c0-6 4-10 10-10 4 0 6 2 10 6 4-4 6-6 10-6 6 0 10 4 10 10 0 10-20 22-20 22z' fill='#e74c3c'/>
  </svg>`;
  icons.push({ id: 'hud-heart', svg: heartSVG });

  // Pressure icon (gauge-like)
  const pressureSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <circle cx='32' cy='32' r='20' fill='#fff' opacity='0.12'/>
    <circle cx='32' cy='32' r='16' fill='#fff' />
    <line x1='32' y1='32' x2='44' y2='20' stroke='#133754' stroke-width='3' stroke-linecap='round'/>
  </svg>`;
  icons.push({ id: 'hud-pressure', svg: pressureSVG });

  // O2 / oxygen icon (O2 text in a circle)
  const o2SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <circle cx='32' cy='32' r='20' fill='#fff' opacity='0.12'/>
    <text x='32' y='38' font-size='20' font-family='Arial' fill='#133754' text-anchor='middle'>O₂</text>
  </svg>`;
  icons.push({ id: 'hud-o2', svg: o2SVG });

  // Compass icon (simple N indicator)
  const compassSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    <circle cx='32' cy='32' r='20' fill='#fff' opacity='0.12'/>
    <polygon points='32,12 38,34 32,28 26,34' fill='#133754' />
    <text x='32' y='52' font-size='10' text-anchor='middle' fill='#ffffff' opacity='0.9'>N</text>
  </svg>`;
  icons.push({ id: 'hud-compass', svg: compassSVG });

  // Create and position icon entities
  let x = 0;
  for (let i = 0; i < icons.length; i++) {
    const info = icons[i];
    const url = svgToDataUrl(info.svg);
    const ent = makeIconEntity(info.id, url, iconSize, iconSize, x, 0, 0.01);
    // left-to-right: advance x by width + gap
    hud.appendChild(ent);
    x += iconSize + gap;
  }

  // Add HUD to ui-dummy (camera child)
  uiDummy.appendChild(hud);

  // Keep HUD visible when entering/exiting VR
  const sceneEl = document.querySelector('a-scene');
  if (sceneEl) {
    sceneEl.addEventListener('enter-vr', () => {
      hud.setAttribute('visible', 'true');
    });
    sceneEl.addEventListener('exit-vr', () => {
      hud.setAttribute('visible', 'true');
    });
  }
}

// default export for older imports
export default { initHelmetHUD };
