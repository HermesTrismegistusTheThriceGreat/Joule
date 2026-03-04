import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Wifi,
  Shield,
  Bell,
  Database,
  Users,
  Settings as SettingsIcon,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  status?: 'connected' | 'disconnected' | 'warning';
}

const sections: SettingSection[] = [
  {
    id: 'scada',
    title: 'SCADA Connection',
    description: 'Configure real-time data source',
    icon: Server,
    status: 'disconnected',
  },
  {
    id: 'network',
    title: 'Network Settings',
    description: 'IP configuration and protocols',
    icon: Wifi,
    status: 'connected',
  },
  {
    id: 'security',
    title: 'Security & Access',
    description: 'User roles and permissions',
    icon: Shield,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Alert thresholds and channels',
    icon: Bell,
  },
  {
    id: 'historian',
    title: 'Data Historian',
    description: 'Storage and retention policies',
    icon: Database,
    status: 'connected',
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage operators and admins',
    icon: Users,
  },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const statusColors = {
    connected: 'text-success',
    disconnected: 'text-slate-500',
    warning: 'text-warning',
  };

  const statusBg = {
    connected: 'bg-success/20',
    disconnected: 'bg-slate-700/50',
    warning: 'bg-warning/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-wide">
          Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          System configuration and preferences
        </p>
      </div>

      {/* Prototype Notice */}
      <div className="card-surface rounded-xl p-4 border-l-4 border-warning">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-200">Prototype Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">
              This dashboard is running in demonstration mode with simulated data.
              Backend integration would be configured here in production.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Settings Sections */}
        <div className="col-span-12 lg:col-span-5">
          <div className="card-surface rounded-2xl p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-slate-800/30 border border-transparent'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      section.status ? statusBg[section.status] : 'bg-slate-800/50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        section.status
                          ? statusColors[section.status]
                          : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-slate-200">
                        {section.title}
                      </p>
                      {section.status === 'connected' && (
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-primary-400 rotate-90' : 'text-slate-500'
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-span-12 lg:col-span-7">
          {activeSection ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-surface rounded-2xl p-6"
            >
              {activeSection === 'scada' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      SCADA Connection Settings
                    </h3>
                    <p className="text-sm text-slate-400">
                      Configure the connection to your SCADA system for real-time data.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Protocol
                      </label>
                      <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-primary-500 focus:outline-none">
                        <option>Modbus TCP</option>
                        <option>OPC-UA</option>
                        <option>DNP3</option>
                        <option>IEC 61850</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Host / IP Address
                        </label>
                        <input
                          type="text"
                          placeholder="192.168.1.100"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Port
                        </label>
                        <input
                          type="text"
                          placeholder="502"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Polling Interval (ms)
                      </label>
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                      Status: <span className="text-slate-400">Disconnected</span>
                    </p>
                    <div className="flex gap-3">
                      <button className="btn-outline px-4 py-2 rounded-lg text-sm">
                        Test Connection
                      </button>
                      <button className="btn-primary px-4 py-2 rounded-lg text-sm text-white">
                        Save & Connect
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Notification Settings
                    </h3>
                    <p className="text-sm text-slate-400">
                      Configure alert thresholds and notification channels.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300">
                          SoC Low Warning
                        </span>
                        <span className="data-value text-sm text-warning">20%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={50}
                        defaultValue={20}
                        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300">
                          Temperature Warning
                        </span>
                        <span className="data-value text-sm text-warning">35°C</span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={50}
                        defaultValue={35}
                        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-300">Email Alerts</p>
                        <p className="text-xs text-slate-500">
                          Send alerts to ops@example.com
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {!['scada', 'notifications'].includes(activeSection) && (
                <div className="text-center py-12">
                  <SettingsIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Configuration panel for {activeSection}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Coming in production version
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="card-surface rounded-2xl p-12 text-center">
              <SettingsIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a setting category to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="card-surface rounded-2xl p-6">
        <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
          SYSTEM INFORMATION
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/20 rounded-xl">
            <p className="data-label mb-1">VERSION</p>
            <p className="text-sm text-slate-200">Joule v0.1.0 (Prototype)</p>
          </div>
          <div className="p-4 bg-slate-800/20 rounded-xl">
            <p className="data-label mb-1">BUILD</p>
            <p className="text-sm text-slate-200">2024.12.001</p>
          </div>
          <div className="p-4 bg-slate-800/20 rounded-xl">
            <p className="data-label mb-1">ENVIRONMENT</p>
            <p className="text-sm text-slate-200">Demo / Simulation</p>
          </div>
          <div className="p-4 bg-slate-800/20 rounded-xl">
            <p className="data-label mb-1">DATA SOURCE</p>
            <p className="text-sm text-slate-200">Mock Generator (1Hz)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
