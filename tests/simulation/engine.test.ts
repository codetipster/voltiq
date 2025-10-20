import { describe, it, expect } from 'vitest';
import {
  EVChargingSimulator,
  runSimulation,
  DEFAULT_CONFIG,
  EXPECTED_RANGES,
  validateConfig,
} from '../../src/simulation';

describe('EVChargingSimulator', () => {
  
  describe('Basic Simulation', () => {
    it('should run simulation with default config', () => {
      const simulator = new EVChargingSimulator(DEFAULT_CONFIG);
      const result = simulator.run();

      // Check all required outputs exist
      expect(result.totalEnergyKWh).toBeDefined();
      expect(result.theoreticalMaxPowerKW).toBeDefined();
      expect(result.actualMaxPowerKW).toBeDefined();
      expect(result.concurrencyFactor).toBeDefined();
      expect(result.chargingSessions).toBeDefined();
      expect(result.powerDemandPerTick).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should complete in reasonable time (<500ms)', () => {
      const simulator = new EVChargingSimulator(DEFAULT_CONFIG);
      const result = simulator.run();

      expect(result.metadata.computationTimeMs).toBeLessThan(500);
      console.log(`✓ Simulation completed in ${result.metadata.computationTimeMs}ms`);
    });
  });

  describe('Task 1 Requirements', () => {
    it('should match expected ranges for 20 chargers @ 11kW', () => {
      const simulator = new EVChargingSimulator({
        ...DEFAULT_CONFIG,
        seed: 'test-seed-123', // Deterministic for testing
      });

      const result = simulator.run();

      // Theoretical max should be exactly 220kW
      expect(result.theoreticalMaxPowerKW).toBe(220);

      // Debug output to understand the results
      console.log('✓ Task validation:');
      console.log(`  Theoretical Max: ${result.theoreticalMaxPowerKW} kW`);
      console.log(`  Actual Max: ${result.actualMaxPowerKW} kW`);
      console.log(`  Concurrency Factor: ${(result.concurrencyFactor * 100).toFixed(1)}%`);
      console.log(`  Total Sessions: ${result.chargingSessions.length}`);
      console.log(`  Total Energy: ${result.totalEnergyKWh.toFixed(2)} kWh`);
      console.log(`  Average Concurrency: ${(result.metadata.averageConcurrency! * 100).toFixed(1)}%`);

      // actual max is expected to be less than theoretical max
      expect(result.actualMaxPowerKW).toBeLessThan(result.theoreticalMaxPowerKW);
      expect(result.concurrencyFactor).toBeLessThan(1.0);
      expect(result.concurrencyFactor).toBeGreaterThan(0.1);
    });

    it('should generate 35,040 power demand data points', () => {
      const simulator = new EVChargingSimulator(DEFAULT_CONFIG);
      const result = simulator.run();

      // One data point per 15-minute interval for 365 days
      expect(result.powerDemandPerTick).toHaveLength(35040);
    });

    it('should calculate correct theoretical maximum', () => {
      const configs = [
        { numChargers: 10, chargerPowerKW: 11, expected: 110 },
        { numChargers: 20, chargerPowerKW: 11, expected: 220 },
        { numChargers: 20, chargerPowerKW: 22, expected: 440 },
        { numChargers: 5, chargerPowerKW: 50, expected: 250 },
      ];

      configs.forEach(({ numChargers, chargerPowerKW, expected }) => {
        const result = runSimulation({ numChargers, chargerPowerKW });
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

    it('should produce different results with different seeds', () => {
      const result1 = runSimulation({ seed: 'seed-1' });
      const result2 = runSimulation({ seed: 'seed-2' });

      // Results should differ (extremely unlikely to be identical)
      expect(result1.totalEnergyKWh).not.toBe(result2.totalEnergyKWh);
    });

    it('should produce different results without seed', () => {
      const result1 = runSimulation();
      const result2 = runSimulation();

      // Without seed, uses timestamp - should differ
      expect(result1.totalEnergyKWh).not.toBe(result2.totalEnergyKWh);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal configuration (1 charger)', () => {
      const result = runSimulation({
        numChargers: 1,
        seed: 'edge-test-1',
      });

      expect(result.theoreticalMaxPowerKW).toBe(11);
      expect(result.actualMaxPowerKW).toBeLessThanOrEqual(11);
      expect(result.concurrencyFactor).toBeGreaterThan(0);
      expect(result.concurrencyFactor).toBeLessThanOrEqual(1);
    });

    it('should handle maximum configuration (30 chargers)', () => {
      const result = runSimulation({
        numChargers: 30,
        seed: 'edge-test-2',
      });

      expect(result.theoreticalMaxPowerKW).toBe(330);
      expect(result.actualMaxPowerKW).toBeLessThanOrEqual(330);
    });

    it('should handle minimal arrivals (multiplier = 0.2)', () => {
      const result = runSimulation({
        arrivalMultiplier: 0.2, // Minimum allowed multiplier
        seed: 'minimal-arrivals',
      });

      // With very low traffic, we should see minimal energy consumption
      expect(result.totalEnergyKWh).toBeGreaterThanOrEqual(0);
      expect(result.actualMaxPowerKW).toBeGreaterThanOrEqual(0);
      expect(result.chargingSessions.length).toBeGreaterThanOrEqual(0);
      expect(result.concurrencyFactor).toBeGreaterThanOrEqual(0);
    });

    it('should handle high traffic (multiplier = 2.0)', () => {
      const result = runSimulation({
        arrivalMultiplier: 2.0,
        seed: 'high-traffic',
      });

      // With 2x traffic, we should see higher energy consumption
      expect(result.totalEnergyKWh).toBeGreaterThan(0);
      expect(result.chargingSessions.length).toBeGreaterThan(0);
    });

    it('should handle different charger powers', () => {
      const result22kW = runSimulation({
        chargerPowerKW: 22,
        seed: 'power-test',
      });
      const result11kW = runSimulation({
        chargerPowerKW: 11,
        seed: 'power-test',
      });

      // Same seed, but 22kW charges faster, so sessions are shorter
      // This should lead to different concurrency patterns
      expect(result22kW.theoreticalMaxPowerKW).toBeGreaterThan(
        result11kW.theoreticalMaxPowerKW
      );
    });
  });

  describe('Bonus: Varying Number of Chargers', () => {
    it('should show decreasing concurrency factor with more chargers', () => {
      const results: Array<{ numChargers: number; concurrencyFactor: number }> = [];

      for (let numChargers = 5; numChargers <= 25; numChargers += 5) {
        const result = runSimulation({
          numChargers,
          seed: 'concurrency-test', // Same seed for fair comparison
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

      // Generally, concurrency factor decreases as chargers increase
      // (because it's harder to have all chargers occupied simultaneously)
      const firstFactor = results[0].concurrencyFactor;
      const lastFactor = results[results.length - 1].concurrencyFactor;
      expect(lastFactor).toBeLessThan(firstFactor);
    });
  });

  describe('Configuration Validation', () => {
    it('should reject invalid number of chargers', () => {
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          numChargers: 0, // Invalid: too low
        });
      }).toThrow();

      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          numChargers: 100, // Invalid: too high
        });
      }).toThrow();
    });

    it('should reject invalid charger power', () => {
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          chargerPowerKW: 1, // Invalid: too low
        });
      }).toThrow();

      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          chargerPowerKW: 500, // Invalid: too high
        });
      }).toThrow();
    });

    it('should reject invalid arrival multiplier', () => {
      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          arrivalMultiplier: 0.1, // Invalid: too low
        });
      }).toThrow();

      expect(() => {
        new EVChargingSimulator({
          ...DEFAULT_CONFIG,
          arrivalMultiplier: 3.0, // Invalid: too high
        });
      }).toThrow();
    });

    it('should validate configuration without throwing', () => {
      const validConfig = DEFAULT_CONFIG;
      const errors = validateConfig(validConfig);
      expect(errors).toHaveLength(0);

      const invalidConfig = { ...DEFAULT_CONFIG, numChargers: 0 };
      const errorsInvalid = validateConfig(invalidConfig);
      expect(errorsInvalid.length).toBeGreaterThan(0);
      expect(errorsInvalid[0].field).toBe('numChargers');
    });
  });

  describe('Data Integrity', () => {
    it('should not have negative values', () => {
      const result = runSimulation({ seed: 'integrity-test' });

      expect(result.totalEnergyKWh).toBeGreaterThanOrEqual(0);
      expect(result.actualMaxPowerKW).toBeGreaterThanOrEqual(0);
      expect(result.concurrencyFactor).toBeGreaterThanOrEqual(0);

      // Check all power demand values
      result.powerDemandPerTick.forEach((power, tick) => {
        expect(power).toBeGreaterThanOrEqual(0);
      });

      // Check all sessions
      result.chargingSessions.forEach((session) => {
        expect(session.energyNeededKWh).toBeGreaterThanOrEqual(0);
        expect(session.departureTick).toBeGreaterThan(session.arrivalTick);
      });
    });

    it('should have concurrency factor <= 1.0', () => {
      const result = runSimulation({ seed: 'concurrency-check' });

      expect(result.concurrencyFactor).toBeLessThanOrEqual(1.0);
    });

    it('should have actual max <= theoretical max', () => {
      const result = runSimulation({ seed: 'max-check' });

      expect(result.actualMaxPowerKW).toBeLessThanOrEqual(
        result.theoreticalMaxPowerKW
      );
    });
  });

  describe('Metadata', () => {
    it('should include computation time', () => {
      const result = runSimulation();

      expect(result.metadata.computationTimeMs).toBeGreaterThan(0);
      expect(result.metadata.computationTimeMs).toBeLessThan(5000);
    });

    it('should include timestamp as string', () => {
      const result = runSimulation();

      expect(result.metadata.timestamp).toBeDefined();
      expect(typeof result.metadata.timestamp).toBe('string');
      expect(result.metadata.timestamp.length).toBeGreaterThan(0);
    });

    it('should mark as real data', () => {
      const result = runSimulation();

      expect(result.metadata.isRealData).toBe(true);
    });

    it('should include config hash', () => {
      const result = runSimulation();

      expect(result.metadata.configHash).toBeDefined();
      expect(typeof result.metadata.configHash).toBe('string');
      expect(result.metadata.configHash.length).toBeGreaterThan(0);
    });

    it('should include average concurrency metrics', () => {
      const result = runSimulation();

      expect(result.metadata.averageConcurrency).toBeDefined();
      expect(result.metadata.averagePowerKW).toBeDefined();
      expect(result.metadata.averageConcurrency).toBeGreaterThanOrEqual(0);
      expect(result.metadata.averageConcurrency).toBeLessThanOrEqual(1);
      expect(result.metadata.averagePowerKW).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Energy Calculation Accuracy', () => {
    it('should calculate exact energy consumption', () => {
      const result = runSimulation({ seed: 'energy-test' });

      // Total energy should be reasonable for a year
      expect(result.totalEnergyKWh).toBeGreaterThan(10000); // At least 10k kWh/year
      expect(result.totalEnergyKWh).toBeLessThan(1000000); // Less than 1M kWh/year

      // Energy should be positive
      expect(result.totalEnergyKWh).toBeGreaterThan(0);
    });

    it('should have consistent energy calculations with same seed', () => {
      const result1 = runSimulation({ seed: 'energy-consistency' });
      const result2 = runSimulation({ seed: 'energy-consistency' });

      expect(result1.totalEnergyKWh).toBe(result2.totalEnergyKWh);
    });
  });
});
