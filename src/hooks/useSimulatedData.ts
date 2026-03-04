import { useEffect, useRef, useCallback } from 'react';
import { useBESSStore } from '../store';
import type { TelemetryDataPoint, OperatingMode } from '../types';

// Simulation parameters
const SIMULATION_INTERVAL = 1000; // 1 second

// Realistic value generators with smooth transitions
const generateSoC = (current: number, mode: OperatingMode): number => {
  const drift = (Math.random() - 0.5) * 0.3;
  let change = drift;

  switch (mode) {
    case 'CHARGING':
      change += 0.15 + Math.random() * 0.1;
      break;
    case 'DISCHARGING':
      change -= 0.12 + Math.random() * 0.08;
      break;
    case 'STANDBY':
      change = drift * 0.1; // Minimal drift
      break;
    case 'FAULT':
      change = 0; // No change during fault
      break;
  }

  return Math.max(5, Math.min(100, current + change));
};

const generateActivePower = (current: number, mode: OperatingMode): number => {
  const noise = (Math.random() - 0.5) * 40;
  let base: number;

  switch (mode) {
    case 'CHARGING':
      base = -800 + Math.sin(Date.now() / 10000) * 100;
      break;
    case 'DISCHARGING':
      base = 850 + Math.sin(Date.now() / 8000) * 150;
      break;
    case 'STANDBY':
      base = 0;
      break;
    case 'FAULT':
      base = 0;
      break;
    default:
      base = current;
  }

  // Smooth transition
  const smoothed = current + (base - current) * 0.2;
  return Math.round(smoothed + noise);
};

const generateReactivePower = (activePower: number): number => {
  const pf = 0.95 + (Math.random() - 0.5) * 0.05; // Power factor ~0.95
  const angle = Math.acos(pf);
  return Math.round(Math.abs(activePower) * Math.tan(angle) * (Math.random() > 0.5 ? 1 : -1) * 0.3);
};

const generateFrequency = (_current: number, isTest: boolean): number => {
  const baseFreq = 60.0;
  // Simulate grid frequency variations
  const variation = Math.sin(Date.now() / 30000) * 0.03 + (Math.random() - 0.5) * 0.02;

  if (isTest) {
    // During frequency response tests, add more variation
    const testVariation = Math.sin(Date.now() / 5000) * 0.08;
    return baseFreq + variation + testVariation;
  }

  return Number((baseFreq + variation).toFixed(3));
};

const generateVoltage = (_current: number): number => {
  const baseVoltage = 480;
  const variation = (Math.random() - 0.5) * 2 + Math.sin(Date.now() / 20000) * 1.5;
  return Number((baseVoltage + variation).toFixed(1));
};

const generateTemperature = (current: number, activePower: number): number => {
  const baseTemp = 25;
  const loadEffect = Math.abs(activePower) / 2000 * 8; // Max +8°C at full load
  const ambient = Math.sin(Date.now() / 60000) * 2; // Slow ambient variation
  const noise = (Math.random() - 0.5) * 0.5;

  const target = baseTemp + loadEffect + ambient;
  // Smooth temperature changes (thermal inertia)
  const smoothed = current + (target - current) * 0.05;

  return Number((smoothed + noise).toFixed(1));
};

export const useSimulatedData = () => {
  // We only consume what we need for the return value or stable references
  const {
    telemetry,
    isSimulating,
    updateTelemetry,
    addTelemetryPoint
  } = useBESSStore();

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const simulate = useCallback(() => {
    // CRITICAL FIX: Read fresh state directly to avoid dependency cycles and Ref instability
    const state = useBESSStore.getState();
    const { telemetry: currentTelemetry, activeTest } = state;
    const { soc, activePower, temperature, operatingMode } = currentTelemetry;
    const isTestRunning = activeTest?.status === 'RUNNING';

    // Generate new values based on current state
    const newSoc = generateSoC(soc, operatingMode);
    const newActivePower = generateActivePower(activePower, operatingMode);
    const newReactivePower = generateReactivePower(newActivePower);
    const newFrequency = generateFrequency(60.02, isTestRunning);
    const newVoltage = generateVoltage(480);
    const newTemperature = generateTemperature(temperature, newActivePower);

    const timestamp = new Date().toISOString();

    // Update current telemetry
    // This updates the store, but since we don't depend on 'telemetry' in this callback,
    // 'simulate' does not get recreated, so useEffect doesn't re-run.
    updateTelemetry({
      soc: newSoc,
      activePower: newActivePower,
      reactivePower: newReactivePower,
      frequency: newFrequency,
      voltage: newVoltage,
      temperature: newTemperature,
      timestamp,
    });

    // Add to history for charts
    const dataPoint: TelemetryDataPoint = {
      timestamp,
      time: Date.now() - startTimeRef.current,
      soc: newSoc,
      activePower: newActivePower,
      reactivePower: newReactivePower,
      voltage: newVoltage,
      frequency: newFrequency,
      temperature: newTemperature,
    };
    addTelemetryPoint(dataPoint);

    // Update test progress if running
    if (activeTest?.status === 'RUNNING') {
      const elapsed = Date.now() - new Date(activeTest.startTime).getTime();
      const scenario = state.scenarios.find(s => s.id === activeTest.scenarioId);
      if (scenario) {
        const progress = Math.min(100, (elapsed / (scenario.duration * 1000)) * 100);
        state.updateTestProgress(progress);

        // Auto-complete test when duration reached
        if (progress >= 100) {
          state.completeTest([
            {
              criteriaId: '1',
              description: 'Test completed successfully',
              passed: Math.random() > 0.2,
              actualValue: 'Completed',
              expectedValue: 'Completed',
            },
          ]);
        }
      }
    }
  }, [updateTelemetry, addTelemetryPoint]); // Stable dependencies only

  useEffect(() => {
    if (isSimulating) {
      // Run once immediately on mount/enable
      simulate();

      // Set up interval
      intervalRef.current = window.setInterval(simulate, SIMULATION_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulating, simulate]);

  return {
    isSimulating,
    telemetry,
  };
};

export default useSimulatedData;
