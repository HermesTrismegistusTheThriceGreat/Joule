import { NavLink } from 'react-router-dom';
import { useBESSStore } from '../store';
import {
  LayoutDashboard,
  FlaskConical,
  BarChart3,
  Settings,
  Zap,
  Circle,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/test', label: 'Test Lab', icon: FlaskConical },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Header = () => {
  const { telemetry, isSimulating, toggleSimulation } = useBESSStore();
  const { operatingMode } = telemetry;

  const modeColors: Record<string, string> = {
    CHARGING: 'text-success',
    DISCHARGING: 'text-primary-400',
    STANDBY: 'text-neutral',
    FAULT: 'text-danger',
  };

  const modeLedColors: Record<string, string> = {
    CHARGING: 'led-success',
    DISCHARGING: 'led-success',
    STANDBY: 'led-standby',
    FAULT: 'led-danger',
  };

  return (
    <header className="status-bar sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-primary">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-wider text-white">
                  JOULE
                </h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest">
                  BESS MONITORING
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `nav-item flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-6">
            {/* Simulation Toggle */}
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                isSimulating
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
              }`}
            >
              <Circle
                className={`w-2 h-2 ${isSimulating ? 'fill-success' : 'fill-slate-500'}`}
              />
              {isSimulating ? 'LIVE' : 'PAUSED'}
            </button>

            {/* Operating Mode */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className={`led ${modeLedColors[operatingMode]}`} />
              <div>
                <p className="data-label">MODE</p>
                <p className={`text-sm font-semibold ${modeColors[operatingMode]}`}>
                  {operatingMode}
                </p>
              </div>
            </div>

            {/* Current Time */}
            <div className="text-right">
              <p className="data-label">SYSTEM TIME</p>
              <p className="data-value text-sm text-slate-200">
                {new Date().toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
