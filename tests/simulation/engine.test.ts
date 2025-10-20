import { describe, it, expect } from 'vitest';
import {
  EVChargingSimulator,
  runSimulation,
  DEFAULT_CONFIG,
  validateConfig,
} from '../../src/simulation';

describe('EVChargingSimulator', () => {
  
  describe('Task 1: Core Requirements', () => {
    it('should match expected ranges for 20 chargers @ 11kW', () => {
      const simulator = new EVChargingSimulator({
        ...DEFAULT_CONFIG,
        seed: 'test-seed-123',
      });

      const result = simulator.run();

      // Theoretical max should be exactly 220kW
      expect(result.theoreticalMaxPowerKW).toBe(220);

      // Actual max power should be within expected range (77-121 kW)
      expect(result.actualMaxPowerKW).toBeGreaterThanOrEqual(77);
      expect(result.actualMaxPowerKW).toBeLessThanOrEqual(121);

      // Concurrency factor should be 35-55%
      expect(result.concurrencyFactor).toBeGreaterThanOrEqual(0.35);
      expect(result.concurrencyFactor).toBeLessThanOrEqual(0.55);

      console.log('✓ Task 1 Validation:');
      console.log(`  Actual Max: ${result.actualMaxPowerKW} kW (expected: 77-121 kW)`);
      console.log(`  Concurrency: ${(result.concurrencyFactor * 100).toFixed(1)}% (expected: 35-55%)`);
      console.log(`  Total Energy: ${result.totalEnergyKWh.toFixed(0)} kWh`);
      console.log(`  Sessions: ${result.chargingSessions.length}`);
    });

    it('should generate 35,040 power demand data points (365 days × 96 ticks/day)', () => {
      const result = runSimulation({ seed: 'length-test' });
      expect(result.powerDemandPerTick).toHaveLength(35040);
    });

    it('should calculate correct theoretical maximum for various configs', () => {
      const configs = [
        { numChargers: 10, chargerPowerKW: 11, expected: 110 },
        { numChargers: 20, chargerPowerKW: 11, expected: 220 },
        { numChargers: 20, chargerPowerKW: 22, expected: 440 },
      ];

      configs.forEach(({ numChargers, chargerPowerKW, expected }) => {
        const result = runSimulation({ numChargers, chargerPowerKW, seed: 'theo-test' });
        expect(result.theoreticalMaxPowerKW).toBe(expected);
      });
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce identical results with same seed', () => {
      const config = { ...DEFAULT_CONFIG, seed: 'deterministic-test' };

      const result1 = new EVChargingSimulator(config).run();
      const result2 = new EVChargingSimulator(config).run();

      expect(result1.totalEnergyKWh).toBe(result2.totalEnergyKWh);
      expect(result1.actualMaxPowerKW).toBe(result2.actualMaxPowerKW);
      expect(result1.concurrencyFactor).toBe(result2.concurrencyFactor);
      expect(result1.chargingSessions.length).toBe(result2.chargingSessions.length);
    });
  });

  describe('Bonus: Concurrency Factor vs Number of Chargers', () => {
    it('should show decreasing concurrency factor as chargers increase', () => {
      const results: Array<{ numChargers: number; concurrencyFactor: number }> = [];

      for (let numChargers = 5; numChargers <= 25; numChargers += 5) {
        const result = runSimulation({
          numChargers,
          seed: 'concurrency-test',
        });
        results.push({
          numChargers,
          concurrencyFactor: result.concurrencyFactor,
        });
      }

      console.log('\n✓ Concurrency Factor vs Number of Chargers:');
      results.forEach(({ numChargers, concurrencyFactor }) => {
        console.log(`  ${numChargers} chargers: ${(concurrencyFactor * 100).toFixed(1)}%`);
      });

      // Concurrency should decrease as chargers increase
      const firstFactor = results[0].concurrencyFactor;
      const lastFactor = results[results.length - 1].concurrencyFactor;
      expect(lastFactor).toBeLessThan(firstFactor);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain valid physical constraints', () => {
      const result = runSimulation({ seed: 'integrity-test' });

      expect(result.totalEnergyKWh).toBeGreaterThanOrEqual(0);
      expect(result.actualMaxPowerKW).toBeGreaterThanOrEqual(0);
      expect(result.concurrencyFactor).toBeGreaterThanOrEqual(0);
      expect(result.concurrencyFactor).toBeLessThanOrEqual(1.0);

      // Actual max can't exceed theoretical max
      expect(result.actualMaxPowerKW).toBeLessThanOrEqual(
        result.theoreticalMaxPowerKW
      );

      // All power demand values should be valid
      result.powerDemandPerTick.forEach((power) => {
        expect(power).toBeGreaterThanOrEqual(0);
        expect(power).toBeLessThanOrEqual(result.theoreticalMaxPowerKW);
      });
    });

    it('should create valid charging sessions', () => {
      const result = runSimulation({ seed: 'session-test' });

      expect(result.chargingSessions.length).toBeGreaterThan(0);

      // Verify first few sessions have valid data
      result.chargingSessions.slice(0, 10).forEach((session) => {
        expect(session.departureTick).toBeGreaterThan(session.arrivalTick);
        expect(session.energyNeededKWh).toBeGreaterThan(0);
        expect(session.distanceKm).toBeGreaterThan(0);
        expect(session.chargerId).toBeGreaterThanOrEqual(0);
        expect(session.chargerId).toBeLessThan(DEFAULT_CONFIG.numChargers);
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should reject invalid configurations', () => {
      // Invalid number of chargers
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          numChargers: 0,
        });
      }).toThrow('Invalid configuration');

      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          numChargers: 100,
        });
      }).toThrow('Invalid configuration');

      // Invalid charger power
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          chargerPowerKW: 1,
        });
      }).toThrow('Invalid configuration');

      // Invalid arrival multiplier
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          arrivalMultiplier: 0.1,
        });
      }).toThrow('Invalid configuration');
    });

    it('should accept valid configurations', () => {
      const validConfig = DEFAULT_CONFIG;
      const errors = validateConfig(validConfig);
      expect(errors).toHaveLength(0);

      // Should not throw
      expect(() => {
        new EVChargingSimulator(validConfig);
      }).not.toThrow();
    });
  });

  describe('Charger Blocking Logic', () => {
    it('should not allow occupied chargers to accept new arrivals', () => {
      const result = runSimulation({ 
        numChargers: 1, 
        seed: 'blocking-test',
        arrivalMultiplier: 2.0, 
      });

      // With only 1 charger and high traffic, verify sessions don't overlap
      const sessions = result.chargingSessions
        .filter(s => s.chargerId === 0)
        .sort((a, b) => a.arrivalTick - b.arrivalTick);

      for (let i = 1; i < sessions.length; i++) {
        const prevSession = sessions[i - 1];
        const currentSession = sessions[i];
        
        // Current session should start after previous one ends
        expect(currentSession.arrivalTick).toBeGreaterThanOrEqual(
          prevSession.departureTick
        );
      }

      console.log(`✓ Verified ${sessions.length} sessions don't overlap on single charger`);
    });
  });
});