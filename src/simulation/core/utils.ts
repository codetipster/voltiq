import seedrandom from 'seedrandom';
import type { HourOfDay, SimulationConfig, ValidationError } from '../types';
import {
  MIN_CHARGERS,
  MAX_CHARGERS,
  MIN_CHARGER_POWER,
  MAX_CHARGER_POWER,
  MIN_CAR_EFFICIENCY,
  MAX_CAR_EFFICIENCY,
  MIN_ARRIVAL_MULTIPLIER,
  MAX_ARRIVAL_MULTIPLIER,
  TICKS_PER_DAY,
  TICKS_PER_HOUR,
} from './constants';

export class SeededRandom {
  private rng: seedrandom.PRNG;

  constructor(seed?: string) {
    this.rng = seedrandom(seed || Date.now().toString());
  }

  next(): number { 
    return this.rng();
  }

  happens(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Sample from a weighted probability distribution
   * Uses inverse transform sampling
   * @param items - Array of [value, probability] pairs
   * @returns Selected value
   */
  sample<T>(items: Array<[T, number]>): T {
    const rand = this.next();
    let cumulative = 0;

    for (const [value, probability] of items) {
      cumulative += probability;
      if (rand <= cumulative) {
        return value;
      }
    }

    return items[items.length - 1][0];
  }
}

/**
 * Convert tick number to hour of day
 * 
 * @param tick - Tick number (0-35039)
 * @returns Hour of day (0-23)
 * 
 */
export function getHourFromTick(tick: number): HourOfDay {
  const tickOfDay = tick % TICKS_PER_DAY; 
  return Math.floor(tickOfDay / TICKS_PER_HOUR) as HourOfDay; 
}

/**
 * Convert tick to human-readable timestamp
 * 
 * @param tick - Tick number
 * @returns String like "Day 1, 00:15" or "Day 365, 23:45"
 */
export function tickToTimestamp(tick: number): string {
  const day = Math.floor(tick / TICKS_PER_DAY) + 1; // 1-365
  const tickOfDay = tick % TICKS_PER_DAY;
  const hour = Math.floor(tickOfDay / TICKS_PER_HOUR);
  const minute = (tickOfDay % TICKS_PER_HOUR) * 15;

  return `Day ${day}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function validateConfig(config: SimulationConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isInteger(config.numChargers)) {
    errors.push({
      field: 'numChargers',
      message: 'Must be an integer',
      value: config.numChargers,
    });
  } else if (config.numChargers < MIN_CHARGERS || config.numChargers > MAX_CHARGERS) {
    errors.push({
      field: 'numChargers',
      message: `Must be between ${MIN_CHARGERS} and ${MAX_CHARGERS}`,
      value: config.numChargers,
    });
  }

  if (config.chargerPowerKW < MIN_CHARGER_POWER || config.chargerPowerKW > MAX_CHARGER_POWER) {
    errors.push({
      field: 'chargerPowerKW',
      message: `Must be between ${MIN_CHARGER_POWER} and ${MAX_CHARGER_POWER} kW`,
      value: config.chargerPowerKW,
    });
  }

  if (config.carEfficiencyKWhPer100Km < MIN_CAR_EFFICIENCY || config.carEfficiencyKWhPer100Km > MAX_CAR_EFFICIENCY) {
    errors.push({
      field: 'carEfficiencyKWhPer100Km',
      message: `Must be between ${MIN_CAR_EFFICIENCY} and ${MAX_CAR_EFFICIENCY} kWh/100km`,
      value: config.carEfficiencyKWhPer100Km,
    });
  }

  if (config.arrivalMultiplier < MIN_ARRIVAL_MULTIPLIER || config.arrivalMultiplier > MAX_ARRIVAL_MULTIPLIER) {
    errors.push({
      field: 'arrivalMultiplier',
      message: `Must be between ${MIN_ARRIVAL_MULTIPLIER} and ${MAX_ARRIVAL_MULTIPLIER}`,
      value: config.arrivalMultiplier,
    });
  }

  return errors;
}

/**
 * Generate deterministic hash of configuration
 * Used for caching simulation results
 */
export function hashConfig(config: SimulationConfig): string {
  const str = JSON.stringify(config);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  
  return hash.toString(36); 
}

/**
 * Calculate energy needed for a given distance
 * 
 * @param distanceKm - Distance to travel (km)
 * @param efficiencyKWhPer100Km - Car efficiency
 * @returns Energy needed (kWh)
 */
export function calculateEnergyNeeded(
  distanceKm: number,
  efficiencyKWhPer100Km: number
): number {
  return (distanceKm / 100) * efficiencyKWhPer100Km;
}

/**
 * Calculate charging duration in ticks
 * 
 * @param energyKWh - Energy needed (kWh)
 * @param chargerPowerKW - Charger power (kW)
 * @returns Number of ticks (rounded up)
 * 
 */
export function calculateChargingDuration(
  energyKWh: number,
  chargerPowerKW: number
): number {
  const hours = energyKWh / chargerPowerKW;
  const ticks = hours * TICKS_PER_HOUR;
  return Math.ceil(ticks);
}

/**
 * Round number to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}