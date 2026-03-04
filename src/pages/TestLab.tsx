import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBESSStore } from '../store';
import {
  Play,
  Pause,
  Square,
  Settings,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Radio,
  TrendingUp,
  BarChart3,
  Battery,
  AlertTriangle,
} from 'lucide-react';
import PowerChart from '../components/PowerChart';

const iconMap: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Activity,
  Radio,
  TrendingUp,
  BarChart3,
  Battery,
  AlertTriangle,
};

const TestLab = () => {
  const [searchParams] = useSearchParams();
  const {
    scenarios,
    activeTest,
    testHistory,
    startTest,
    pauseTest,
    resumeTest,
    stopTest,
  } = useBESSStore();

  const [selectedScenario, setSelectedScenario] = useState<string | null>(
    searchParams.get('scenario') || null
  );
  const [parameters, setParameters] = useState<Record<string, number>>({});

  // Initialize parameters when scenario selected
  useEffect(() => {
    if (selectedScenario) {
      const scenario = scenarios.find((s) => s.id === selectedScenario);
      if (scenario) {
        const initialParams: Record<string, number> = {};
        scenario.parameters.forEach((p) => {
          initialParams[p.id] = p.value;
        });
        setParameters(initialParams);
      }
    }
  }, [selectedScenario, scenarios]);

  const scenario = scenarios.find((s) => s.id === selectedScenario);
  const isRunning = activeTest?.status === 'RUNNING';
  const isPaused = activeTest?.status === 'PAUSED';

  const handleStartTest = () => {
    if (selectedScenario) {
      startTest(selectedScenario, parameters);
    }
  };

  const categoryColors: Record<string, string> = {
    operations: '#0066FF',
    frequency: '#00C853',
    validation: '#FFB300',
    emergency: '#FF1744',
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
            Test Lab
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure and execute BESS test scenarios
          </p>
        </div>

        {activeTest && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="data-label">ACTIVE TEST</p>
              <p className="text-sm font-medium text-primary-400">
                {activeTest.scenarioName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={pauseTest}
                  className="p-2 rounded-lg bg-warning/20 text-warning hover:bg-warning/30 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : isPaused ? (
                <button
                  onClick={resumeTest}
                  className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : null}
              <button
                onClick={stopTest}
                className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Scenario List */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card-surface rounded-2xl p-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              TEST SCENARIOS
            </h3>

            <div className="space-y-2">
              {scenarios.map((s) => {
                const Icon = iconMap[s.icon] || Activity;
                const isSelected = selectedScenario === s.id;
                const color = categoryColors[s.category];

                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-slate-800/30 border border-transparent hover:border-slate-700/50'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-slate-200">
                            {s.name}
                          </p>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected
                                ? 'text-primary-400 rotate-90'
                                : 'text-slate-500'
                            }`}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {s.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${color}20`,
                              color,
                            }}
                          >
                            {s.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {s.duration}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {scenario ? (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-surface rounded-2xl p-6"
              >
                {/* Scenario Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {scenario.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {scenario.description}
                    </p>
                  </div>
                  <button
                    onClick={handleStartTest}
                    disabled={!!activeTest}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Start Test
                  </button>
                </div>

                {/* Parameters */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <h4 className="font-display text-sm font-semibold tracking-wider text-slate-200">
                      PARAMETERS
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {scenario.parameters.map((param) => (
                      <div
                        key={param.id}
                        className="bg-slate-800/30 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-slate-300">
                            {param.name}
                          </label>
                          <span className="data-value text-primary-400">
                            {parameters[param.id] ?? param.value} {param.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={parameters[param.id] ?? param.value}
                          onChange={(e) =>
                            setParameters({
                              ...parameters,
                              [param.id]: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,102,255,0.5)]"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>
                            {param.min} {param.unit}
                          </span>
                          <span>
                            {param.max} {param.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pass Criteria */}
                <div>
                  <h4 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-3">
                    PASS CRITERIA
                  </h4>
                  <div className="space-y-2">
                    {scenario.passCriteria.map((criteria, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center text-xs text-slate-400">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-300">
                          {criteria.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-surface rounded-2xl p-12 text-center"
              >
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  Select a test scenario to configure
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Chart during test */}
          {activeTest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PowerChart />
            </motion.div>
          )}

          {/* Test History */}
          <div className="card-surface rounded-2xl p-6">
            <h4 className="font-display text-sm font-semibold tracking-wider text-slate-200 mb-4">
              TEST HISTORY
            </h4>

            {testHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No tests completed yet
              </p>
            ) : (
              <div className="space-y-2">
                {testHistory.slice(0, 5).map((test) => {
                  const passed = test.results?.every((r) => r.passed);
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-slate-800/20 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        {passed === undefined ? (
                          <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                        ) : passed ? (
                          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-success" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-danger" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-slate-200">
                            {test.scenarioName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(test.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            passed === undefined
                              ? 'text-slate-400'
                              : passed
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          {passed === undefined
                            ? 'N/A'
                            : passed
                            ? 'PASSED'
                            : 'FAILED'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Duration:{' '}
                          {test.endTime
                            ? Math.round(
                                (new Date(test.endTime).getTime() -
                                  new Date(test.startTime).getTime()) /
                                  1000
                              )
                            : '-'}
                          s
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestLab;
