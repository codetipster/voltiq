export interface ChargePointType {
  id: string;
  power: number; // kW
  quantity: number;
}

export interface SimulationConfig {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parameters: {
    chargePointTypes: ChargePointType[]; // Array of different chargepoint types
    arrivalProbabilityMultiplier: number; // 20-200%, default: 100%
    carConsumption: number; // kWh, default: 18
  };
}

export interface SimulationResult {
  id: string;
  configId: string;
  simulatedAt: string;
  output: {
    totalEnergyCharged: number; // kWh
    chargingEvents: {
      perYear: number;
      perMonth: number;
      perWeek: number;
      perDay: number;
    };
    exemplaryDay: Array<{
      hour: number;
      [key: string]: number; // chargePoint1, chargePoint2, etc.
    }>;
    concurrencyFactor: {
      actual: number; // Actual concurrency factor from simulation
      theoretical: number; // Theoretical maximum (1.0)
      deviation: number; // Percentage deviation
    };
  };
}
