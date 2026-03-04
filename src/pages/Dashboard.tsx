import SoCGauge from '../components/SoCGauge';
import PowerChart from '../components/PowerChart';
import StatusIndicators from '../components/StatusIndicators';
import QuickActions from '../components/QuickActions';
import SystemSummary from '../components/SystemSummary';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            System Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time BESS performance monitoring
          </p>
        </div>
        <div className="text-right">
          <p className="data-label">LAST UPDATE</p>
          <p className="data-value text-sm text-slate-300">
            {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - SoC Gauge */}
        <div className="col-span-12 lg:col-span-3">
          <SoCGauge />
        </div>

        {/* Center Column - Power Chart */}
        <div className="col-span-12 lg:col-span-6">
          <PowerChart />
        </div>

        {/* Right Column - System Summary */}
        <div className="col-span-12 lg:col-span-3">
          <SystemSummary />
        </div>
      </div>

      {/* Status Indicators */}
      <div>
        <StatusIndicators />
      </div>

      {/* Quick Actions */}
      <div>
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
