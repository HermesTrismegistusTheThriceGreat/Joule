import { useNavigate } from 'react-router-dom';
import { useBESSStore } from '../store';
import {
  Play,
  AlertTriangle,
  Battery,
  Radio,
  TrendingUp,
  Zap,
  RefreshCw,
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const { setOperatingMode, triggerFault, clearFault, telemetry, addAlert } = useBESSStore();
  const { operatingMode } = telemetry;

  const actions = [
    {
      id: 'freq-response',
      label: 'Frequency Response Test',
      description: 'Run PFR validation',
      icon: Radio,
      color: '#00C853',
      action: () => navigate('/test?scenario=frequency-response'),
    },
    {
      id: 'ramp-test',
      label: 'Ramp Rate Test',
      description: 'Validate MW/min limits',
      icon: TrendingUp,
      color: '#FFB300',
      action: () => navigate('/test?scenario=ramp-rate-validation'),
    },
    {
      id: 'soc-test',
      label: 'SoC Management',
      description: 'Test limit behavior',
      icon: Battery,
      color: '#0066FF',
      action: () => navigate('/test?scenario=soc-management'),
    },
    {
      id: 'trigger-fault',
      label: operatingMode === 'FAULT' ? 'Clear Fault' : 'Simulate Fault',
      description: operatingMode === 'FAULT' ? 'Return to normal' : 'Test protection',
      icon: AlertTriangle,
      color: '#FF1744',
      action: () => {
        if (operatingMode === 'FAULT') {
          clearFault();
          addAlert({
            id: `alert-${Date.now()}`,
            severity: 'INFO',
            message: 'Fault cleared - System returning to standby',
            timestamp: new Date().toISOString(),
          });
        } else {
          triggerFault();
        }
      },
      variant: operatingMode === 'FAULT' ? 'danger' : 'outline',
    },
  ];

  const modeButtons = [
    {
      mode: 'CHARGING' as const,
      label: 'Charge',
      icon: Zap,
      color: '#00C853',
    },
    {
      mode: 'DISCHARGING' as const,
      label: 'Discharge',
      icon: Play,
      color: '#0066FF',
    },
    {
      mode: 'STANDBY' as const,
      label: 'Standby',
      icon: RefreshCw,
      color: '#78909C',
    },
  ];

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200">
          QUICK ACTIONS
        </h3>
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
          {modeButtons.map(({ mode, label, icon: Icon, color }) => (
            <button
              key={mode}
              onClick={() => setOperatingMode(mode)}
              disabled={operatingMode === 'FAULT'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-50 ${
                operatingMode === mode
                  ? 'bg-opacity-20'
                  : 'hover:bg-slate-700/50 text-slate-400'
              }`}
              style={{
                backgroundColor: operatingMode === mode ? `${color}20` : undefined,
                color: operatingMode === mode ? color : undefined,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`group relative p-4 rounded-xl text-left transition-all overflow-hidden ${
              action.variant === 'danger'
                ? 'bg-danger/10 border border-danger/30 hover:bg-danger/20'
                : 'bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
            } hover:scale-[1.02] active:scale-[0.98]`}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `radial-gradient(circle at 50% 100%, ${action.color}15 0%, transparent 70%)`,
              }}
            />

            <div className="relative z-10">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>

              <p className="font-medium text-sm text-slate-200">{action.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
