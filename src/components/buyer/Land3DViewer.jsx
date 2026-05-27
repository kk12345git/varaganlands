import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Land3DViewer({ listing }) {
  const canvasRef = useRef(null);
  const { t } = useTranslation();
  
  // Orbit controls states
  const [rotationX, setRotationX] = useState(0.5); // Tilt angle
  const [rotationY, setRotationY] = useState(0.7); // Yaw angle
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Map settings
  const {
    land_type = 'agricultural',
    road_access = false,
    water_source = '',
    electricity = false,
    patta_available = false,
    area_value = 0,
    area_unit = 'cent',
    survey_number = ''
  } = listing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Center coordinates
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 30;
      
      // 3D Projection functions (Isometric / Orthographic)
      const project = (x, y, z) => {
        // Rotate around Y-axis (Yaw)
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;
        
        // Rotate around X-axis (Pitch / Tilt)
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const ry = y * cosX - rz * sinX;
        const depth = y * sinX + rz * cosX;
        
        // Final screen projection
        const scale = 160 * zoom;
        return {
          x: cx + rx * scale,
          y: cy - ry * scale,
          depth: depth
        };
      };

      // Draw Grid / Soil Block
      // We will draw a rectangular box with dimensions based on area_value
      const sizeX = 1.2;
      const sizeZ = 0.8;
      const height = 0.15; // Thickness of the land block
      
      // Define corners of the 3D block
      // Top face vertices
      const v0 = project(-sizeX/2, height, -sizeZ/2);
      const v1 = project(sizeX/2, height, -sizeZ/2);
      const v2 = project(sizeX/2, height, sizeZ/2);
      const v3 = project(-sizeX/2, height, sizeZ/2);
      
      // Bottom face vertices
      const v0b = project(-sizeX/2, 0, -sizeZ/2);
      const v1b = project(sizeX/2, 0, -sizeZ/2);
      const v2b = project(sizeX/2, 0, sizeZ/2);
      const v3b = project(-sizeX/2, 0, sizeZ/2);

      // Determine face draw order based on angle (simplistic depth sorting)
      // Bottom/sides first, top face last
      
      // Side: Left
      ctx.fillStyle = '#654321'; // Dark brown soil
      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v3.x, v3.y);
      ctx.lineTo(v3b.x, v3b.y);
      ctx.lineTo(v0b.x, v0b.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4a2f15';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Side: Front
      ctx.fillStyle = '#5c3a1a'; // Darker soil
      ctx.beginPath();
      ctx.moveTo(v3.x, v3.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.lineTo(v2b.x, v2b.y);
      ctx.lineTo(v3b.x, v3b.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side: Right
      ctx.fillStyle = '#4d3016';
      ctx.beginPath();
      ctx.moveTo(v2.x, v2.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v1b.x, v1b.y);
      ctx.lineTo(v2b.x, v2b.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top Face - Soil color depending on land type
      let topColor = '#8FBC8F'; // Default agricultural green (Forest Green)
      if (land_type === 'agricultural' || land_type === 'plantation') {
        topColor = '#4e8c56'; // Green
      } else if (land_type === 'residential' || land_type === 'plot') {
        topColor = '#c2a678'; // Brownish/Sandy plot
      } else if (land_type === 'commercial' || land_type === 'industrial') {
        topColor = '#708090'; // Asphalt slate gray
      }
      
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.lineTo(v3.x, v3.y);
      ctx.closePath();
      ctx.fill();
      
      // Draw grid lines on top face for grid effect
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      const gridCount = 4;
      for (let i = 1; i < gridCount; i++) {
        const ratio = i / gridCount;
        // Lines parallel to X-axis
        const p1 = project(-sizeX/2, height, -sizeZ/2 + sizeZ * ratio);
        const p2 = project(sizeX/2, height, -sizeZ/2 + sizeZ * ratio);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        
        // Lines parallel to Z-axis
        const p3 = project(-sizeX/2 + sizeX * ratio, height, -sizeZ/2);
        const p4 = project(-sizeX/2 + sizeX * ratio, height, sizeZ/2);
        ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
      }
      
      // Highlights/Outline
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.lineTo(v3.x, v3.y);
      ctx.closePath();
      ctx.stroke();

      // Draw Road if road_access is true
      // We place the road along the front edge (Z = sizeZ/2 + 0.1)
      if (road_access) {
        const roadWidth = 0.2;
        const rv0 = project(-sizeX/2, height, sizeZ/2);
        const rv1 = project(sizeX/2, height, sizeZ/2);
        const rv2 = project(sizeX/2, height, sizeZ/2 + roadWidth);
        const rv3 = project(-sizeX/2, height, sizeZ/2 + roadWidth);
        
        // Draw Road surface
        ctx.fillStyle = '#3a3a3a'; // Dark asphalt
        ctx.beginPath();
        ctx.moveTo(rv0.x, rv0.y);
        ctx.lineTo(rv1.x, rv1.y);
        ctx.lineTo(rv2.x, rv2.y);
        ctx.lineTo(rv3.x, rv3.y);
        ctx.closePath();
        ctx.fill();

        // Draw Road dashed center line
        ctx.strokeStyle = '#ffd700'; // Yellow line
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        const rLineStart = project(-sizeX/2, height, sizeZ/2 + roadWidth/2);
        const rLineEnd = project(sizeX/2, height, sizeZ/2 + roadWidth/2);
        ctx.beginPath();
        ctx.moveTo(rLineStart.x, rLineStart.y);
        ctx.lineTo(rLineEnd.x, rLineEnd.y);
        ctx.stroke();
        ctx.setLineDash([]); // Reset
        
        // Draw side stones
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rv0.x, rv0.y);
        ctx.lineTo(rv1.x, rv1.y);
        ctx.stroke();
      }

      // Draw Water Source
      // A small circular pond in the middle or corner
      if (water_source && water_source !== 'None') {
        const pondCx = -sizeX / 4;
        const pondCz = -sizeZ / 4;
        const radius = 0.18;
        
        ctx.fillStyle = '#4fa9ff'; // Nice blue
        ctx.strokeStyle = '#2277cc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Draw circular shape using isometric projection
        const steps = 16;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const px = pondCx + Math.cos(angle) * radius;
          const pz = pondCz + Math.sin(angle) * radius;
          const proj = project(px, height + 0.005, pz);
          if (i === 0) ctx.moveTo(proj.x, proj.y);
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw dynamic water ripple reflection
        const rProj = project(pondCx + 0.05, height + 0.006, pondCz + 0.05);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(rProj.x, rProj.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw EB / Electricity Pole
      if (electricity) {
        // Position of electricity poles along the road
        const poleZ = sizeZ/2 + 0.05;
        const poleHeight = 0.45;
        const polesX = [-sizeX/3, sizeX/3];
        
        polesX.forEach((px) => {
          const base = project(px, height, poleZ);
          const top = project(px, height + poleHeight, poleZ);
          const crossLeft = project(px - 0.08, height + poleHeight - 0.05, poleZ);
          const crossRight = project(px + 0.08, height + poleHeight - 0.05, poleZ);

          // Pole structure
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.stroke();

          // Crossbar
          ctx.strokeStyle = '#8b5a2b'; // Wood crossbar
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(crossLeft.x, crossLeft.y);
          ctx.lineTo(crossRight.x, crossRight.y);
          ctx.stroke();

          // Small insulator caps
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(crossLeft.x, crossLeft.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(crossRight.x, crossRight.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
        });

        // Wire connecting the poles
        if (polesX.length > 1) {
          const top1 = project(polesX[0], height + poleHeight - 0.05, poleZ);
          const top2 = project(polesX[1], height + poleHeight - 0.05, poleZ);
          
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(top1.x, top1.y);
          // Curve representing sag
          const midX = (top1.x + top2.x) / 2;
          const midY = (top1.y + top2.y) / 2 + 10;
          ctx.quadraticCurveTo(midX, midY, top2.x, top2.y);
          ctx.stroke();
        }
      }

      // Draw Floating "Verified Patta" Label billboard
      if (patta_available) {
        const floatY = height + 0.15;
        const pLoc = project(0.2, floatY, 0.1);
        
        ctx.fillStyle = 'rgba(34, 139, 34, 0.9)'; // Forest green pill
        ctx.beginPath();
        ctx.roundRect(pLoc.x - 45, pLoc.y - 12, 90, 24, 12);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📄 Verified Patta', pLoc.x, pLoc.y + 3);
      }

      // Render Plot Text/Info floating above the center
      const cLoc = project(0, height + 0.02, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      
      const detailsText = `${area_value} ${area_unit}`;
      ctx.fillText(detailsText, cLoc.x, cLoc.y - 10);
      
      if (survey_number) {
        ctx.font = 'italic 8px sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(`Survey: ${survey_number}`, cLoc.x, cLoc.y);
      }

      ctx.restore();
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [rotationX, rotationY, zoom, listing]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    setRotationY(y => y + dx * 0.007);
    setRotationX(x => Math.max(0.1, Math.min(Math.PI / 2.1, x + dy * 0.007))); // Limit vertical tilt
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom helpers
  const zoomIn = () => setZoom(z => Math.min(1.8, z + 0.15));
  const zoomOut = () => setZoom(z => Math.max(0.6, z - 0.15));

  return (
    <div className="card p-4 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-[380px] rounded-2xl border border-slate-700/50">
      
      {/* Dynamic Header */}
      <div className="absolute top-4 left-4 z-10 font-display">
        <h4 className="text-xs uppercase tracking-wider text-forest-400 font-bold">{t('interactive_view') || 'Interactive View'}</h4>
        <h3 className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
          🌐 3D Plot Visualizer
        </h3>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-1.5">
        <button onClick={zoomIn} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center font-bold text-sm transition">
          ＋
        </button>
        <button onClick={zoomOut} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center font-bold text-sm transition">
          －
        </button>
      </div>

      {/* Main Canvas for rendering */}
      <canvas
        ref={canvasRef}
        width={480}
        height={320}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-grab active:cursor-grabbing w-full max-w-[480px] h-[320px] drop-shadow-2xl"
      />

      {/* Footer controls overlay */}
      <div className="text-center mt-2 z-10">
        <p className="text-xs text-slate-400 font-body">
          🖱️ {t('drag_to_rotate') || 'Thiruppi pakka drag pannunga, zoom panna scroll pannunga'}
        </p>
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          {road_access && <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium">🛣️ Tar Road</span>}
          {electricity && <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium">⚡ EB Line</span>}
          {water_source && water_source !== 'None' && <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium">💧 {water_source}</span>}
          {patta_available && <span className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium">📄 Patta</span>}
        </div>
      </div>
      
    </div>
  );
}
