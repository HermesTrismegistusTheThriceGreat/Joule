import { useBESSStore } from '../store';
import {
  Radio,
  Gauge,
  Thermometer,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  nominal?: number;
  range?: [number, number];
}

const MetricCard = ({
  label,
  value,
  unit,
  icon,
  trend,
  status = 'normal',
  nominal,
  range,
}: MetricCardProps) => {
  const statusColors = {
    normal: 'text-slate-200',
    warning: 'text-warning',
    critical: 'text-danger',
  };

  const statusGlow = {
    normal: '',
    warning: 'glow-warning',
    critical: 'glow-danger',
  };

  const trendIcons = {
    up: <ArrowUp className="w-3 h-3 text-success" />,
    down: <ArrowDown className="w-3 h-3 text-danger" />,
    stable: <Minus className="w-3 h-3 text-slate-500" />,
  };

  // Calculate deviation from nominal
  const deviation = nominal ? ((value - nominal) / nominal) * 100 : 0;

  return (
    <div
      className={`card-surface rounded-xl p-4 relative overflow-hidden transition-all duration-300 ${statusGlow[status]}`}
    >
      {/* Status indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          status === 'critical'
            ? 'bg-danger'
            : status === 'warning'
            ? 'bg-warning'
            : 'bg-primary-500/30'
        }`}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          {icon}
          <span className="data-label">{label}</span>
        </div>
        {trend && trendIcons[trend]}
      </div>

      <div className="mt-3">
        <div
          className={`data-value text-3xl font-bold transition-colors duration-200 ${statusColors[status]}`}
        >
          {value.toFixed(2)}
          <span className="text-lg text-slate-400 ml-1">{unit}</span>
        </div>

        {/* Deviation indicator */}
        {nominal && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  Math.abs(deviation) < 0.5
                    ? 'bg-success'
                    : Math.abs(deviation) < 1
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
                style={{
                   width: `${Math.min(100, Math.abs(deviation) * 50 + 50)}%`,
                }}
              />
            </div>
            <span
              className={`text-xs font-mono ${
                deviation > 0 ? 'text-success' : deviation < 0 ? 'text-danger' : 'text-slate-400'
              }`}
            >
              {deviation > 0 ? '+' : ''}
              {deviation.toFixed(3)}%
            </span>
          </div>
        )}

        {/* Range indicator */}
        {range && (
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Range: {range[0]} - {range[1]} {unit}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusIndicators = () => {
  const { telemetry } = useBESSStore();
  const { frequency, voltage, temperature, reactivePower } = telemetry;

  // Determine status based on values
  const getFrequencyStatus = (freq: number) => {
    const deviation = Math.abs(freq - 60);
    if (deviation > 0.5) return 'critical';
    if (deviation > 0.1) return 'warning';
    return 'normal';
  };

  const getVoltageStatus = (volt: number) => {
    const deviation = Math.abs(volt - 480) / 480;
    if (deviation > 0.1) return 'critical';
    if (deviation > 0.05) return 'warning';
    return 'normal';
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp > 45) return 'critical';
    if (temp > 35) return 'warning';
    return 'normal';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="FREQUENCY"
        value={frequency}
        unit="Hz"
        icon={<Radio className="w-4 h-4" />}
        status={getFrequencyStatus(frequency)}
        nominal={60.0}
        trend={frequency > 60.01 ? 'up' : frequency < 59.99 ? 'down' : 'stable'}
      />

      <MetricCard
        label="VOLTAGE"
        value={voltage}
        unit="V"
        icon={<Gauge className="w-4 h-4" />}
        status={getVoltageStatus(voltage)}
        nominal={480}
        range={[456, 504]}
      />

      <MetricCard
        label="TEMPERATURE"
        value={temperature}
        unit="°C"
        icon={<Thermometer className="w-4 h-4" />}
        status={getTemperatureStatus(temperature)}
        range={[15, 45]}
        trend={temperature > 30 ? 'up' : 'stable'}
      />

      <MetricCard
        label="REACTIVE POWER"
        value={reactivePower}
        unit="kVAR"
        icon={<Activity className="w-4 h-4" />}
        status="normal"
        trend={reactivePower > 0 ? 'up' : reactivePower < 0 ? 'down' : 'stable'}
      />
    </div>
  );
};

export default StatusIndicators;
