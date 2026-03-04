import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
import { useBESSStore } from '../store';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';

// Generate mock historical data
const generateHistoricalData = () => {
  const data = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: 180 + Math.random() * 40,
      efficiency: 87 + Math.random() * 6,
      cycles: Math.floor(35 + Math.random() * 15),
      revenue: 2500 + Math.random() * 1500,
    });
  }
  return data;
};


const Analytics = () => {
  const { systemStats: _systemStats, telemetryHistory: _telemetryHistory } = useBESSStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const historicalData = useMemo(() => generateHistoricalData(), []);

  const metrics = [
    {
      label: 'Total Energy Throughput',
      value: '5,847',
      unit: 'MWh',
      change: '+12.3%',
      trend: 'up',
      color: '#0066FF',
    },
    {
      label: 'Avg. Round-Trip Efficiency',
      value: '89.5',
      unit: '%',
      change: '+0.8%',
      trend: 'up',
      color: '#00C853',
    },
    {
      label: 'Total Cycles',
      value: '1,247',
      unit: 'cycles',
      change: '+45',
      trend: 'up',
      color: '#FFB300',
    },
    {
      label: 'Est. Revenue',
      value: '$127,450',
      unit: '',
      change: '+8.2%',
      trend: 'up',
      color: '#0066FF',
    },
  ];

  const handleExport = () => {
    const csv = [
      ['Date', 'Energy (MWh)', 'Efficiency (%)', 'Cycles', 'Revenue ($)'].join(','),
      ...historicalData.map((row) =>
        [row.date, row.energy.toFixed(1), row.efficiency.toFixed(1), row.cycles, row.revenue.toFixed(0)].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joule-analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Historical performance trends and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="card-surface rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <p className="data-label mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <span
                  className="data-value text-3xl font-bold"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-sm text-slate-400 ml-1">{metric.unit}</span>
                )}
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${
                  metric.trend === 'up' ? 'text-success' : 'text-danger'
                }`}
              >
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metric.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Energy Throughput Chart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              ENERGY THROUGHPUT
            </h3>
            <div className="h-80 flex items-center justify-center text-slate-500">
               Chart Disabled (Migrating to Chart.js)
            </div>
          </div>
        </div>

        {/* Mode Distribution */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-surface rounded-2xl p-6 h-full">
            <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              OPERATING MODE DISTRIBUTION
            </h3>
             <div className="h-48 flex items-center justify-center text-slate-500">
               Chart Disabled
            </div>
          </div>
        </div>

        {/* Efficiency Trend */}
        <div className="col-span-12 lg:col-span-6">
          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              ROUND-TRIP EFFICIENCY TREND
            </h3>
             <div className="h-64 flex items-center justify-center text-slate-500">
               Chart Disabled
            </div>
          </div>
        </div>

        {/* Daily Cycles */}
        <div className="col-span-12 lg:col-span-6">
          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              DAILY CYCLE COUNT
            </h3>
             <div className="h-64 flex items-center justify-center text-slate-500">
               Chart Disabled
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
