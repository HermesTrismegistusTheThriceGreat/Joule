import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useBESSStore } from '../store';
import { Download, Maximize2, Clock } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const timeWindows = [
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 900, label: '15m' },
  { value: 3600, label: '1h' },
];

const channels = [
  { id: 'activePower', name: 'Active Power', color: '#0066FF', unit: 'kW', yAxisID: 'y' },
  { id: 'soc', name: 'SoC', color: '#00C853', unit: '%', yAxisID: 'y1' },
  { id: 'frequency', name: 'Frequency', color: '#FFB300', unit: 'Hz', yAxisID: 'y1' },
  { id: 'voltage', name: 'Voltage', color: '#FF1744', unit: 'V', yAxisID: 'y' },
];

const PowerChart = () => {
  const { telemetryHistory, timeWindow, setTimeWindow, selectedChannels, toggleChannel } =
    useBESSStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter data to time window
  const filteredData = useMemo(() => {
    const now = Date.now();
    const windowMs = timeWindow * 1000;
    return telemetryHistory.filter((point) => {
      const pointTime = new Date(point.timestamp).getTime();
      return now - pointTime <= windowMs;
    });
  }, [telemetryHistory, timeWindow]);

  const data = useMemo(() => {
    const labels = filteredData.map((point) =>
      new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      })
    );

    const datasets = channels
      .filter((c) => selectedChannels.includes(c.id))
      .map((c) => ({
        label: c.name,
        data: filteredData.map((p) => (p as any)[c.id]),
        borderColor: c.color,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, `${c.color}50`); // 30% opacity
          gradient.addColorStop(1, `${c.color}00`); // 0% opacity
          return gradient;
        },
        yAxisID: c.yAxisID,
        borderWidth: 2,
        tension: 0.4, // Smooth curves
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      }));

    return { labels, datasets };
  }, [filteredData, selectedChannels]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const channel = channels.find(c => c.name === context.dataset.label);
              label += context.parsed.y.toFixed(2) + (channel ? ` ${channel.unit}` : '');
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)', // slate-700 with opacity
          display: true,
        },
        ticks: {
          color: '#64748b', // slate-500
          maxTicksLimit: 8,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#64748b',
        },
        suggestedMin: -1000,
        suggestedMax: 1000,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#64748b',
          callback: (value: any) => `${value}%`
        },
        min: 0,
        max: 100,
      },
    },
  }), []);

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Active Power (kW)', 'SoC (%)', 'Frequency (Hz)', 'Voltage (V)'].join(','),
      ...filteredData.map((row) =>
        [row.timestamp, row.activePower, row.soc, row.frequency, row.voltage].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joule-export-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`card-surface rounded-2xl p-6 transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 bg-[#0B1121]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200">
            REAL-TIME POWER
          </h3>

          {/* Channel toggles */}
          <div className="flex items-center gap-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  selectedChannels.includes(channel.id)
                    ? 'bg-opacity-20 border'
                    : 'bg-slate-800/50 text-slate-500 border border-transparent'
                }`}
                style={{
                  backgroundColor: selectedChannels.includes(channel.id)
                    ? `${channel.color}20`
                    : undefined,
                  borderColor: selectedChannels.includes(channel.id)
                    ? `${channel.color}50`
                    : undefined,
                  color: selectedChannels.includes(channel.id)
                    ? channel.color
                    : undefined,
                }}
              >
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time window selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Clock className="w-3.5 h-3.5 text-slate-500 ml-2" />
            {timeWindows.map((tw) => (
              <button
                key={tw.value}
                onClick={() => setTimeWindow(tw.value)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                  timeWindow === tw.value
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tw.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={`${isExpanded ? 'h-[calc(100%-80px)]' : 'h-64'}`}>
        <div className="relative w-full h-full">
          {filteredData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-sm bg-[#0B1121]/50 backdrop-blur-sm z-10">
              WAITING FOR TELEMETRY...
            </div>
          )}
          <Line data={data} options={options} />
        </div>
      </div>

      {/* Legend / Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          {filteredData.length > 0 && (
            <>
              <div className="text-xs">
                <span className="text-slate-500">Points: </span>
                <span className="data-value text-slate-300">{filteredData.length}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Update: </span>
                <span className="data-value text-slate-300">1s</span>
              </div>
              <div className="text-xs">
                 <span className="text-slate-500">Render: </span>
                 <span className="data-value text-success">Native Canvas</span>
              </div>
            </>
          )}
        </div>
        <div className="text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">E</kbd> to export
        </div>
      </div>
    </div>
  );
};

export default PowerChart;
