
import React, { useState, useEffect } from 'react';
import { Plus, Scissors, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddClientForm from '@/components/AddClientForm';
import ClientQueue from '@/components/ClientQueue';
import { toast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  service: string;
  arrivalTime: Date;
  status: 'waiting' | 'cutting' | 'completed';
  estimatedDuration: number;
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addClient = (clientData: Omit<Client, 'id' | 'arrivalTime' | 'status'>) => {
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientData,
      arrivalTime: new Date(),
      status: 'waiting'
    };
    
    setClients(prev => [...prev, newClient]);
    setShowAddForm(false);
    toast({
      title: "Cliente adicionado!",
      description: `${newClient.name} foi adicionado à fila de espera.`,
    });
  };

  const startCutting = (clientId: string) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, status: 'cutting' as const }
        : client.status === 'cutting' 
          ? { ...client, status: 'waiting' as const }
          : client
    ));
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      toast({
        title: "Corte iniciado!",
        description: `Iniciando o atendimento de ${client.name}.`,
      });
    }
  };

  const completeService = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClients(prev => prev.filter(c => c.id !== clientId));
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
      toast({
        title: "Cliente removido",
        description: `${client.name} foi removido da fila.`,
      });
    }
  };

  const waitingClients = clients.filter(c => c.status === 'waiting');
  const cuttingClient = clients.find(c => c.status === 'cutting');

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                Tempo Médio
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">30min</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Client Being Served */}
        {cuttingClient && (
          <Card className="mb-8 bg-gradient-to-r from-green-100 to-emerald-100 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Scissors className="w-5 h-5" />
                Atendimento em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-green-800">{cuttingClient.name}</h3>
                  <p className="text-green-600">{cuttingClient.service}</p>
                  <p className="text-sm text-green-500">
                    Iniciado às {cuttingClient.arrivalTime.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <Button 
                  onClick={() => completeService(cuttingClient.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Client Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg"
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

        {/* Queue */}
        <ClientQueue 
          clients={waitingClients}
          onStartCutting={startCutting}
          onRemoveClient={removeClient}
          hasCuttingClient={!!cuttingClient}
        />
      </div>
    </div>
  );
};

export default Index;
