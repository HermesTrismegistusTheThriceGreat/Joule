// BESS Telemetry Types

export type OperatingMode = 'CHARGING' | 'DISCHARGING' | 'STANDBY' | 'FAULT';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type TestStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

export interface BESSTelemetry {
  timestamp: string;
  soc: number;                // 0-100 (%)
  activePower: number;        // kW (+ = discharge, - = charge)
  reactivePower: number;      // kVAR
  voltage: number;            // V (AC bus)
  frequency: number;          // Hz
  temperature: number;        // °C (avg cell temp)
  operatingMode: OperatingMode;
  alerts: Alert[];
}

export interface TelemetryDataPoint {
  timestamp: string;
  time: number;
  soc: number;
  activePower: number;
  reactivePower: number;
  voltage: number;
  frequency: number;
  temperature: number;
}

export interface SystemStats {
  totalCapacity: number;      // MWh
  availableCapacity: number;  // MWh
  roundTripEfficiency: number; // %
  cycleCount: number;
  uptime: number;             // hours
  lastMaintenance: string;
}

// Test Scenario Types

export type ComparisonOperator = 'GT' | 'LT' | 'EQ' | 'RANGE';

export interface PassCriteria {
  metric: string;
  operator: ComparisonOperator;
  value: number | [number, number];
  description: string;
}

export interface ScenarioParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  step: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'operations' | 'frequency' | 'validation' | 'emergency';
  parameters: ScenarioParameter[];
  duration: number;           // seconds
  passCriteria: PassCriteria[];
}

export interface TestRun {
  id: string;
  scenarioId: string;
  scenarioName: string;
  status: TestStatus;
  startTime: string;
  endTime?: string;
  progress: number;           // 0-100
  results?: TestResult[];
  dataLog: TelemetryDataPoint[];
}

export interface TestResult {
  criteriaId: string;
  description: string;
  passed: boolean;
  actualValue: number | string;
  expectedValue: string;
}

// Chart Types

export interface ChartConfig {
  timeWindow: number;         // seconds
  refreshRate: number;        // ms
  showGrid: boolean;
  channels: ChannelConfig[];
}

export interface ChannelConfig {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  yAxisId: string;
}

// Navigation

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
