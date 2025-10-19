export interface SimulationConfig {
  numChargers: number;
  chargerPowerKW: number;
  carEfficiencyKWhPer100Km: number;
  arrivalMultiplier: number;
  useDST?: boolean;
  seed?: string;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  numChargers: 20,
  chargerPowerKW: 11,
  carEfficiencyKWhPer100Km: 18,
  arrivalMultiplier: 1.0,
  useDST: false,
};

export interface ChargingSession {
  sessionId: string;
  chargerId: number;
  arrivalTick: number;
  departureTick: number;
  energyNeededKWh: number;
  distanceKm: number;
}

export interface ChargerState {
  id: number;
  isOccupied: boolean;
  currentSession: ChargingSession | null;
  availableAt: number; 
}

export interface SimulationResult {
  totalEnergyKWh: number;
  theoreticalMaxPowerKW: number;
  actualMaxPowerKW: number;
  concurrencyFactor: number; // actualMax / theoreticalMax
  powerDemandPerTick: number[];
  chargingSessions: ChargingSession[];
  metadata: SimulationMetadata;
}

export interface SimulationMetadata {
  isRealData: boolean;
  computationTimeMs: number;
  timestamp: string; 
  configHash: string;
  seedUsed?: string;
}

export type HourOfDay = number;

/**
 * Probability of an EV arriving during this hour
 * (T1 distribution)
 */
export interface ArrivalProbability {
  hour: HourOfDay;
  probability: number;
}

/**
 * Probability of a given charging demand
 * (T2 distribution)
 * Format: [distanceKm, probability]
 */
export type ChargingDemand = [distanceKm: number, probability: number];

export interface ValidationError {
  field: keyof SimulationConfig | string;
  message: string;
  value?: unknown;
}

export interface SimulationError {
  type: 'CONFIG' | 'RUNTIME' | 'UNKNOWN';
  message: string;
  stack?: string;
}

export interface SimulationRunResponse {
  result: SimulationResult | null;
  error?: SimulationError;
  isRunning: boolean;
}
