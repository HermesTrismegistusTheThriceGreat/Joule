import { useBESSStore } from '../store';
import {
  Server,
  Clock,
  Wrench,
  TrendingUp,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const SystemSummary = () => {
  const { systemStats, activeTest, testHistory } = useBESSStore();

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const recentTests = testHistory.slice(0, 3);
  const passedTests = testHistory.filter(
    (t) => t.results?.every((r) => r.passed)
  ).length;

  return (
    <div className="card-surface rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-4 h-4 text-primary-400" />
        <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200">
          SYSTEM STATUS
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="data-label">UPTIME</span>
          </div>
          <p className="data-value text-lg text-success">
            {formatUptime(systemStats.uptime)}
          </p>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="data-label">EFFICIENCY</span>
          </div>
          <p className="data-value text-lg text-primary-400">
            {systemStats.roundTripEfficiency}%
          </p>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-3.5 h-3.5 text-slate-400" />
            <span className="data-label">LAST MAINT.</span>
          </div>
          <p className="data-value text-sm text-slate-300">
            {new Date(systemStats.lastMaintenance).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="data-label">TESTS PASSED</span>
          </div>
          <p className="data-value text-lg text-slate-300">
            {passedTests}/{testHistory.length}
          </p>
        </div>
      </div>

      {/* Active Test */}
      {activeTest && (
        <div
          className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-400">
              TEST RUNNING
            </span>
            <span className="text-xs text-slate-400">
              {activeTest.progress.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-slate-200 font-medium">
            {activeTest.scenarioName}
          </p>
          <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${activeTest.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Tests */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="data-label">RECENT TESTS</span>
        </div>

        {recentTests.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-500">
            No tests run yet
          </div>
        ) : (
          <div className="space-y-2">
            {recentTests.map((test) => {
              const passed = test.results?.every((r) => r.passed);
              return (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/20"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        passed === undefined
                          ? 'bg-slate-500'
                          : passed
                          ? 'bg-success'
                          : 'bg-danger'
                      }`}
                    />
                    <span className="text-xs text-slate-300 truncate max-w-[120px]">
                      {test.scenarioName}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(test.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Capacity Bar */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="data-label">SYSTEM CAPACITY</span>
          <span className="text-xs text-slate-400">
            {systemStats.availableCapacity.toFixed(1)} / {systemStats.totalCapacity} MWh
          </span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
            style={{
              width: `${(systemStats.availableCapacity / systemStats.totalCapacity) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemSummary;
