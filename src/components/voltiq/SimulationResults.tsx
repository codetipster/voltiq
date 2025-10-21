import type { SimulationResult } from '../../types/simulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../atomic/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Battery, Calendar, TrendingUp, Zap, Activity } from 'lucide-react';
import { Badge } from '../atomic/Badge';

interface SimulationResultsProps {
  result: SimulationResult | null;
  isLoading?: boolean;
}

export function SimulationResults({ result, isLoading }: SimulationResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: 'var(--brand-coral)' }}></div>
          <p className="text-muted-foreground">Running simulation...</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No simulation results yet. Run a simulation from the Configurations tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { output } = result;

  // Calculate colors for charge points dynamically
  const colors = ['#E85D5D', '#A8D5A8', '#F4D58D', '#4A5568', '#8B9DC3', '#C4A5DE', '#F5B7A0', '#9DD5C5'];
  
  // Get all charge point keys from the first data point
  const chargePointKeys = Object.keys(output.exemplaryDay[0]).filter(key => key.startsWith('chargePoint'));

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: '0.875rem' }}>Total Energy Charged</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '1.5rem' }}>{output.totalEnergyCharged.toLocaleString()}</div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>kWh per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: '0.875rem' }}>Daily Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '1.5rem' }}>{output.chargingEvents.perDay}</div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>charging sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: '0.875rem' }}>Weekly Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '1.5rem' }}>{output.chargingEvents.perWeek}</div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>charging sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle style={{ fontSize: '0.875rem' }}>Annual Events</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '1.5rem' }}>{output.chargingEvents.perYear.toLocaleString()}</div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>charging sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Concurrency Factor Card - BONUS FEATURE */}
      <Card style={{ borderColor: 'var(--brand-yellow)', borderWidth: '2px' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: 'var(--brand-yellow)' }} />
              <CardTitle>Concurrency Factor Analysis</CardTitle>
            </div>
            <Badge variant="outline" style={{ borderColor: 'var(--brand-yellow)', color: 'var(--brand-yellow)' }}>
              Bonus Feature
            </Badge>
          </div>
          <CardDescription>
            Measures how efficiently the charging infrastructure is being utilized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Actual Concurrency</p>
              <div style={{ fontSize: '1.75rem' }}>{(output.concurrencyFactor.actual * 100).toFixed(2)}%</div>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                Average utilization rate
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Theoretical Maximum</p>
              <div style={{ fontSize: '1.75rem' }}>{(output.concurrencyFactor.theoretical * 100).toFixed(0)}%</div>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                Full capacity utilization
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Deviation</p>
              <div 
                style={{ 
                  fontSize: '1.75rem',
                  color: output.concurrencyFactor.deviation < 50 ? 'var(--brand-sage)' : 'var(--brand-coral)'
                }}
              >
                {output.concurrencyFactor.deviation.toFixed(2)}%
              </div>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                From theoretical max
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <p style={{ fontSize: '0.875rem' }}>
              {output.concurrencyFactor.deviation < 30 
                ? '✓ Excellent utilization - infrastructure is well-matched to demand'
                : output.concurrencyFactor.deviation < 60
                ? '⚠ Moderate utilization - consider optimizing arrival patterns or capacity'
                : '⚠ Low utilization - significant unused capacity detected'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exemplary Day Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Exemplary Day - Charging Power Distribution</CardTitle>
              <CardDescription>Hourly charging power (kW) across all charge points</CardDescription>
            </div>
            <Badge variant="outline" style={{ borderColor: 'var(--brand-sage)', color: 'var(--brand-sage)' }}>
              24-hour view
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={output.exemplaryDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="hour"
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                {chargePointKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={`Charge Point ${index + 1}`}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charging Events Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Charging Events Breakdown</CardTitle>
          <CardDescription>Estimated number of charging sessions over different time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <span>Per Day</span>
                <span>{output.chargingEvents.perDay} sessions</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <span>Per Week</span>
                <span>{output.chargingEvents.perWeek} sessions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <span>Per Month</span>
                <span>{output.chargingEvents.perMonth.toLocaleString()} sessions</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <span>Per Year</span>
                <span>{output.chargingEvents.perYear.toLocaleString()} sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Simulated At</p>
              <p>{new Date(result.simulatedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Simulation ID</p>
              <p className="font-mono" style={{ fontSize: '0.875rem' }}>{result.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
