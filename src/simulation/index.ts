/**
 * Voltiq - Main Entry Point
 * 
 * This module provides a complete EV charging simulation system for Task 1.
 * It simulates 20 chargepoints with 11kW power over one year (35,040 ticks)
 * and calculates total energy consumption, peak power demand, and concurrency factors.
 */

export type {
  SimulationConfig,
  SimulationResult,
  SimulationMetadata,
  ChargingSession,
  ChargerState,
  ChargingDemand,
  HourOfDay,
  ArrivalProbability,
  ValidationError,
  SimulationError,
  SimulationRunResponse,
} from './types';

export { EVChargingSimulator, runSimulation } from './core/engine';

export {
  TICKS_PER_HOUR,
  TICKS_PER_DAY,
  TICKS_PER_YEAR,
  MINUTES_PER_TICK,
  
  // Probability distributions (T1 & T2 tables)
  ARRIVAL_PROBABILITIES,
  CHARGING_DEMANDS,
  
  // Validation ranges
  MIN_CHARGERS,
  MAX_CHARGERS,
  MIN_CHARGER_POWER,
  MAX_CHARGER_POWER,
  MIN_CAR_EFFICIENCY,
  MAX_CAR_EFFICIENCY,
  MIN_ARRIVAL_MULTIPLIER,
  MAX_ARRIVAL_MULTIPLIER,
  
  EXPECTED_RANGES,
} from './core/constants';

export { DEFAULT_CONFIG } from './types';

export {
  SeededRandom,
  getHourFromTick,
  tickToTimestamp,
  validateConfig,
  hashConfig,
  calculateEnergyNeeded,
  calculateChargingDuration,
  round,
} from './core/utils';

import type { SimulationConfig, SimulationResult, ValidationError } from './types';
import { runSimulation } from './core/engine';
import { validateConfig } from './core/utils';
import { EXPECTED_RANGES } from './core/constants';

export function runTask1Simulation(seed?: string): SimulationResult {
  return runSimulation({ seed });
}

export function runCustomSimulation(config: Partial<SimulationConfig>): SimulationResult {
  return runSimulation(config);
}

export function validateSimulationConfig(config: SimulationConfig): ValidationError[] {
  return validateConfig(config);
}

export function getExpectedRanges() {
  return EXPECTED_RANGES;
}
