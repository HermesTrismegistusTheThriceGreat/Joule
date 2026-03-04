import { useMemo } from 'react';
import { Battery, BatteryCharging, Zap, Thermometer } from 'lucide-react';
import { useBESSStore } from '../store';

const SoCGauge = () => {
  const { telemetry, systemStats } = useBESSStore();
  const { soc, operatingMode, temperature, activePower } = telemetry;

  // Calculate gauge values
  const radius = 85;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (soc / 100) * circumference;
  const offset = circumference - progress;

  // Color based on SoC level
  const getColor = (value: number) => {
    if (value <= 20) return '#FF1744';
    if (value <= 35) return '#FFB300';
    return '#00C853';
  };

  const gaugeColor = useMemo(() => getColor(soc), [soc]);

  // Format power display
  const powerDisplay = useMemo(() => {
    const absP = Math.abs(activePower);
    if (absP >= 1000) {
      return `${(activePower / 1000).toFixed(2)} MW`;
    }
    return `${activePower} kW`;
  }, [activePower]);

  return (
    <div className="card-surface rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${gaugeColor}33 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {operatingMode === 'CHARGING' ? (
            <BatteryCharging className="w-5 h-5 text-success" />
          ) : (
            <Battery className="w-5 h-5 text-primary-400" />
          )}
          <span className="data-label">STATE OF CHARGE</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Thermometer className="w-3.5 h-3.5 text-slate-400" />
          <span className="data-value text-slate-300">{temperature.toFixed(1)}°C</span>
        </div>
      </div>

      {/* Main Gauge */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            className="gauge-track"
            strokeWidth={strokeWidth}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={gaugeColor} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Progress arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            className="gauge-ring transition-all duration-700 ease-out"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow)"
            style={{ stroke: gaugeColor }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const innerR = radius - strokeWidth / 2 - 8;
            const outerR = radius - strokeWidth / 2 - 2;
            return (
              <line
                key={tick}
                x1={110 + innerR * Math.cos(rad)}
                y1={110 + innerR * Math.sin(rad)}
                x2={110 + outerR * Math.cos(rad)}
                y2={110 + outerR * Math.sin(rad)}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Center display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="data-value text-5xl font-bold transition-colors duration-300"
            style={{ color: gaugeColor }}
          >
            {soc.toFixed(1)}
            <span className="text-2xl ml-1">%</span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <Zap
              className={`w-4 h-4 ${
                operatingMode === 'DISCHARGING'
                  ? 'text-primary-400'
                  : operatingMode === 'CHARGING'
                  ? 'text-success'
                  : 'text-slate-500'
              }`}
            />
            <span className="data-value text-lg text-slate-200">
              {powerDisplay}
            </span>
          </div>

          <div
            className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
              operatingMode === 'CHARGING'
                ? 'bg-success/20 text-success'
                : operatingMode === 'DISCHARGING'
                ? 'bg-primary/20 text-primary-400'
                : operatingMode === 'FAULT'
                ? 'bg-danger/20 text-danger'
                : 'bg-slate-700/50 text-slate-400'
            }`}
          >
            {operatingMode}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50 relative z-10">
        <div className="text-center">
          <p className="data-label">CAPACITY</p>
          <p className="data-value text-lg text-slate-200">
            {systemStats.availableCapacity.toFixed(1)}
            <span className="text-xs text-slate-400 ml-1">MWh</span>
          </p>
        </div>
        <div className="text-center">
          <p className="data-label">EFFICIENCY</p>
          <p className="data-value text-lg text-success">
            {systemStats.roundTripEfficiency}%
          </p>
        </div>
        <div className="text-center">
          <p className="data-label">CYCLES</p>
          <p className="data-value text-lg text-slate-200">
            {systemStats.cycleCount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoCGauge;
