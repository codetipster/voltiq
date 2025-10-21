import type { SimulationConfig, SimulationResult } from '../types/simulation';

// Mock data store
let mockConfigs: SimulationConfig[] = [
  {
    id: '1',
    name: 'Default Configuration',
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-10-15T10:00:00Z',
    parameters: {
      chargePointTypes: [
        { id: 'cp-1', power: 11, quantity: 4 },
      ],
      arrivalProbabilityMultiplier: 100,
      carConsumption: 18,
    },
  },
  {
    id: '2',
    name: 'Mixed Power Station',
    createdAt: '2025-10-16T14:30:00Z',
    updatedAt: '2025-10-16T14:30:00Z',
    parameters: {
      chargePointTypes: [
        { id: 'cp-1', power: 11, quantity: 5 },
        { id: 'cp-2', power: 22, quantity: 3 },
        { id: 'cp-3', power: 50, quantity: 1 },
      ],
      arrivalProbabilityMultiplier: 120,
      carConsumption: 18,
    },
  },
];

let mockResults: SimulationResult[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Create
  async createConfig(config: Omit<SimulationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SimulationConfig> {
    await delay(500);
    const newConfig: SimulationConfig = {
      ...config,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockConfigs.push(newConfig);
    return newConfig;
  },

  // Read all
  async getAllConfigs(): Promise<SimulationConfig[]> {
    await delay(300);
    return [...mockConfigs];
  },

  // Read one
  async getConfig(id: string): Promise<SimulationConfig | null> {
    await delay(200);
    return mockConfigs.find(c => c.id === id) || null;
  },

  // Update
  async updateConfig(id: string, updates: Partial<SimulationConfig>): Promise<SimulationConfig | null> {
    await delay(500);
    const index = mockConfigs.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    mockConfigs[index] = {
      ...mockConfigs[index],
      ...updates,
      id: mockConfigs[index].id,
      createdAt: mockConfigs[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    return mockConfigs[index];
  },

  // Delete
  async deleteConfig(id: string): Promise<boolean> {
    await delay(300);
    const index = mockConfigs.findIndex(c => c.id === id);
    if (index === -1) return false;
    mockConfigs.splice(index, 1);
    return true;
  },

  // Run simulation
  async runSimulation(configId: string): Promise<SimulationResult> {
    await delay(2000);
    
    const config = mockConfigs.find(c => c.id === configId);
    if (!config) throw new Error('Configuration not found');

    // Flatten charge points into individual array
    const allChargePoints: { index: number; power: number }[] = [];
    let chargePointIndex = 1;
    config.parameters.chargePointTypes.forEach(type => {
      for (let i = 0; i < type.quantity; i++) {
        allChargePoints.push({ index: chargePointIndex++, power: type.power });
      }
    });

    const totalChargePoints = allChargePoints.length;
    const totalCapacity = allChargePoints.reduce((sum, cp) => sum + cp.power, 0);

    // Generate mock exemplary day data
    const exemplaryDay = Array.from({ length: 24 }, (_, hour) => {
      const data: any = { hour };
      let hourTotalPower = 0;
      
      allChargePoints.forEach(cp => {
        // Simulate charging patterns (higher during day, lower at night)
        const baseLoad = hour >= 8 && hour <= 18 ? 0.7 : 0.3;
        const randomFactor = Math.random() * 0.5;
        const multiplier = config.parameters.arrivalProbabilityMultiplier / 100;
        const powerUsed = Number((cp.power * (baseLoad + randomFactor) * multiplier).toFixed(2));
        data[`chargePoint${cp.index}`] = powerUsed;
        hourTotalPower += powerUsed;
      });
      
      return data;
    });

    // Calculate total daily energy
    const totalDailyEnergy = exemplaryDay.reduce((sum, hour) => {
      let hourTotal = 0;
      allChargePoints.forEach(cp => {
        hourTotal += hour[`chargePoint${cp.index}`];
      });
      return sum + hourTotal;
    }, 0);

    // Calculate concurrency factor
    // Actual power is the average power used vs theoretical maximum
    const avgPowerUsed = totalDailyEnergy / 24; // Average kW over the day
    const theoreticalMax = totalCapacity; // Maximum possible if all running at 100%
    const actualConcurrencyFactor = avgPowerUsed / theoreticalMax;
    const theoreticalConcurrencyFactor = 1.0; // 100% utilization
    const deviation = ((theoreticalConcurrencyFactor - actualConcurrencyFactor) / theoreticalConcurrencyFactor) * 100;

    const multiplier = config.parameters.arrivalProbabilityMultiplier / 100;
    const eventsPerDay = Math.round(totalChargePoints * 6 * multiplier);

    const result: SimulationResult = {
      id: String(Date.now()),
      configId,
      simulatedAt: new Date().toISOString(),
      output: {
        totalEnergyCharged: Number((totalDailyEnergy * 365).toFixed(2)),
        chargingEvents: {
          perYear: eventsPerDay * 365,
          perMonth: Math.round(eventsPerDay * 30),
          perWeek: eventsPerDay * 7,
          perDay: eventsPerDay,
        },
        exemplaryDay,
        concurrencyFactor: {
          actual: Number(actualConcurrencyFactor.toFixed(4)),
          theoretical: theoreticalConcurrencyFactor,
          deviation: Number(deviation.toFixed(2)),
        },
      },
    };

    mockResults.push(result);
    return result;
  },

  // Get simulation results
  async getResults(configId?: string): Promise<SimulationResult[]> {
    await delay(300);
    if (configId) {
      return mockResults.filter(r => r.configId === configId);
    }
    return [...mockResults];
  },
};
