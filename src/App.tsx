import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/atomic/Tabs';
import { Button } from './components/atomic/Button';
import { ToastProvider, toast } from './components/atomic/Toast';
import { ConfigurationForm, ConfigurationList, SimulationResults } from './components/voltiq';
import { mockApi } from './utils/mockApi';
import type { SimulationConfig, SimulationResult } from './types/simulation';
import { Plus, Settings, BarChart3, Zap } from 'lucide-react';

function AppContent() {
  const [configs, setConfigs] = useState<SimulationConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<SimulationConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('configurations');

  // Load configurations on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await mockApi.getAllConfigs();
      setConfigs(data);
    } catch (error) {
      toast.error('Failed to load configurations');
    }
  };

  const handleSaveConfig = async (configData: Omit<SimulationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      if (editingConfig) {
        // Update existing config
        await mockApi.updateConfig(editingConfig.id, configData);
        toast.success('Configuration updated successfully');
      } else {
        // Create new config
        await mockApi.createConfig(configData);
        toast.success('Configuration created successfully');
      }
      await loadConfigs();
      setShowForm(false);
      setEditingConfig(null);
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (config: SimulationConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await mockApi.deleteConfig(id);
      toast.success('Configuration deleted successfully');
      await loadConfigs();
    } catch (error) {
      toast.error('Failed to delete configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSimulation = async (configId: string) => {
    setIsSimulating(true);
    try {
      const result = await mockApi.runSimulation(configId);
      setLatestResult(result);
      setActiveTab('results');
      toast.success('Simulation completed successfully');
    } catch (error) {
      toast.error('Failed to run simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingConfig(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Zap className="h-6 w-6" style={{ color: 'var(--brand-yellow)' }} />
            </div>
            <div>
              <h1 style={{ color: 'white' }}>VoltIQ</h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Configure, simulate, and analyze charging station performance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="w-full sm:w-auto sm:min-w-fit">
                <TabsTrigger value="configurations">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Configurations</span>
                  <span className="sm:hidden">Config</span>
                </TabsTrigger>
                <TabsTrigger value="results">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
              </TabsList>

              {activeTab === 'configurations' && !showForm && (
                <Button onClick={handleNewConfig} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Configuration</span>
                  <span className="sm:hidden">New Config</span>
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="configurations" className="space-y-6 mt-0">
            {showForm ? (
              <ConfigurationForm
                config={editingConfig || undefined}
                onSave={handleSaveConfig}
                onCancel={handleCancelForm}
                isLoading={isLoading}
              />
            ) : (
              <ConfigurationList
                configs={configs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRunSimulation={handleRunSimulation}
                isLoading={isLoading || isSimulating}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <SimulationResults result={latestResult} isLoading={isSimulating} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              EV Charging Simulation Platform
            </p>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-coral)' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-sage)' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-yellow)' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--brand-navy)' }}></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
