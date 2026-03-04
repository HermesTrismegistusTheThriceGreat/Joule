import { useBESSStore } from '../store';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';

const AlertBanner = () => {
  const { telemetry, dismissAlert } = useBESSStore();
  const { alerts } = telemetry;

  if (alerts.length === 0) return null;

  const severityConfig = {
    CRITICAL: {
      bg: 'bg-danger/10 border-danger/30',
      text: 'text-danger',
      icon: AlertTriangle,
      glow: 'shadow-[0_0_20px_rgba(255,23,68,0.3)]',
    },
    WARNING: {
      bg: 'bg-warning/10 border-warning/30',
      text: 'text-warning',
      icon: AlertCircle,
      glow: 'shadow-[0_0_20px_rgba(255,179,0,0.2)]',
    },
    INFO: {
      bg: 'bg-primary/10 border-primary/30',
      text: 'text-primary-400',
      icon: Info,
      glow: '',
    },
  };

  return (
    <div className="px-6 pt-2">
      {alerts.slice(0, 3).map((alert) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={`mb-2 rounded-lg border ${config.bg} ${config.glow} backdrop-blur-sm transition-all duration-200`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.text}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${config.text}`}>
                    {alert.severity}
                  </p>
                  <p className="text-sm text-slate-300">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
