import React, { useRef, useEffect } from 'react';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/land-110m.json';

interface InteractiveGlobeProps {
  size?: number;
  className?: string;
}

// Extract land features once for performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const landFeature = feature(worldData as any, (worldData as any).objects.land);
const graticuleGenerator = geoGraticule().step([20, 20]);
const graticuleData = graticuleGenerator();

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
    let isHovered = false;
    let pointerX = 0;
    let pointerY = 0;

    // Spherical angles in degrees [longitude (lambda), latitude (phi), roll (gamma)]
    let rotLambda = -20; // Start centered on Atlantic / Europe / Africa
    let rotPhi = -15;    // Slight natural downward tilt showing northern hemisphere
    let targetLambda = -20;
    let targetPhi = -15;

    // Retina DPR scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Geometrical proportions - centered in the arcade bezel dial
    const cx = size * 0.5;
    const cy = size * 0.5;
    const globeRadius = size * 0.38;
    const bezelRadius = size * 0.46;

    // D3 Orthographic Projection
    const projection = geoOrthographic()
      .scale(globeRadius)
      .translate([cx, cy])
      .clipAngle(90)
      .precision(0.3);

    const path = geoPath(projection, ctx);

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;
      pointerX = normX;
      pointerY = normY;
      isHovered = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerLeave = () => {
      isHovered = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('mouseleave', handlePointerLeave);
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      container.addEventListener('touchend', handlePointerLeave);
    }

    const render = () => {
      if (!prefersReducedMotion) {
        if (isHovered) {
          // Responsive fluid spin & tilt following cursor/finger
          targetLambda += pointerX * 2.2;
          targetPhi = -15 - pointerY * 35; // Constrain vertical tilt to realistic ±35°
        } else {
          // Gentle idle rotation around polar axis
          targetLambda += 0.24;
          targetPhi += (-15 - targetPhi) * 0.04;
        }

        // Smooth inertia interpolation
        rotLambda += (targetLambda - rotLambda) * 0.08;
        rotPhi += (targetPhi - rotPhi) * 0.08;
      }

      ctx.clearRect(0, 0, size, size);

      // ==========================================
      // 1. Arcade Radar Bezel / Explorer Compass Ring
      // ==========================================
      ctx.save();
      // Outer dark cabinet ring
      ctx.beginPath();
      ctx.arc(cx, cy, bezelRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#162829';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#284B45';
      ctx.stroke();

      // Inset bezel channel
      ctx.beginPath();
      ctx.arc(cx, cy, bezelRadius - 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#0F1C1D';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radar tick marks (every 30 degrees)
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const outerR = bezelRadius - 5;
        const innerR = isCardinal ? outerR - 6 : outerR - 3.5;
        const x1 = cx + Math.cos(rad) * innerR;
        const y1 = cy + Math.sin(rad) * innerR;
        const x2 = cx + Math.cos(rad) * outerR;
        const y2 = cy + Math.sin(rad) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isCardinal ? '#B9823E' : '#52746A';
        ctx.lineWidth = isCardinal ? 1.5 : 1;
        ctx.stroke();
      }

      // Cardinal direction letters (N, S, E, W)
      ctx.font = 'bold 9px "VT323", monospace';
      ctx.fillStyle = '#DCA252';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', cx, cy - bezelRadius + 8);
      ctx.fillText('S', cx, cy + bezelRadius - 8);
      ctx.fillText('E', cx + bezelRadius - 8, cy);
      ctx.fillText('W', cx - bezelRadius + 8, cy);
      ctx.restore();

      // ==========================================
      // 2. Globe Sphere — Dark Arcade Ocean Gradient
      // ==========================================
      ctx.save();
      const oceanGrad = ctx.createRadialGradient(
        cx - globeRadius * 0.3,
        cy - globeRadius * 0.3,
        globeRadius * 0.1,
        cx,
        cy,
        globeRadius
      );
      // Dark deep arcade teal to arcade black ocean
      oceanGrad.addColorStop(0, '#244544');   // Illuminated deep arcade teal center
      oceanGrad.addColorStop(0.55, '#1C3435'); // Deep arcade teal core
      oceanGrad.addColorStop(0.85, '#152528'); // Deep tone
      oceanGrad.addColorStop(1, '#0E1719');    // Arcade black rim

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dark bezel border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#284B45';
      ctx.stroke();

      // Clip strictly inside the sphere
      ctx.clip();

      // ==========================================
      // 3. Update Projection Angles
      // ==========================================
      projection.rotate([rotLambda, rotPhi, 0]);

      // ==========================================
      // 4. Cartographic Graticule Grid
      // ==========================================
      ctx.beginPath();
      path(graticuleData);
      ctx.strokeStyle = 'rgba(82, 116, 106, 0.45)'; // Muted sea green graticule
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // Equator Line with Retro Amber Accent
      ctx.beginPath();
      path({
        type: 'LineString',
        coordinates: Array.from({ length: 73 }, (_, i) => [i * 5 - 180, 0])
      });
      ctx.strokeStyle = 'rgba(185, 130, 62, 0.65)'; // Retro amber equator
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Prime Meridian with subtle Amber Accent
      ctx.beginPath();
      path({
        type: 'LineString',
        coordinates: Array.from({ length: 37 }, (_, i) => [0, i * 5 - 90])
      });
      ctx.strokeStyle = 'rgba(185, 130, 62, 0.45)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // ==========================================
      // 5. Accurate Natural Earth Landmasses (Weathered Parchment with Dark Ink)
      // ==========================================
      ctx.beginPath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path(landFeature as any);
      ctx.fillStyle = '#C5AE80'; // Weathered parchment landmasses
      ctx.fill();

      // Dark map ink coastline border
      ctx.strokeStyle = '#443A2E';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // ==========================================
      // 6. Spherical 3D Lighting & Specular Arc
      // ==========================================
      const sphereShading = ctx.createRadialGradient(
        cx - globeRadius * 0.35,
        cy - globeRadius * 0.35,
        globeRadius * 0.3,
        cx,
        cy,
        globeRadius
      );
      sphereShading.addColorStop(0, 'rgba(232, 221, 189, 0.16)'); // Subtle warm specular
      sphereShading.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
      sphereShading.addColorStop(1, 'rgba(10, 15, 18, 0.55)');   // Dark arcade limb darkening

      ctx.fillStyle = sphereShading;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle CRT scanline overlay across the globe
      ctx.fillStyle = 'rgba(18, 25, 29, 0.12)';
      for (let y = cy - globeRadius; y <= cy + globeRadius; y += 3) {
        ctx.fillRect(cx - globeRadius, y, globeRadius * 2, 1);
      }

      ctx.restore(); // remove globe clipping

      // Outer bezel highlight ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius + 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(185, 130, 62, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', handlePointerLeave);
      }
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`interactive-globe-container ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Interactive retro arcade cartographic globe with accurate Natural Earth landmasses"
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
};
