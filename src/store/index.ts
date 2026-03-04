import { create } from 'zustand';
import type {
  BESSTelemetry,
  TelemetryDataPoint,
  TestRun,
  TestScenario,
  SystemStats,
  Alert,
  OperatingMode
} from '../types';
import { testScenarios } from '../data/testScenarios';

interface BESSStore {
  // Current State
  telemetry: BESSTelemetry;
  telemetryHistory: TelemetryDataPoint[];
  systemStats: SystemStats;

  // Test State
  scenarios: TestScenario[];
  activeTest: TestRun | null;
  testHistory: TestRun[];

  // UI State
  timeWindow: number; // seconds
  isSimulating: boolean;
  selectedChannels: string[];

  // Actions
  updateTelemetry: (data: Partial<BESSTelemetry>) => void;
  addTelemetryPoint: (point: TelemetryDataPoint) => void;
  setTimeWindow: (seconds: number) => void;
  toggleSimulation: () => void;
  toggleChannel: (channelId: string) => void;

  // Test Actions
  startTest: (scenarioId: string, params: Record<string, number>) => void;
  pauseTest: () => void;
  resumeTest: () => void;
  stopTest: () => void;
  updateTestProgress: (progress: number) => void;
  completeTest: (results: TestRun['results']) => void;

  // Alert Actions
  addAlert: (alert: Alert) => void;
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;

  // Mode Control
  setOperatingMode: (mode: OperatingMode) => void;
  triggerFault: () => void;
  clearFault: () => void;
}

const initialTelemetry: BESSTelemetry = {
  timestamp: new Date().toISOString(),
  soc: 72,
  activePower: 850,
  reactivePower: 120,
  voltage: 480.2,
  frequency: 60.02,
  temperature: 28.5,
  operatingMode: 'DISCHARGING',
  alerts: [],
};

const initialStats: SystemStats = {
  totalCapacity: 10,
  availableCapacity: 7.2,
  roundTripEfficiency: 89.5,
  cycleCount: 1247,
  uptime: 8760,
  lastMaintenance: '2024-11-15',
};

export const useBESSStore = create<BESSStore>((set, get) => ({
  // Initial State
  telemetry: initialTelemetry,
  telemetryHistory: [],
  systemStats: initialStats,
  scenarios: testScenarios,
  activeTest: null,
  testHistory: [],
  timeWindow: 60,
  isSimulating: true,
  selectedChannels: ['activePower', 'soc', 'frequency'],

  // Telemetry Actions
  updateTelemetry: (data) => set((state) => ({
    telemetry: { ...state.telemetry, ...data, timestamp: new Date().toISOString() }
  })),

  addTelemetryPoint: (point) => set((state) => {
    const maxPoints = Math.ceil(state.timeWindow * 1.2); // Keep 20% extra
    const newHistory = [...state.telemetryHistory, point];
    if (newHistory.length > maxPoints) {
      newHistory.shift();
    }
    return { telemetryHistory: newHistory };
  }),

  setTimeWindow: (seconds) => set({ timeWindow: seconds }),

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  toggleChannel: (channelId) => set((state) => {
    const channels = state.selectedChannels.includes(channelId)
      ? state.selectedChannels.filter(c => c !== channelId)
      : [...state.selectedChannels, channelId];
    return { selectedChannels: channels };
  }),

  // Test Actions
  startTest: (scenarioId, _params) => {
    const scenario = get().scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const newTest: TestRun = {
      id: `test-${Date.now()}`,
      scenarioId,
      scenarioName: scenario.name,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      progress: 0,
      dataLog: [],
    };

    set({ activeTest: newTest });
  },

  pauseTest: () => set((state) => ({
    activeTest: state.activeTest
      ? { ...state.activeTest, status: 'PAUSED' }
      : null
  })),

  resumeTest: () => set((state) => ({
    activeTest: state.activeTest
      ? { ...state.activeTest, status: 'RUNNING' }
      : null
  })),

  stopTest: () => set((state) => {
    if (state.activeTest) {
      const completedTest: TestRun = {
        ...state.activeTest,
        status: 'COMPLETED',
        endTime: new Date().toISOString(),
      };
      return {
        activeTest: null,
        testHistory: [completedTest, ...state.testHistory].slice(0, 50),
      };
    }
    return {};
  }),

  updateTestProgress: (progress) => set((state) => ({
    activeTest: state.activeTest
      ? { ...state.activeTest, progress: Math.min(100, progress) }
      : null
  })),

  completeTest: (results) => set((state) => {
    if (state.activeTest) {
      const completedTest: TestRun = {
        ...state.activeTest,
        status: 'COMPLETED',
        endTime: new Date().toISOString(),
        progress: 100,
        results,
      };
      return {
        activeTest: null,
        testHistory: [completedTest, ...state.testHistory].slice(0, 50),
      };
    }
    return {};
  }),

  // Alert Actions
  addAlert: (alert) => set((state) => ({
    telemetry: {
      ...state.telemetry,
      alerts: [alert, ...state.telemetry.alerts].slice(0, 10),
    }
  })),

  dismissAlert: (alertId) => set((state) => ({
    telemetry: {
      ...state.telemetry,
      alerts: state.telemetry.alerts.filter(a => a.id !== alertId),
    }
  })),

  clearAlerts: () => set((state) => ({
    telemetry: { ...state.telemetry, alerts: [] }
  })),

  // Mode Control
  setOperatingMode: (mode) => set((state) => ({
    telemetry: { ...state.telemetry, operatingMode: mode }
  })),

  triggerFault: () => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      severity: 'CRITICAL',
      message: 'Grid disturbance detected - Emergency shutdown initiated',
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        operatingMode: 'FAULT',
        alerts: [alert, ...state.telemetry.alerts],
      }
    }));
  },

  clearFault: () => set((state) => ({
    telemetry: { ...state.telemetry, operatingMode: 'STANDBY' }
  })),
}));
