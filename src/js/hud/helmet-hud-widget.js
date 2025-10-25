// Copyright 2017 Google Inc.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
// limitations under the License.

// Simple DOM-based Helmet HUD widget (no React)
// Creates a centered overlay box that consolidates vitals, Mars weather and threat

export function initHelmetHUDWidget() {
  // Avoid creating twice
  if (document.getElementById('helmet-hud-widget')) return;

  const container = document.createElement('div');
  container.id = 'helmet-hud-widget';
  Object.assign(container.style, {
    position: 'fixed',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 'min(400px, 35vw)',
    maxWidth: '400px',
    height: 'min(80vh, 600px)',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '16px',
    boxShadow: '0 0 30px rgba(0,255,0,0.2), inset 0 0 20px rgba(0,255,0,0.05)',
    border: '1px solid rgba(0,255,0,0.2)',
    color: '#00ff00',
    zIndex: 9999,
    padding: '20px',
    fontFamily: 'Courier New, monospace',
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
  inner.style.display = 'flex';
  inner.style.flexDirection = 'column';
  inner.style.gap = '16px';

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
    if (value >= 21) return 'color:#00ff00';
    if (value >= 19) return 'color:#ffff00';
    return 'color:#ff0000';
  }
  function getHrColor(value){
    if (value <= 120) return 'color:#00ff00';
    if (value <= 160) return 'color:#ffff00';
    return 'color:#ff0000';
  }
  function getPressureColor(value){
    if (value >= 25) return 'color:#00ff00';
    if (value >= 20) return 'color:#ffff00';
    return 'color:#ff0000';
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
      <div style="display:flex;flex-direction:column;gap:20px;height:100%">
        
        <!-- VITALS SECTION -->
        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,0,0.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;color:#00ff00;font-weight:bold;margin-bottom:12px;text-shadow:0 0 10px rgba(0,255,0,0.5)">VITALS</div>
          
          <div style="display:flex;flex-direction:column;gap:12px">
            <!-- OXYGEN -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:12px;color:#00ff00">O₂ LEVEL</div>
              <div style="font-size:18px;font-weight:bold;${getO2Color(vitals.o2_pct)};text-shadow:0 0 8px currentColor">${vitals.o2_pct.toFixed(1)}%</div>
            </div>
            
            <!-- HEART RATE -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:12px;color:#00ff00">HEART RATE</div>
              <div style="font-size:18px;font-weight:bold;${getHrColor(vitals.hr_bpm)};text-shadow:0 0 8px currentColor">${vitals.hr_bpm} BPM</div>
            </div>
            
            <!-- PRESSURE -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:12px;color:#00ff00">PRESSURE</div>
              <div style="font-size:18px;font-weight:bold;${getPressureColor(vitals.suit_pressure_kPa)};text-shadow:0 0 8px currentColor">${vitals.suit_pressure_kPa.toFixed(1)} kPa</div>
            </div>
            
            <!-- TEMPERATURE -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:12px;color:#00ff00">TEMP</div>
              <div style="font-size:18px;font-weight:bold;color:#00ff00;text-shadow:0 0 8px rgba(0,255,0,0.5)">${vitals.suit_temp_C.toFixed(1)}°C</div>
            </div>
          </div>
        </div>

        <!-- MARS WEATHER SECTION -->
        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,0,0.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;color:#00ff00;font-weight:bold;margin-bottom:12px;text-shadow:0 0 10px rgba(0,255,0,0.5)">MARS WEATHER</div>
          
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between">
              <div style="font-size:11px;color:#00ff00">TEMP AVG</div>
              <div style="font-size:14px;color:#ffff00;text-shadow:0 0 6px rgba(255,255,0,0.5)">${mars.AT.av.toFixed(1)}°C</div>
            </div>
            <div style="display:flex;justify-content:space-between">
              <div style="font-size:11px;color:#00ff00">WIND AVG</div>
              <div style="font-size:14px;color:#ffff00;text-shadow:0 0 6px rgba(255,255,0,0.5)">${mars.HWS.av.toFixed(1)} m/s</div>
            </div>
            <div style="display:flex;justify-content:space-between">
              <div style="font-size:11px;color:#00ff00">WIND DIR</div>
              <div style="font-size:14px;color:#ffff00;text-shadow:0 0 6px rgba(255,255,0,0.5)">${mars.WD.most_common.compass_point}</div>
            </div>
          </div>
        </div>

        <!-- THREAT STATUS -->
        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,0,0.2);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:14px;color:#00ff00;font-weight:bold;margin-bottom:8px;text-shadow:0 0 10px rgba(0,255,0,0.5)">THREAT LEVEL</div>
          <div id="helmet-threat" style="font-size:20px;font-weight:bold;padding:12px;border-radius:8px;background:${threat==='green'?'rgba(0,255,0,0.2)':threat==='yellow'?'rgba(255,255,0,0.2)':'rgba(255,0,0,0.2)'};color:${threat==='green'?'#00ff00':threat==='yellow'?'#ffff00':'#ff0000'};text-shadow:0 0 12px currentColor;border:2px solid ${threat==='green'?'rgba(0,255,0,0.5)':threat==='yellow'?'rgba(255,255,0,0.5)':'rgba(255,0,0,0.5)'}">${threat.toUpperCase()}</div>
        </div>

        <!-- STATUS INDICATORS -->
        <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,0,0.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;color:#00ff00;font-weight:bold;margin-bottom:12px;text-shadow:0 0 10px rgba(0,255,0,0.5)">STATUS</div>
          
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between">
              <div style="font-size:11px;color:#00ff00">O₂ STATUS</div>
              <div style="font-size:12px;color:#00ff00;text-shadow:0 0 6px rgba(0,255,0,0.5)">${vitals.o2_pct >=21 ? 'NOMINAL' : vitals.o2_pct >=19 ? 'CAUTION' : 'CRITICAL'}</div>
            </div>
            <div style="display:flex;justify-content:space-between">
              <div style="font-size:11px;color:#00ff00">TEMP TREND</div>
              <div style="font-size:12px;color:#00ff00;text-shadow:0 0 6px rgba(0,255,0,0.5)">${vitals.temp_trend.toUpperCase()}</div>
            </div>
          </div>
        </div>
        
      </div>
    `;
  }

  // Export function to get current dashboard data
  window.getHelmetHUDData = function() {
    return {
      vitals: {
        o2_pct: vitals.o2_pct,
        hr_bpm: vitals.hr_bpm,
        suit_pressure_kPa: vitals.suit_pressure_kPa,
        suit_temp_C: vitals.suit_temp_C,
        temp_trend: vitals.temp_trend,
        o2_status: vitals.o2_pct >= 21 ? 'NOMINAL' : vitals.o2_pct >= 19 ? 'CAUTION' : 'CRITICAL',
        hr_status: vitals.hr_bpm <= 120 ? 'NOMINAL' : vitals.hr_bpm <= 160 ? 'CAUTION' : 'CRITICAL',
        pressure_status: vitals.suit_pressure_kPa >= 25 ? 'NOMINAL' : vitals.suit_pressure_kPa >= 20 ? 'CAUTION' : 'CRITICAL'
      },
      mars_weather: {
        temperature_avg: mars.AT.av,
        temperature_min: mars.AT.mn,
        temperature_max: mars.AT.mx,
        wind_avg: mars.HWS.av,
        wind_max: mars.HWS.mx,
        wind_direction: mars.WD.most_common.compass_point,
        wind_degrees: mars.WD.most_common.compass_degrees,
        pressure_avg: mars.PRE.av,
        data_time_range: formatTimeRange(mars.First_UTC, mars.Last_UTC)
      },
      threat_level: threat
    };
  };

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
