#!/usr/bin/env node
/// <reference types="node" />
import { DEFAULT_CONFIG, type SimulationConfig } from './simulation/types';
import { validateConfig } from './simulation/core/utils';
import { runSimulation } from './simulation/core/engine'; 
import { round } from './simulation/core/utils';

const args = process.argv.slice(2);
const config: SimulationConfig = { ...DEFAULT_CONFIG };

for (const arg of args) {
  const [key, value] = arg.split('=');
  if (key in config) {
    // @ts-ignore - trusting the user here for simplicity
    config[key] = isNaN(Number(value)) ? value : Number(value);
  }
}

const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('❌ Invalid configuration:');
  for (const err of errors) {
    console.error(`  - ${err.field}: ${err.message} (value: ${err.value})`);
  }
  process.exit(1);
}

console.log('⚙️ Running simulation with configuration:', config);

const start = performance.now();
const result = runSimulation(config);
const duration = performance.now() - start;

console.log('\n✅ Simulation complete!');
console.log(`Computation time: ${round(duration)} ms`);
console.log(`Total energy delivered: ${round(result.totalEnergyKWh)} kWh`);
console.log(`Actual max power: ${round(result.actualMaxPowerKW)} kW`);
console.log(`Concurrency factor: ${round(result.concurrencyFactor * 100)} %`);

// Debug output
console.log(`\n🔍 Debug info:`);
console.log(`Sessions created: ${result.chargingSessions.length}`);
if (result.chargingSessions.length > 0) {
  const avgDuration = result.chargingSessions.reduce((sum, s) => sum + (s.departureTick - s.arrivalTick), 0) / result.chargingSessions.length;
  console.log(`Average session duration: ${round(avgDuration, 1)} ticks (${round(avgDuration * 0.25, 1)} hours)`);
  console.log(`Average energy per session: ${round(result.chargingSessions.reduce((sum, s) => sum + s.energyNeededKWh, 0) / result.chargingSessions.length, 1)} kWh`);
}
console.log(`Theoretical max power: ${round(result.theoreticalMaxPowerKW)} kW`);
