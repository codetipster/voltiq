
import type { HourOfDay, ChargingDemand } from '../types';

export const TICKS_PER_HOUR = 4;
export const TICKS_PER_DAY = 96;
export const TICKS_PER_YEAR = 35040;
export const MINUTES_PER_TICK = 15;

/**
 * Probability of an EV arriving at a charger for each hour of the day
 * Note: These probabilities sum to 100% across all hours
 * 
 * Pattern: Low overnight (0.94%), peaks in afternoon/evening (10.38% at 4-7pm)
 */
export const ARRIVAL_PROBABILITIES: Record<HourOfDay, number> = {
  0: 0.0094,   // 00:00-01:00
  1: 0.0094,   // 01:00-02:00
  2: 0.0094,   // 02:00-03:00
  3: 0.0094,   // 03:00-04:00
  4: 0.0094,   // 04:00-05:00
  5: 0.0094,   // 05:00-06:00
  6: 0.0094,   // 06:00-07:00
  7: 0.0094,   // 07:00-08:00
  8: 0.0283,   // 08:00-09:00 (morning increase)
  9: 0.0283,   // 09:00-10:00
  10: 0.0566,  // 10:00-11:00 (midday)
  11: 0.0566,  // 11:00-12:00
  12: 0.0566,  // 12:00-13:00
  13: 0.0755,  // 13:00-14:00 (afternoon rise)
  14: 0.0755,  // 14:00-15:00
  15: 0.0755,  // 15:00-16:00
  16: 0.1038,  // 16:00-17:00 (PEAK HOURS)
  17: 0.1038,  // 17:00-18:00 (PEAK HOURS)
  18: 0.1038,  // 18:00-19:00 (PEAK HOURS)
  19: 0.0472,  // 19:00-20:00 (evening decline)
  20: 0.0472,  // 20:00-21:00
  21: 0.0472,  // 21:00-22:00
  22: 0.0094,  // 22:00-23:00 (night)
  23: 0.0094,  // 23:00-24:00
};

/**
 * Distribution of charging demand in kilometers
 * Format: [distanceKm, probability]
 * 
 * Key insight: 34.31% of arrivals don't actually charge (distance = 0)
 * This represents people who arrive but decide not to charge
 */
export const CHARGING_DEMANDS: ChargingDemand[] = [
  [0, 0.3431],      // 34.31% - No charging needed
  [5, 0.0490],      // 4.90%  - Very short trip
  [10, 0.0980],     // 9.80%  - Short trip
  [20, 0.1176],     // 11.76% - Medium-short trip
  [30, 0.0882],     // 8.82%  - Medium trip
  [50, 0.1176],     // 11.76% - Medium-long trip
  [100, 0.1078],    // 10.78% - Long trip
  [200, 0.0490],    // 4.90%  - Very long trip
  [300, 0.0294],    // 2.94%  - Extreme trip
];

// Validation: probabilities should sum to 1.0
const TOTAL_PROBABILITY = CHARGING_DEMANDS.reduce((sum, [_, prob]) => sum + prob, 0);
if (Math.abs(TOTAL_PROBABILITY - 1.0) > 0.0001) {
  console.warn(`Warning: Charging demand probabilities sum to ${TOTAL_PROBABILITY}, not 1.0`);
}

/** Minimum allowed number of chargers */
export const MIN_CHARGERS = 1;

/** Maximum allowed number of chargers */
export const MAX_CHARGERS = 30;

/** Minimum charging power (kW) */
export const MIN_CHARGER_POWER = 3.7;

/** Maximum charging power (kW) - DC fast charging */
export const MAX_CHARGER_POWER = 350;

/** Minimum car efficiency (kWh/100km) */
export const MIN_CAR_EFFICIENCY = 10;

/** Maximum car efficiency (kWh/100km) */
export const MAX_CAR_EFFICIENCY = 30;

/** Minimum arrival multiplier (20%) */
export const MIN_ARRIVAL_MULTIPLIER = 0.2;

/** Maximum arrival multiplier (200%) */
export const MAX_ARRIVAL_MULTIPLIER = 2.0;

/**
 * Expected ranges for 20 chargers @ 11kW
 * These are used for validation in tests
 */
export const EXPECTED_RANGES = {
  actualMaxPowerKW: {
    min: 77,
    max: 121,
  },
  concurrencyFactor: {
    min: 0.35,
    max: 0.55,
  },
};