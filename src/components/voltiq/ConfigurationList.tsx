import type { SimulationConfig } from '../../types/simulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../atomic/Card';
import { Button } from '../atomic/Button';
import { Badge } from '../atomic/Badge';
import { Play, Pencil, Trash2, Zap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../atomic/AlertDialog';

interface ConfigurationListProps {
  configs: SimulationConfig[];
  onEdit: (config: SimulationConfig) => void;
  onDelete: (id: string) => void;
  onRunSimulation: (id: string) => void;
  isLoading?: boolean;
}

export function ConfigurationList({ configs, onEdit, onDelete, onRunSimulation, isLoading }: ConfigurationListProps) {
  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No configurations yet. Create your first simulation configuration to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {configs.map((config) => (
        <Card key={config.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate">{config.name}</CardTitle>
                <CardDescription className="mt-1" style={{ fontSize: '0.75rem' }}>
                  Updated {new Date(config.updatedAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: 'var(--brand-sage)', color: 'var(--brand-navy)' }}>
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {/* Charge Point Types */}
            <div className="space-y-2">
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Charge Points</p>
              <div className="space-y-1">
                {config.parameters.chargePointTypes.map((type, index) => (
                  <div key={type.id} className="flex items-center justify-between text-sm">
                    <span>{type.quantity} × {type.power} kW</span>
                    <span className="text-muted-foreground">
                      {(type.quantity * type.power).toFixed(1)} kW
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Arrival Rate</p>
                <p>{config.parameters.arrivalProbabilityMultiplier}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Consumption</p>
                <p>{config.parameters.carConsumption} kWh</p>
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-2">
              <Button
                onClick={() => onRunSimulation(config.id)}
                className="flex-1"
                size="sm"
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
              <Button
                onClick={() => onEdit(config)}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{config.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(config.id)}
                      style={{ backgroundColor: 'var(--brand-coral)' }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
