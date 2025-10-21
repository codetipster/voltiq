import { useState } from 'react';
import type { ChargePointType } from '../../types/simulation';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Label } from '../atomic/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../atomic/Card';
import { Plus, Trash2, Zap } from 'lucide-react';

interface ChargePointTypeManagerProps {
  chargePointTypes: ChargePointType[];
  onChange: (types: ChargePointType[]) => void;
}

export function ChargePointTypeManager({ chargePointTypes, onChange }: ChargePointTypeManagerProps) {
  const [newPower, setNewPower] = useState<number>(11);
  const [newQuantity, setNewQuantity] = useState<number>(1);

  const handleAdd = () => {
    if (newPower > 0 && newQuantity > 0) {
      const newType: ChargePointType = {
        id: `cp-${Date.now()}`,
        power: newPower,
        quantity: newQuantity,
      };
      onChange([...chargePointTypes, newType]);
      // Reset to defaults
      setNewPower(11);
      setNewQuantity(1);
    }
  };

  const handleRemove = (id: string) => {
    onChange(chargePointTypes.filter((type) => type.id !== id));
  };

  const handleUpdate = (id: string, field: 'power' | 'quantity', value: number) => {
    onChange(
      chargePointTypes.map((type) =>
        type.id === id ? { ...type, [field]: value } : type
      )
    );
  };

  const totalChargePoints = chargePointTypes.reduce((sum, type) => sum + type.quantity, 0);
  const totalPower = chargePointTypes.reduce((sum, type) => sum + type.power * type.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: 'var(--brand-yellow)' }} />
          Charge Point Types
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Types */}
        {chargePointTypes.length > 0 && (
          <div className="space-y-2">
            <Label>Configured Charge Points</Label>
            <div className="space-y-2">
              {chargePointTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`power-${type.id}`} style={{ fontSize: '0.75rem' }}>
                        Power (kW)
                      </Label>
                      <Input
                        id={`power-${type.id}`}
                        type="number"
                        min="3.7"
                        max="350"
                        step="0.1"
                        value={type.power}
                        onChange={(e) => handleUpdate(type.id, 'power', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${type.id}`} style={{ fontSize: '0.75rem' }}>
                        Quantity
                      </Label>
                      <Input
                        id={`quantity-${type.id}`}
                        type="number"
                        min="1"
                        max="50"
                        value={type.quantity}
                        onChange={(e) => handleUpdate(type.id, 'quantity', Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 min-w-[80px]">
                    <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Total</span>
                    <span>{(type.power * type.quantity).toFixed(1)} kW</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(type.id)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Type */}
        <div className="space-y-2">
          <Label>Add New Charge Point Type</Label>
          <div className="flex items-end gap-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-power" style={{ fontSize: '0.75rem' }}>
                  Power (kW)
                </Label>
                <Input
                  id="new-power"
                  type="number"
                  min="3.7"
                  max="350"
                  step="0.1"
                  value={newPower}
                  onChange={(e) => setNewPower(Number(e.target.value))}
                  placeholder="11"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-quantity" style={{ fontSize: '0.75rem' }}>
                  Quantity
                </Label>
                <Input
                  id="new-quantity"
                  type="number"
                  min="1"
                  max="50"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="button" onClick={handleAdd} size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Summary */}
        {chargePointTypes.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  Total Charge Points
                </p>
                <p className="text-lg">{totalChargePoints}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  Total Capacity
                </p>
                <p className="text-lg">{totalPower.toFixed(1)} kW</p>
              </div>
            </div>
          </div>
        )}

        {chargePointTypes.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p style={{ fontSize: '0.875rem' }}>No charge points configured yet. Add your first one above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
