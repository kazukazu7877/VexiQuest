import React, { useRef, useEffect } from 'react';
import { geoOrthographic, geoPath, geoGraticule, geoInterpolate, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/land-110m.json';

interface InteractiveGlobeProps {
  size?: number;
  className?: string;
}

// Extract land features once for optimal performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const landFeature = feature(worldData as any, (worldData as any).objects.land);
const graticuleGenerator = geoGraticule().step([30, 30]);
const graticuleData = graticuleGenerator();

// Subtle pixel stars in the cosmos surrounding Earth
const STAR_OFFSETS: Array<{ x: number; y: number; s: number; color: string; alpha: number }> = [
  { x: 0.08, y: 0.15, s: 2, color: '#93C5FD', alpha: 0.55 },
  { x: 0.18, y: 0.08, s: 1.5, color: '#FCD34D', alpha: 0.45 },
  { x: 0.88, y: 0.12, s: 2, color: '#BAE6FD', alpha: 0.65 },
  { x: 0.94, y: 0.25, s: 1, color: '#FFFFFF', alpha: 0.4 },
  { x: 0.06, y: 0.82, s: 1.5, color: '#6EE7B7', alpha: 0.45 },
  { x: 0.14, y: 0.90, s: 2, color: '#93C5FD', alpha: 0.55 },
  { x: 0.86, y: 0.80, s: 1.5, color: '#FCD34D', alpha: 0.45 },
  { x: 0.92, y: 0.88, s: 2, color: '#FFFFFF', alpha: 0.55 },
  { x: 0.50, y: 0.03, s: 1, color: '#E0F2FE', alpha: 0.45 },
];

// Great-circle exploration travel routes [start [lon, lat], end [lon, lat]]
const EXPLORATION_ROUTES: Array<[[number, number], [number, number]]> = [
  [[-9.1, 38.7], [-43.2, -22.9]], // Lisbon to Rio de Janeiro (Transatlantic Voyage)
  [[31.2, 30.0], [72.8, 19.0]],   // Cairo to Mumbai (Silk / Spice Route)
  [[-0.1, 51.5], [139.7, 35.7]],  // London to Tokyo (Trans-Eurasian Expedition)
  [[151.2, -33.8], [-122.4, 37.8]] // Sydney to San Francisco (Pacific Crossing)
];

// Curated exploration hubs & geographical lights across continents [lon, lat]
const GEOGRAPHIC_HUBS: [number, number][] = [
  [-0.12, 51.5],   // London
  [2.35, 48.85],   // Paris
  [31.23, 30.04],  // Cairo
  [36.82, -1.29],  // Nairobi
  [18.42, -33.92], // Cape Town
  [72.87, 19.07],  // Mumbai
  [139.69, 35.68], // Tokyo
  [103.82, 1.35],  // Singapore
  [151.21, -33.87],// Sydney
  [-43.17, -22.9], // Rio de Janeiro
  [-58.38, -34.6], // Buenos Aires
  [-74.0, 40.71],  // New York
  [-122.42, 37.77],// San Francisco
  [-21.94, 64.14], // Reykjavik
  [-157.85, 21.3], // Honolulu
];

// Pre-compute interpolated route points for smooth curved rendering
const ROUTE_LINESTRINGS = EXPLORATION_ROUTES.map(([start, end]) => {
  const interpolator = geoInterpolate(start, end);
  const steps = 24;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    coords.push(interpolator(i / steps));
  }
  return {
    start,
    end,
    lineString: {
      type: 'LineString' as const,
      coordinates: coords
    }
  };
});

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ size = 180, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Spherical angles in degrees [longitude (lambda), latitude (phi), roll (gamma)]
    let rotLambda = -25; // Centered on Atlantic / Europe / Africa initially
    let rotPhi = -12;    // Natural 12° northern tilt
    let targetLambda = -25;
    let targetPhi = -12;
    let orbitAngle = 0;  // Orbital survey satellite angle

    // Retina DPR scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size * 0.5;
    const cy = size * 0.5;
    // Earth sphere radius
    const earthRadius = size * 0.38;

    // D3 Orthographic Projection
    const projection = geoOrthographic()
      .scale(earthRadius)
      .translate([cx, cy])
      .clipAngle(90)
      .precision(0.35);

    const path = geoPath(projection, ctx);

    // Pointer event handlers for subtle rotation interaction
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetLambda += dx * 0.6;
      targetPhi = Math.max(-60, Math.min(60, targetPhi - dy * 0.4));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetLambda += dx * 0.6;
      targetPhi = Math.max(-60, Math.min(60, targetPhi - dy * 0.4));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onMouseUp);
    }

    const render = () => {
      if (!prefersReducedMotion) {
        if (!isDragging) {
          // Gentle idle rotation around polar axis
          targetLambda += 0.24;
          targetPhi += (-12 - targetPhi) * 0.02;
        }

        rotLambda += (targetLambda - rotLambda) * 0.12;
        rotPhi += (targetPhi - rotPhi) * 0.12;
        orbitAngle += 0.012; // Slow orbit marker progression
      }

      ctx.clearRect(0, 0, size, size);

      // ==========================================
      // 1. Subtle Retro Pixel Stars in Space
      // ==========================================
      STAR_OFFSETS.forEach((st) => {
        const sx = st.x * size;
        const sy = st.y * size;
        ctx.fillStyle = st.color;
        ctx.globalAlpha = st.alpha;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), st.s, st.s);
      });
      ctx.globalAlpha = 1.0;

      // ==========================================
      // 2. Vintage Travel Cartographic Outer Crosshairs & Annotations
      // ==========================================
      ctx.save();
      ctx.strokeStyle = 'rgba(82, 116, 106, 0.35)';
      ctx.lineWidth = 1;

      // Quadrant corner registration marks (+)
      const tickDist = earthRadius * 1.25;
      const tickLen = 4;
      // Top, Bottom, Left, Right
      [
        [cx, cy - tickDist],
        [cx, cy + tickDist],
        [cx - tickDist, cy],
        [cx + tickDist, cy]
      ].forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx - tickLen, ty);
        ctx.lineTo(tx + tickLen, ty);
        ctx.moveTo(tx, ty - tickLen);
        ctx.lineTo(tx, ty + tickLen);
        ctx.stroke();
      });

      // Faint outer orbital expedition track ring
      ctx.beginPath();
      ctx.setLineDash([2, 6]);
      ctx.arc(cx, cy, earthRadius * 1.22, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(82, 116, 106, 0.22)';
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Tiny golden satellite / surveyor diamond along the orbit ring
      const satX = cx + Math.cos(orbitAngle) * (earthRadius * 1.22);
      const satY = cy + Math.sin(orbitAngle) * (earthRadius * 1.22);
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.moveTo(satX, satY - 2.5);
      ctx.lineTo(satX + 2.5, satY);
      ctx.moveTo(satX, satY + 2.5);
      ctx.lineTo(satX - 2.5, satY);
      ctx.fill();

      ctx.restore();

      // ==========================================
      // 3. Cyan-Blue Atmospheric Rim Glow (No stand, no pedestal)
      // ==========================================
      ctx.save();
      const atmosphereGrad = ctx.createRadialGradient(
        cx,
        cy,
        earthRadius * 0.94,
        cx,
        cy,
        earthRadius * 1.15
      );
      atmosphereGrad.addColorStop(0, 'rgba(56, 189, 248, 0.42)'); // Bright soft cyan-blue rim
      atmosphereGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.20)');
      atmosphereGrad.addColorStop(0.75, 'rgba(3, 105, 161, 0.06)');
      atmosphereGrad.addColorStop(1, 'rgba(2, 44, 34, 0)');

      ctx.fillStyle = atmosphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius * 1.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 4. Earth Sphere — Rich Blue Ocean Gradient
      // ==========================================
      ctx.save();
      const oceanGrad = ctx.createRadialGradient(
        cx - earthRadius * 0.32,
        cy - earthRadius * 0.35,
        earthRadius * 0.1,
        cx,
        cy,
        earthRadius
      );
      oceanGrad.addColorStop(0, '#2563EB');    // Sunlit bright ocean blue
      oceanGrad.addColorStop(0.35, '#1D4ED8'); // Rich royal ocean blue
      oceanGrad.addColorStop(0.70, '#1E3A8A'); // Deep navy blue
      oceanGrad.addColorStop(0.92, '#0F172A'); // Edge limb depth
      oceanGrad.addColorStop(1, '#070D18');    // Deep space horizon rim

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Delicate outer atmospheric line
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Clip inside the Earth sphere
      ctx.clip();

      // ==========================================
      // 5. Update Projection & Draw Graticule
      // ==========================================
      projection.rotate([rotLambda, rotPhi, 0]);

      // Subtle longitude & latitude lines
      ctx.beginPath();
      path(graticuleData);
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.14)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Equator Line (subtle cyan guide)
      ctx.beginPath();
      path({
        type: 'LineString',
        coordinates: Array.from({ length: 73 }, (_, i) => [i * 5 - 180, 0])
      });
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ==========================================
      // 6. Continents: Beautiful Green Landmasses (Forest & Leaf Green)
      // ==========================================
      ctx.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path(landFeature as any);
      ctx.fillStyle = '#22C55E'; // Vibrant retro arcade continent green
      ctx.fill();

      // Continental coastline accent
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Second subtle land highlight layer for depth
      ctx.save();
      ctx.clip();
      const landHighlightGrad = ctx.createLinearGradient(
        cx - earthRadius,
        cy - earthRadius,
        cx + earthRadius,
        cy + earthRadius
      );
      landHighlightGrad.addColorStop(0, 'rgba(134, 239, 172, 0.35)'); // Sunlight leaf green highlight
      landHighlightGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
      landHighlightGrad.addColorStop(1, 'rgba(20, 83, 45, 0.45)');   // Dark forest shadow
      ctx.fillStyle = landHighlightGrad;
      ctx.fillRect(cx - earthRadius, cy - earthRadius, earthRadius * 2, earthRadius * 2);
      ctx.restore();

      // View center on sphere facing camera [lon, lat]
      const viewCenter: [number, number] = [-rotLambda, -rotPhi];
      const maxVisibleAngle = Math.PI / 2 - 0.05; // 87.1°: strict occlusion threshold before limb horizon

      // ==========================================
      // 7. Subtle Geographical Travel Routes & Exploration Waypoints (Front-Hemisphere Only)
      // ==========================================
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.42)'; // Warm golden exploration dashed lines
      ctx.lineWidth = 1.1;

      ROUTE_LINESTRINGS.forEach((route) => {
        ctx.beginPath();
        path(route.lineString);
        ctx.stroke();

        // Render visible waypoints (strictly front-facing only!)
        [route.start, route.end].forEach((pt) => {
          const angDist = geoDistance(pt, viewCenter);
          if (angDist < maxVisibleAngle) {
            const ptProjected = projection(pt);
            if (ptProjected) {
              const [px, py] = ptProjected;
              const dist = Math.hypot(px - cx, py - cy);
              if (dist < earthRadius * 0.96) {
                // Smooth atmospheric edge attenuation near limb
                const fade = Math.min(1, Math.max(0, (maxVisibleAngle - angDist) / 0.20));
                ctx.fillStyle = `rgba(253, 230, 138, ${fade * 0.95})`;
                ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, 2.5, 2.5);
              }
            }
          }
        });
      });

      // Render visible exploration hub city lights (strictly front-facing only!)
      GEOGRAPHIC_HUBS.forEach((pt) => {
        const angDist = geoDistance(pt, viewCenter);
        if (angDist < maxVisibleAngle) {
          const ptProjected = projection(pt);
          if (ptProjected) {
            const [px, py] = ptProjected;
            const dist = Math.hypot(px - cx, py - cy);
            if (dist < earthRadius * 0.96) {
              const fade = Math.min(1, Math.max(0, (maxVisibleAngle - angDist) / 0.22));
              ctx.fillStyle = `rgba(254, 243, 199, ${fade * 0.85})`;
              ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, 2, 2);
            }
          }
        }
      });
      ctx.restore();

      // ==========================================
      // 8. Spherical 3D Lighting & Specular Arc
      // ==========================================
      const sphereShading = ctx.createRadialGradient(
        cx - earthRadius * 0.38,
        cy - earthRadius * 0.38,
        earthRadius * 0.2,
        cx,
        cy,
        earthRadius
      );
      sphereShading.addColorStop(0, 'rgba(255, 255, 255, 0.22)'); // Crisp sunlight specular reflection
      sphereShading.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
      sphereShading.addColorStop(0.82, 'rgba(3, 7, 18, 0.25)');
      sphereShading.addColorStop(1, 'rgba(3, 7, 18, 0.75)');     // Curved limb darkening in space

      ctx.fillStyle = sphereShading;
      ctx.beginPath();
      ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // 9. Ordered 2px Retro Scanline / Pixel Texture
      // ==========================================
      ctx.fillStyle = 'rgba(7, 13, 24, 0.10)';
      for (let y = cy - earthRadius; y <= cy + earthRadius; y += 3) {
        ctx.fillRect(cx - earthRadius, y, earthRadius * 2, 1);
      }

      ctx.restore(); // remove sphere clip

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('touchstart', onTouchStart);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`interactive-globe-container ${className}`}
      style={{ width: size, height: size, cursor: 'grab' }}
      role="img"
      aria-label="Rotating pixel-art planet Earth with blue oceans, green continents, and subtle geographical travel routes"
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      <span className="globe-expedition-badge">EXPEDITION 195</span>
    </div>
  );
};
