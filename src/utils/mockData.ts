import type { SimulationConfig, SimulationResult, ChargingSession } from '../simulation/types';
import { TICKS_PER_YEAR } from '../simulation/core/constants';

/**
 * Generate mock simulation results based on config
 * Uses simple formulas to make the UI feel reactive
 */
export function generateMockResults(config: SimulationConfig): SimulationResult {
  const {
    numChargers,
    chargerPowerKW,
    arrivalMultiplier,
    carEfficiencyKWhPer100Km,
  } = config;

  // Simple formulas for realistic-looking results
  const theoreticalMax = numChargers * chargerPowerKW;
  
  // Concurrency decreases as chargers increase (statistical effect)
  const baseConcurrency = 0.45 - (numChargers - 20) * 0.01;
  const concurrencyFactor = Math.max(0.25, Math.min(0.65, 
    baseConcurrency * arrivalMultiplier
  ));
  
  const actualMax = theoreticalMax * concurrencyFactor;
  
  // Sessions scale with arrivals and chargers
  const baseSessionsPerYear = 350;
  const totalSessions = Math.floor(
    baseSessionsPerYear * numChargers * arrivalMultiplier
  );
  
  // Energy scales with sessions and efficiency
  const avgEnergyPerSession = 11.5 * (carEfficiencyKWhPer100Km / 18);
  const totalEnergy = totalSessions * avgEnergyPerSession;
  
  // Average power
  const avgPower = actualMax * 0.4;

  // Generate mock sessions
  const sessions = generateMockSessions(
    totalSessions,
    numChargers,
    carEfficiencyKWhPer100Km
  );

  // Generate power demand time series
  const powerDemand = generateMockPowerDemand(
    numChargers,
    chargerPowerKW,
    concurrencyFactor
  );

  return {
    totalEnergyKWh: round(totalEnergy, 2),
    theoreticalMaxPowerKW: round(theoreticalMax, 2),
    actualMaxPowerKW: round(actualMax, 2),
    concurrencyFactor: round(concurrencyFactor, 4),
    chargingSessions: sessions,
    powerDemandPerTick: powerDemand,
    metadata: {
      isRealData: false, // Mark as mock data
      computationTimeMs: Math.random() * 30 + 10, // Fake: 10-40ms
      timestamp: new Date().toISOString(),
      configHash: 'mock',
      averageConcurrency: round(avgPower / theoreticalMax, 4),
      averagePowerKW: round(avgPower, 2),
    },
  };
}

/**
 * Generate mock charging sessions
 */
function generateMockSessions(
  count: number,
  numChargers: number,
  efficiency: number
): ChargingSession[] {
  const sessions: ChargingSession[] = [];
  const ticksPerSession = 96 * 365 / count; // Spread evenly

  for (let i = 0; i < count; i++) {
    const arrivalTick = Math.floor(i * ticksPerSession);
    const distanceKm = sampleDistance();
    const energyKWh = (distanceKm / 100) * efficiency;
    const durationTicks = Math.ceil(energyKWh / 11 * 4); // Assume 11kW avg

    sessions.push({
      sessionId: `mock-${i}`,
      chargerId: i % numChargers,
      arrivalTick,
      departureTick: arrivalTick + durationTicks,
      energyNeededKWh: round(energyKWh, 2),
      distanceKm,
    });
  }

  return sessions;
}

/**
 * Sample distance from typical distribution
 */
function sampleDistance(): number {
  const rand = Math.random();
  if (rand < 0.35) return 0;
  if (rand < 0.45) return 10;
  if (rand < 0.60) return 20;
  if (rand < 0.75) return 50;
  if (rand < 0.90) return 100;
  return 200;
}

/**
 * Generate mock power demand time series
 * Creates realistic daily patterns with peaks
 */
function generateMockPowerDemand(
  numChargers: number,
  chargerPowerKW: number,
  concurrencyFactor: number
): number[] {
  const data = new Array(TICKS_PER_YEAR);
  const maxConcurrent = Math.floor(numChargers * concurrencyFactor);

  for (let tick = 0; tick < TICKS_PER_YEAR; tick++) {
    const tickOfDay = tick % 96; // 96 ticks per day
    const hour = Math.floor(tickOfDay / 4);

    // Daily usage pattern (peaks afternoon/evening)
    let utilizationFactor = 0.1; 

    if (hour >= 8 && hour < 10) utilizationFactor = 0.3; // Morning
    else if (hour >= 10 && hour < 16) utilizationFactor = 0.5; // Midday
    else if (hour >= 16 && hour < 19) utilizationFactor = 0.8; // PEAK
    else if (hour >= 19 && hour < 22) utilizationFactor = 0.4; // Evening

    // Add some randomness
    utilizationFactor *= 0.8 + Math.random() * 0.4;

    const activeChargers = Math.floor(maxConcurrent * utilizationFactor);
    data[tick] = activeChargers * chargerPowerKW;
  }

  return data;
}

/**
 * Round number to specified decimals
 */
function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}