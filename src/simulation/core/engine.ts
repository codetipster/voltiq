import type {
  SimulationConfig,
  SimulationResult,
  ChargerState,
  ChargingSession,
} from '../types';

import {
  ARRIVAL_PROBABILITIES,
  CHARGING_DEMANDS,
  TICKS_PER_YEAR,
} from './constants';

import {
  SeededRandom,
  getHourFromTick,
  calculateEnergyNeeded,
  calculateChargingDuration,
  validateConfig,
  hashConfig,
  round,
} from './utils';

export class EVChargingSimulator {
  private config: SimulationConfig;
  private random: SeededRandom;
  private chargers: ChargerState[];
  private sessions: ChargingSession[] = [];
  
  private powerDemand: Float32Array;
  private energyConsumed: Float32Array;

  constructor(config: SimulationConfig) {
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new Error(
        `Invalid configuration:\n${errors.map(e => `  - ${e.field}: ${e.message}`).join('\n')}`
      );
    }

    this.config = config;
    this.random = new SeededRandom(config.seed);
    this.chargers = this.initializeChargers();
    this.powerDemand = new Float32Array(TICKS_PER_YEAR);
    this.energyConsumed = new Float32Array(TICKS_PER_YEAR);
  }

  private initializeChargers(): ChargerState[] {
    return Array.from({ length: this.config.numChargers }, (_, i) => ({
      id: i,
      isOccupied: false,
      currentSession: null,
      availableAt: 0,
    }));
  }

  public run(): SimulationResult {
    const startTime = performance.now();

    for (let tick = 0; tick < TICKS_PER_YEAR; tick++) {
      this.releaseCompletedCharges(tick);
      this.handleArrivals(tick);
      this.recordPowerDemand(tick);
    }

    const computationTime = performance.now() - startTime;
    return this.buildResult(computationTime);
  }

  private releaseCompletedCharges(currentTick: number): void {
    for (const charger of this.chargers) {
      if (charger.isOccupied && charger.availableAt <= currentTick) {
        charger.isOccupied = false;
        charger.currentSession = null;
      }
    }
  }

  
  private handleArrivals(tick: number): void {
    const hour = getHourFromTick(tick);
    const baseProbability = ARRIVAL_PROBABILITIES[hour];
    // Convert hourly probability to per-tick probability (since 1 tick = 15 min = 0.25 hr)
    const adjustedProbability = (baseProbability / 4) * this.config.arrivalMultiplier;

    // Check each charger individually for arrivals
    for (const charger of this.chargers) {
      if (charger.isOccupied) {
        continue; 
      }

      if (!this.random.happens(adjustedProbability)) {
        continue; 
      }

      const demandKm = this.random.sample(CHARGING_DEMANDS);

      if (demandKm === 0) {
        continue; 
      }

      this.assignCharger(charger, tick, demandKm);
    }
  }

  private assignCharger(
    charger: ChargerState,
    arrivalTick: number,
    demandKm: number
  ): void {
    const energyKWh = calculateEnergyNeeded(
      demandKm,
      this.config.carEfficiencyKWhPer100Km
    );

    const durationTicks = calculateChargingDuration(
      energyKWh,
      this.config.chargerPowerKW
    );

    // Create session record
    const session: ChargingSession = {
      sessionId: `${arrivalTick}-${charger.id}`,
      chargerId: charger.id,
      arrivalTick,
      departureTick: arrivalTick + durationTicks,
      energyNeededKWh: energyKWh,
      distanceKm: demandKm,
    };

    charger.isOccupied = true;
    charger.currentSession = session;
    charger.availableAt = session.departureTick;

    this.sessions.push(session);
  }

  private recordPowerDemand(tick: number): void {
    let totalPower = 0;
    let totalEnergyThisTick = 0;

    for (const charger of this.chargers) {
      if (charger.isOccupied && charger.currentSession) {
        totalPower += this.config.chargerPowerKW;
        
        // Calculate exact energy consumed this tick
        const session = charger.currentSession;
        const totalDuration = (session.energyNeededKWh / this.config.chargerPowerKW) * 4; 
        const fullTicks = Math.floor(totalDuration);
        const remainingFraction = totalDuration - fullTicks;
        const energyPerFullTick = this.config.chargerPowerKW * 0.25; 
        
        const ticksRemaining = session.departureTick - tick;
        
        if (ticksRemaining > 1) {
          // Full tick consumption
          totalEnergyThisTick += energyPerFullTick;
        } else if (ticksRemaining === 1 && remainingFraction > 0) {
          // Last tick with fractional energy
          totalEnergyThisTick += this.config.chargerPowerKW * (remainingFraction * 0.25);
        } else if (ticksRemaining === 1 && remainingFraction === 0) {
          // Last tick with full energy (exact duration)
          totalEnergyThisTick += energyPerFullTick;
        }
      }
    }

    this.powerDemand[tick] = totalPower;
    this.energyConsumed[tick] = totalEnergyThisTick;
  }

  private buildResult(computationTime: number): SimulationResult {
    // Calculate total energy actually consumed (not just requested)
    const totalEnergy = this.energyConsumed.reduce(
      (sum, energy) => sum + energy,
      0
    );

    const theoreticalMax = this.config.numChargers * this.config.chargerPowerKW;

    const actualMax = this.powerDemand.reduce(
      (max, value) => Math.max(max, value),
      0
    );

    const concurrencyFactor = actualMax / theoreticalMax;
    
    // Calculate average concurrency (typical daily grid load utilization)
    const averagePower = this.powerDemand.reduce((sum, power) => sum + power, 0) / TICKS_PER_YEAR;
    const averageConcurrency = averagePower / theoreticalMax;

    return {
      totalEnergyKWh: round(totalEnergy, 2),
      theoreticalMaxPowerKW: round(theoreticalMax, 2),
      actualMaxPowerKW: round(actualMax, 2),
      concurrencyFactor: round(concurrencyFactor, 4),
      chargingSessions: this.sessions,
      powerDemandPerTick: Array.from(this.powerDemand),
      metadata: {
        isRealData: true,
        computationTimeMs: round(computationTime, 0),
        timestamp: new Date().toISOString(),
        configHash: hashConfig(this.config),
        averageConcurrency: round(averageConcurrency, 4),
        averagePowerKW: round(averagePower, 2),
      },
    };
  }
}

export function runSimulation(config?: Partial<SimulationConfig>): SimulationResult {
  const fullConfig: SimulationConfig = {
    numChargers: 20,
    chargerPowerKW: 11,
    carEfficiencyKWhPer100Km: 18,
    arrivalMultiplier: 1.0,
    ...config,
  };

  const simulator = new EVChargingSimulator(fullConfig);
  return simulator.run();
}