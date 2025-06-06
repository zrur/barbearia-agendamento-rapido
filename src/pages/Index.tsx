import React, { useState, useEffect } from 'react';
import { Plus, Scissors, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddClientForm from '@/components/AddClientForm';
import ClientQueue from '@/components/ClientQueue';
import CuttingTimer from '@/components/CuttingTimer';
import CompletedClientsHistory, { CompletedClient } from '@/components/CompletedClientsHistory';
import PauseControl from '@/components/PauseControl';
import { toast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import ServiceFilter from '@/components/ServiceFilter';
import ExportReport from '@/components/ExportReport';
import BarberManagement, { Barber } from '@/components/BarberManagement';
import AdvancedStats from '@/components/AdvancedStats';

export interface Client {
  id: string;
  name: string;
  service: string;
  arrivalTime: Date;
  status: 'waiting' | 'cutting' | 'completed';
  estimatedDuration: number;
  cuttingStartTime?: Date;
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedClients, setCompletedClients] = useState<CompletedClient[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | undefined>();
  const [cuttingDuration, setCuttingDuration] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([
    { id: '1', name: 'João', isActive: true, completedClients: [] }
  ]);
  const { playNotification } = useNotificationSound();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Atualizar duração do corte atual
  useEffect(() => {
    const cuttingClient = clients.find(c => c.status === 'cutting');
    if (!cuttingClient || !cuttingClient.cuttingStartTime || isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = (now.getTime() - cuttingClient.cuttingStartTime!.getTime()) / 1000;
      setCuttingDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [clients, isPaused]);

  const addClient = (clientData: Omit<Client, 'id' | 'arrivalTime' | 'status'>) => {
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientData,
      arrivalTime: new Date(),
      status: 'waiting'
    };
    
    setClients(prev => [...prev, newClient]);
    setShowAddForm(false);
    
    // Se for o primeiro da fila, tocar notificação
    const waitingClients = clients.filter(c => c.status === 'waiting');
    if (waitingClients.length === 0 && !clients.find(c => c.status === 'cutting')) {
      playNotification();
    }
    
    toast({
      title: "Cliente adicionado!",
      description: `${newClient.name} foi adicionado à fila de espera.`,
    });
  };

  const startCutting = (clientId: string) => {
    if (isPaused) {
      toast({
        title: "Fila pausada",
        description: "Retome a fila antes de iniciar um corte.",
        variant: "destructive"
      });
      return;
    }

    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, status: 'cutting' as const, cuttingStartTime: new Date() }
        : client.status === 'cutting' 
          ? { ...client, status: 'waiting' as const, cuttingStartTime: undefined }
          : client
    ));
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      playNotification();
      toast({
        title: "Corte iniciado!",
        description: `Iniciando o atendimento de ${client.name}.`,
      });
    }
  };

  const completeService = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client && client.cuttingStartTime) {
      const completedClient: CompletedClient = {
        id: client.id,
        name: client.name,
        service: client.service,
        startTime: client.cuttingStartTime,
        endTime: new Date(),
        estimatedDuration: client.estimatedDuration
      };

      setCompletedClients(prev => [...prev, completedClient]);
      setClients(prev => prev.filter(c => c.id !== clientId));
      setCuttingDuration(0);
      
      const waitingClients = clients.filter(c => c.status === 'waiting' && c.id !== clientId);
      if (waitingClients.length > 0) {
        playNotification();
      }
      
      toast({
        title: "Serviço concluído!",
        description: `Atendimento de ${client.name} finalizado.`,
      });
    }
  };

  const removeClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      if (client.status === 'cutting') {
        setCuttingDuration(0);
      }
      toast({
        title: "Cliente removido",
        description: `${client.name} foi removido da fila.`,
      });
    }
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setPauseStartTime(undefined);
      toast({
        title: "Fila retomada",
        description: "A fila de atendimento foi retomada.",
      });
    } else {
      setIsPaused(true);
      setPauseStartTime(new Date());
      toast({
        title: "Fila pausada",
        description: "A fila foi pausada para intervalo.",
      });
    }
  };

  const addBarber = (name: string) => {
    const newBarber: Barber = {
      id: Date.now().toString(),
      name,
      isActive: true,
      completedClients: []
    };
    setBarbers(prev => [...prev, newBarber]);
  };

  const removeBarber = (barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    if (barber) {
      setBarbers(prev => prev.filter(b => b.id !== barberId));
      toast({
        title: "Barbeiro removido",
        description: `${barber.name} foi removido da equipe.`,
      });
    }
  };

  const toggleBarberStatus = (barberId: string) => {
    setBarbers(prev => prev.map(barber =>
      barber.id === barberId
        ? { ...barber, isActive: !barber.isActive }
        : barber
    ));
    
    const barber = barbers.find(b => b.id === barberId);
    if (barber) {
      toast({
        title: barber.isActive ? "Barbeiro pausado" : "Barbeiro ativado",
        description: `${barber.name} ${barber.isActive ? 'foi pausado' : 'voltou ao trabalho'}.`,
      });
    }
  };

  const assignClientToBarber = (barberId: string, clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    setBarbers(prev => prev.map(barber =>
      barber.id === barberId
        ? {
            ...barber,
            currentClient: {
              id: client.id,
              name: client.name,
              service: client.service,
              startTime: new Date(),
              estimatedDuration: client.estimatedDuration
            }
          }
        : barber
    ));

    setClients(prev => prev.filter(c => c.id !== clientId));
    
    playNotification();
    toast({
      title: "Cliente atribuído!",
      description: `${client.name} foi atribuído ao barbeiro.`,
    });
  };

  const completeBarberService = (barberId: string) => {
    const barber = barbers.find(b => b.id === barberId);
    if (!barber?.currentClient) return;

    const completedClient: CompletedClient = {
      id: barber.currentClient.id,
      name: barber.currentClient.name,
      service: barber.currentClient.service,
      startTime: barber.currentClient.startTime,
      endTime: new Date(),
      estimatedDuration: barber.currentClient.estimatedDuration
    };

    setBarbers(prev => prev.map(b =>
      b.id === barberId
        ? {
            ...b,
            currentClient: undefined,
            completedClients: [...b.completedClients, completedClient]
          }
        : b
    ));

    setCompletedClients(prev => [...prev, completedClient]);
    
    const waitingClientsCount = clients.filter(c => c.status === 'waiting').length;
    if (waitingClientsCount > 0) {
      playNotification();
    }
    
    toast({
      title: "Serviço concluído!",
      description: `Atendimento de ${barber.currentClient.name} finalizado.`,
    });
  };

  const waitingClients = clients.filter(c => c.status === 'waiting');
  const cuttingClient = clients.find(c => c.status === 'cutting');

  // Filter clients by selected service
  const filteredWaitingClients = selectedService 
    ? waitingClients.filter(c => c.service === selectedService)
    : waitingClients;

  // Get unique services and counts
  const allServices = [...new Set(clients.map(c => c.service))];
  const serviceCounts = waitingClients.reduce((acc, client) => {
    acc[client.service] = (acc[client.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scissors className="w-10 h-10 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-800">BarberShop Pro</h1>
          </div>
          <p className="text-lg text-gray-600">Sistema de Controle de Fila</p>
          <div className="mt-4 text-sm text-gray-500">
            {currentTime.toLocaleDateString('pt-BR')} - {currentTime.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Na Fila
              </CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{waitingClients.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Cortando
              </CardTitle>
              <Scissors className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {cuttingClient ? 1 : 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Concluídos Hoje
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{completedClients.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tempo Médio
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {completedClients.length > 0 
                  ? Math.round(completedClients.reduce((acc, client) => 
                      acc + Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60)), 0) / completedClients.length)
                  : 0}min
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pause Control */}
        <div className="mb-8">
          <PauseControl 
            isPaused={isPaused}
            onTogglePause={togglePause}
            pauseStartTime={pauseStartTime}
          />
        </div>

        {/* Barber Management */}
        <div className="mb-8">
          <BarberManagement 
            barbers={barbers}
            waitingClients={waitingClients}
            onAddBarber={addBarber}
            onRemoveBarber={removeBarber}
            onToggleBarberStatus={toggleBarberStatus}
            onAssignClient={assignClientToBarber}
            onCompleteService={completeBarberService}
          />
        </div>

        {/* Advanced Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Estatísticas Avançadas
          </h2>
          <AdvancedStats 
            completedClients={completedClients}
            waitingClients={waitingClients.length}
            currentHour={currentTime.getHours()}
          />
        </div>

        {/* Service Filter */}
        {allServices.length > 0 && (
          <div className="mb-8">
            <ServiceFilter 
              services={allServices}
              selectedService={selectedService}
              onServiceSelect={setSelectedService}
              clientCounts={serviceCounts}
            />
          </div>
        )}

        {/* Current Client Being Served */}
        {cuttingClient && cuttingClient.cuttingStartTime && (
          <div className="mb-8">
            <CuttingTimer
              clientName={cuttingClient.name}
              service={cuttingClient.service}
              estimatedDuration={cuttingClient.estimatedDuration}
              startTime={cuttingClient.cuttingStartTime}
              isPaused={isPaused}
            />
            <div className="mt-4 text-center">
              <Button 
                onClick={() => completeService(cuttingClient.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isPaused}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Atendimento
              </Button>
            </div>
          </div>
        )}

        {/* Add Client Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg"
            disabled={isPaused && !cuttingClient}
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Cliente
          </Button>
        </div>

        {/* Add Client Form */}
        {showAddForm && (
          <AddClientForm 
            onSubmit={addClient}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Layout com três colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Queue */}
          <div className="lg:col-span-2">
            <ClientQueue 
              clients={filteredWaitingClients}
              onStartCutting={startCutting}
              onRemoveClient={removeClient}
              hasCuttingClient={!!cuttingClient}
              currentCuttingDuration={cuttingDuration}
              isPaused={isPaused}
            />
            
            {selectedService && filteredWaitingClients.length === 0 && (
              <div className="mt-4 text-center text-gray-500">
                <p>Nenhum cliente na fila para o serviço "{selectedService}"</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Export Report */}
            <ExportReport 
              waitingClients={waitingClients}
              completedClients={completedClients}
              currentClient={cuttingClient}
            />
            
            {/* History */}
            <CompletedClientsHistory completedClients={completedClients} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
