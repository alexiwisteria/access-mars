// Simple DOM-based Helmet HUD widget (no React)
// Creates a centered overlay box that consolidates vitals, Mars weather and threat

export function initHelmetHUDWidget() {
  // Avoid creating twice
  if (document.getElementById('helmet-hud-widget')) return;

  const container = document.createElement('div');
  container.id = 'helmet-hud-widget';
  Object.assign(container.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(82vw, 1100px)',
    maxWidth: '1100px',
    height: 'min(66vh, 700px)',
    background: 'linear-gradient(180deg, rgba(10,11,13,0.9), rgba(0,0,0,0.85))',
    borderRadius: '28px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
    border: '3px solid rgba(60, 70, 80, 0.6)',
    color: '#cbd5e1',
    zIndex: 9999,
    padding: '18px',
    fontFamily: 'Roboto, Arial, sans-serif',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    pointerEvents: 'none'
  });

  // inner content area (allows pointer events for any interactive elements in future)
  const inner = document.createElement('div');
  inner.style.pointerEvents = 'auto';
  inner.style.width = '100%';
  inner.style.height = '100%';
  inner.style.display = 'grid';
  inner.style.gridTemplateColumns = '1fr';
  inner.style.gridTemplateRows = '1fr';
  inner.style.gap = '12px';

  container.appendChild(inner);
  document.body.appendChild(container);

  // State
  const vitals = {
    o2_pct: 20.7,
    hr_bpm: 88,
    hr_history: Array(60).fill(85).map((v,i)=> v + Math.sin(i/10)*5),
    suit_pressure_kPa: 27.4,
    suit_temp_C: 18.6,
    temp_trend: 'stable'
  };

  const mars = {
    AT: { av: -62.314, mn: -96.872, mx: -15.908 },
    HWS: { av: 7.233, mx: 22.455 },
    PRE: { av: 750.563, mn: 722.0901, mx: 768.791 },
    WD: { most_common: { compass_point: 'WNW', compass_degrees: 292.5 } },
    First_UTC: '2020-10-19T18:32:20Z',
    Last_UTC: '2020-10-20T19:11:55Z'
  };

  let threat = 'green';

  function getO2Color(value){
    if (value >= 21) return 'color:#34d399';
    if (value >= 19) return 'color:#fbbf24';
    return 'color:#f87171';
  }
  function getHrColor(value){
    if (value <= 120) return 'color:#67e8f9';
    if (value <= 160) return 'color:#fbbf24';
    return 'color:#f87171';
  }
  function getPressureColor(value){
    if (value >= 25) return 'color:#67e8f9';
    if (value >= 20) return 'color:#fbbf24';
    return 'color:#f87171';
  }

  function formatTimeRange(first, last){
    try{
      const a = new Date(first).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const b = new Date(last).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `${a} → ${b}`;
    }catch(e){ return '' }
  }

  // Render
  function render(){
    inner.innerHTML = `
      <div style="display:flex;flex-direction:row;gap:12px;height:100%">
        <div style="flex:1;display:flex;flex-direction:column;gap:10px">
          <div style="font-size:12px;color:#60a5fa;font-family:monospace;letter-spacing:1px">VITALS</div>

          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:84px;height:84px;position:relative;border-radius:999px;background:rgba(255,255,255,0.02);display:flex;align-items:center;justify-content:center">
              <div style="text-align:center">
                <div style="font-size:22px;font-weight:700;${getO2Color(vitals.o2_pct)}">${vitals.o2_pct.toFixed(1)}</div>
                <div style="font-size:10px;color:#94a3b8">%</div>
              </div>
            </div>
            <div style="flex:1">
              <div style="font-size:11px;color:#94a3b8">OXYGEN</div>
              <div style="font-size:12px;color:#94a3b8">${vitals.o2_pct >=21 ? 'NOMINAL' : vitals.o2_pct >=19 ? 'CAUTION' : 'CRITICAL'}</div>
            </div>
          </div>

          <!-- Added pressure and temperature to main dashboard -->
          <div style="display:flex;gap:8px;margin-top:6px">
            <div style="flex:1;background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)">
              <div style="font-size:11px;color:#94a3b8">PRESSURE</div>
              <div style="font-weight:700;${getPressureColor(vitals.suit_pressure_kPa)}">${vitals.suit_pressure_kPa.toFixed(1)} <span style="font-size:12px;color:#94a3b8">kPa</span></div>
            </div>
            <div style="flex:1;background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)">
              <div style="font-size:11px;color:#94a3b8">TEMP</div>
              <div style="font-weight:700;color:#67e8f9">${vitals.suit_temp_C.toFixed(1)} <span style="font-size:12px;color:#94a3b8">°C</span></div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="font-size:11px;color:#94a3b8">HEART RATE</div>
              <div style="font-weight:700;${getHrColor(vitals.hr_bpm)}">${vitals.hr_bpm} <span style="font-size:12px;color:#94a3b8">bpm</span></div>
            </div>
            <svg width="100%" height="36" viewBox="0 0 240 40" preserveAspectRatio="none">
              <polyline fill="none" stroke="#67e8f9" stroke-width="1.5" points="${vitals.hr_history.map((v,i)=> `${i*4},${40-((v-60)/120)*40}`).join(' ')}" />
            </svg>
          </div>
        </div>

        <div style="flex:1;display:flex;flex-direction:column;gap:10px">
          <div style="font-size:12px;color:#f59e0b;font-family:monospace;letter-spacing:1px">MARS WEATHER</div>

          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)">
              <div style="font-size:11px;color:#94a3b8">TEMP (AT)</div>
              <div style="color:#f59e0b">avg ${mars.AT.av.toFixed(1)}°C / min ${mars.AT.mn.toFixed(1)}°C / max ${mars.AT.mx.toFixed(1)}°C</div>
            </div>
            <div style="display:flex;gap:8px">
              <div style="flex:1;background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)">
                <div style="font-size:11px;color:#94a3b8">WIND (HWS)</div>
                <div style="color:#f59e0b">avg ${mars.HWS.av.toFixed(1)} m/s / max ${mars.HWS.mx.toFixed(1)} m/s</div>
              </div>
              <div style="width:110px;background:rgba(255,255,255,0.03);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);display:flex;flex-direction:column;align-items:center;justify-content:center">
                <div style="font-size:11px;color:#94a3b8">WIND DIR</div>
                <div style="color:#f59e0b;font-weight:700">${mars.WD.most_common.compass_point}</div>
                <div style="font-size:11px;color:#94a3b8">${mars.WD.most_common.compass_degrees}°</div>
              </div>
            </div>
            <div style="font-size:11px;color:#94a3b8;text-align:center">${formatTimeRange(mars.First_UTC, mars.Last_UTC)}</div>
          </div>
        </div>

        <div style="width:220px;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center">
          <div style="font-size:12px;color:#60a5fa;font-family:monospace;letter-spacing:1px">SUIT ENV</div>
          <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.03);width:100%">
            <div style="font-size:11px;color:#94a3b8">PRESSURE</div>
            <div style="font-weight:700;${getPressureColor(vitals.suit_pressure_kPa)}">${vitals.suit_pressure_kPa.toFixed(1)} <span style="font-size:12px;color:#94a3b8">kPa</span></div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.03);width:100%">
            <div style="font-size:11px;color:#94a3b8">TEMP</div>
            <div style="font-weight:700;color:#67e8f9">${vitals.suit_temp_C.toFixed(1)} <span style="font-size:12px;color:#94a3b8">°C</span></div>
          </div>

          <div style="margin-top:6px;text-align:center">
            <div style="font-size:11px;color:#94a3b8">THREAT</div>
            <div id="helmet-threat" style="margin-top:6px;padding:12px;border-radius:999px;background:${threat==='green'?'rgba(52,211,153,0.12)':threat==='yellow'?'rgba(251,191,36,0.12)':'rgba(248,113,113,0.12)'};color:${threat==='green'?'#34d399':threat==='yellow'?'#fbbf24':'#f87171'};font-weight:700;width:120px">${threat.toUpperCase()}</div>
          </div>
        </div>
      </div>
    `;
  }

  // periodic updates
  const interval = setInterval(()=>{
    // update vitals
    const newHr = Math.max(60, Math.min(180, vitals.hr_bpm + (Math.random()-0.5)*4));
    vitals.hr_bpm = Math.round(newHr);
    vitals.hr_history = [...vitals.hr_history.slice(1), vitals.hr_bpm];
    const tempDelta = Math.random()-0.5;
    vitals.suit_temp_C = parseFloat((vitals.suit_temp_C + tempDelta*0.3).toFixed(1));
    vitals.temp_trend = tempDelta > 0.1 ? 'up' : tempDelta < -0.1 ? 'down' : 'stable';
    vitals.o2_pct = Math.max(18, Math.min(22, vitals.o2_pct + (Math.random()-0.5)*0.4));
    vitals.suit_pressure_kPa = Math.max(20, Math.min(30, vitals.suit_pressure_kPa + (Math.random()-0.5)*0.6));

    // update mars
    mars.AT.av += (Math.random()-0.5)*2;
    mars.AT.mn += (Math.random()-0.5)*1;
    mars.AT.mx += (Math.random()-0.5)*1;
    mars.HWS.av = Math.max(0, mars.HWS.av + (Math.random()-0.5)*1.5);
    mars.HWS.mx = Math.max(0, mars.HWS.mx + (Math.random()-0.5)*2);

    if (Math.random() < 0.08) {
      const levels = ['green','yellow','red'];
      threat = levels[Math.floor(Math.random()*levels.length)];
    }

    render();
  }, 3500);

  // initial render
  render();

  // cleanup on unload
  window.addEventListener('beforeunload', ()=>{
    clearInterval(interval);
  });
}

export default { initHelmetHUDWidget };
