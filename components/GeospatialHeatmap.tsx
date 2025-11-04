import React, { useState, useRef, useEffect, WheelEvent, MouseEvent } from 'react';
import { CriticalArea } from '../types';

interface GeospatialHeatmapProps {
  criticalAreas: CriticalArea[];
  selectedLocation: CriticalArea | null;
  onAreaClick: (area: CriticalArea) => void;
}

const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return (hash & 0x7fffffff) / 0x7fffffff;
};

const stringToCoords = (location: string): { x: number; y: number } => {
  const hashX = simpleHash(location);
  const hashY = simpleHash(location.split('').reverse().join(''));
  const padding = 15;
  return {
    x: padding + hashX * (100 - 2 * padding),
    y: padding + hashY * (100 - 2 * padding),
  };
};

const getHeatmapStyle = (severity: number): { color: string; radius: number; animationDuration: string } => {
    const normalizedSeverity = severity / 100;
    const hue = (1 - normalizedSeverity) * 60;
    const color = `hsl(${hue}, 100%, 50%)`;
    const radius = 8 + normalizedSeverity * 12;
    const animationDuration = `${2 + (1 - normalizedSeverity) * 3}s`; // Faster pulse for higher severity
    return { color, radius, animationDuration };
};

const GeospatialHeatmap: React.FC<GeospatialHeatmapProps> = ({ criticalAreas = [], selectedLocation, onAreaClick }) => {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGCircleElement>, area: CriticalArea) => {
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (svgRect) {
      setTooltip({
        content: `<strong>${area.location}</strong><br/>Issue: ${area.predictedIssue}<br/>Severity: ${area.severityScore}`,
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
      });
    }
  };

  const handleMouseLeave = () => setTooltip(null);
  
  const handleZoom = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1; // Zoom in or out
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newWidth = viewBox.width * zoomFactor;
    const newHeight = viewBox.height * zoomFactor;

    // Center zoom on mouse pointer
    const newX = viewBox.x + (mouseX / rect.width) * (viewBox.width - newWidth);
    const newY = viewBox.y + (mouseY / rect.height) * (viewBox.height - newHeight);

    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  };
  
  const handlePanStart = (e: MouseEvent<SVGSVGElement>) => {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanMove = (e: MouseEvent<SVGSVGElement>) => {
      if (!isPanning || !svgRef.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;

      const panFactorX = viewBox.width / svgWidth;
      const panFactorY = viewBox.height / svgHeight;

      setViewBox(prev => ({ ...prev, x: prev.x - dx * panFactorX, y: prev.y - dy * panFactorY }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanEnd = () => setIsPanning(false);

  const handleZoomButtonClick = (factor: number) => {
    const newWidth = viewBox.width * factor;
    const newHeight = viewBox.height * factor;
    const newX = viewBox.x + (viewBox.width - newWidth) / 2;
    const newY = viewBox.y + (viewBox.height - newHeight) / 2;
    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const mappedAreas = criticalAreas.map((area, index) => ({
    ...area,
    ...stringToCoords(area.location),
    style: getHeatmapStyle(area.severityScore),
    id: `area-${index}`
  }));
  
  const isSelected = (area: typeof mappedAreas[0]) => selectedLocation?.location === area.location;

  return (
    <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-inner">
      <svg ref={svgRef} width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} preserveAspectRatio="xMidYMid meet"
        onWheel={handleZoom} onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <defs>
            <filter id="heatmap-blur"><feGaussianBlur in="SourceGraphic" stdDeviation="2" /></filter>
            {mappedAreas.map(area => (
                <radialGradient key={area.id} id={`grad-${area.id}`}>
                    <stop offset="0%" stopColor={area.style.color} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={area.style.color} stopOpacity="0" />
                </radialGradient>
            ))}
        </defs>
        
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="transparent" />
        
        <path d="M0,10 H100 M0,20 H100 M0,30 H100 M0,40 H100 M0,50 H100 M0,60 H100 M0,70 H100 M0,80 H100 M0,90 H100 M10,0 V100 M20,0 V100 M30,0 V100 M40,0 V100 M50,0 V100 M60,0 V100 M70,0 V100 M80,0 V100 M90,0 V100"
              fill="none" stroke="#4B5563" strokeWidth={0.2 * (viewBox.width/100)} />
        <path d="M0,45 H100 M50,0 V100" fill="none" stroke="#6B7280" strokeWidth={0.5 * (viewBox.width/100)} />
        
        <g filter="url(#heatmap-blur)">
          {mappedAreas.map(area => (
            <circle key={area.id} cx={area.x} cy={area.y} r={area.style.radius} fill={`url(#grad-${area.id})`} />
          ))}
        </g>
        
        <g>
            {mappedAreas.map(area => (
              <g key={`interactive-${area.id}`} onClick={() => onAreaClick(area)}>
                {isSelected(area) && (
                  <circle
                    cx={area.x} cy={area.y} r={area.style.radius + 3}
                    fill="none" stroke="#3B82F6" strokeWidth={1 * (viewBox.width/100)}
                    style={{ animation: `pulse-glow 2s infinite ease-in-out` }}
                  />
                )}
                <circle
                    cx={area.x} cy={area.y} r={area.style.radius}
                    fill="transparent"
                    onMouseMove={(e) => handleMouseMove(e, area)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer' }}
                />
              </g>
            ))}
        </g>
      </svg>
      <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded text-xs text-white backdrop-blur-sm">
        City Grid - Risk Areas
      </div>
      
       <div className="absolute bottom-2 right-2 flex flex-col gap-2">
            <button onClick={() => handleZoomButtonClick(0.8)} className="map-control-button" aria-label="Zoom in">+</button>
            <button onClick={() => handleZoomButtonClick(1.25)} className="map-control-button" aria-label="Zoom out">-</button>
      </div>
      
      {tooltip && (
        <div
          className="absolute bg-neutral-dark-gray text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transition-opacity"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};

export default GeospatialHeatmap;
