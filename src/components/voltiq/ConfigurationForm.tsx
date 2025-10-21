import React, { useState, useEffect } from 'react';
import { Input } from '../atomic/Input';
import { Label } from '../atomic/Label';
import { Button } from '../atomic/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../atomic/Card';
import { Slider } from '../atomic/Slider';
import { ChargePointTypeManager } from './ChargePointTypeManager';
import type { SimulationConfig, ChargePointType } from '../../types/simulation';

interface ConfigurationFormProps {
  config?: SimulationConfig;
  onSave: (config: Omit<SimulationConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ConfigurationForm({ config, onSave, onCancel, isLoading }: ConfigurationFormProps) {
  const [name, setName] = useState(config?.name || '');
  const [chargePointTypes, setChargePointTypes] = useState<ChargePointType[]>(
    config?.parameters.chargePointTypes || [{ id: 'default-1', power: 11, quantity: 4 }]
  );
  const [arrivalProbability, setArrivalProbability] = useState(config?.parameters.arrivalProbabilityMultiplier || 100);
  const [carConsumption, setCarConsumption] = useState(config?.parameters.carConsumption || 18);

  useEffect(() => {
    if (config) {
      setName(config.name);
      setChargePointTypes(config.parameters.chargePointTypes);
      setArrivalProbability(config.parameters.arrivalProbabilityMultiplier);
      setCarConsumption(config.parameters.carConsumption);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: must have at least one charge point type
    if (chargePointTypes.length === 0) {
      return;
    }
    
    onSave({
      name,
      parameters: {
        chargePointTypes,
        arrivalProbabilityMultiplier: arrivalProbability,
        carConsumption,
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{config ? 'Edit Configuration' : 'New Configuration'}</CardTitle>
        <CardDescription>
          Set up the parameters for your EV charging simulation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mixed Charging Station"
              required
            />
          </div>

          <ChargePointTypeManager
            chargePointTypes={chargePointTypes}
            onChange={setChargePointTypes}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="arrivalProbability">Arrival Probability Multiplier</Label>
              <span className="text-muted-foreground">{arrivalProbability}%</span>
            </div>
            <Slider
              id="arrivalProbability"
              min={20}
              max={200}
              step={5}
              value={[arrivalProbability]}
              onValueChange={(value) => setArrivalProbability(value[0])}
              className="w-full"
            />
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              Adjusts the frequency of cars arriving to charge (20-200%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carConsumption">Car Consumption (kWh)</Label>
            <Input
              id="carConsumption"
              type="number"
              min="5"
              max="50"
              step="0.1"
              value={carConsumption}
              onChange={(e) => setCarConsumption(Number(e.target.value))}
              required
            />
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              Average energy consumption per 100km
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
