import React from 'react';
import { RiskLevel } from '../types';

interface RiskGaugeProps {
  riskLevel: RiskLevel;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ riskLevel }) => {
  const riskConfig = {
    [RiskLevel.LOW]: { angle: -60, color: '#10B981', label: 'Low' },
    [RiskLevel.MEDIUM]: { angle: -20, color: '#F59E0B', label: 'Medium' },
    [RiskLevel.HIGH]: { angle: 20, color: '#EF4444', label: 'High' },
    [RiskLevel.CRITICAL]: { angle: 60, color: '#8B0000', label: 'Critical' },
  };

  const { angle, color, label } = riskConfig[riskLevel] || riskConfig[RiskLevel.LOW];
  const arcLength = 2 * Math.PI * 90; // Circumference of the gauge circle

  return (
    <div className="relative w-64 h-40 mx-auto">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        {/* Background Arc */}
        <path
          d="M10 110 A90 90 0 0 1 190 110"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Foreground Arc (Risk Level) */}
        <path
          d="M10 110 A90 90 0 0 1 190 110"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - (angle + 90) / 180)}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 110)`} style={{ transition: 'transform 0.5s ease-in-out' }}>
          <polygon points="100,20 95,110 105,110" fill="#1F2937" />
          <circle cx="100" cy="110" r="8" fill="#1F2937" />
        </g>
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div className="text-2xl font-bold" style={{ color: color }}>{label}</div>
      </div>
    </div>
  );
};

export default RiskGauge;
