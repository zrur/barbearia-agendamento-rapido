
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Scissors, X, Users, Timer } from 'lucide-react';
import type { Client } from '@/pages/Index';

interface ClientQueueProps {
  clients: Client[];
  onStartCutting: (clientId: string) => void;
  onRemoveClient: (clientId: string) => void;
  hasCuttingClient: boolean;
  currentCuttingDuration?: number;
  isPaused: boolean;
}

const ClientQueue: React.FC<ClientQueueProps> = ({ 
  clients, 
  onStartCutting, 
  onRemoveClient, 
  hasCuttingClient,
  currentCuttingDuration = 0,
  isPaused
}) => {
  const getWaitingTime = (arrivalTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - arrivalTime.getTime()) / (1000 * 60));
    return diffInMinutes;
  };

  const getEstimatedWaitTime = (index: number, currentCuttingDuration: number) => {
    if (isPaused) return "Pausado";
    
    let totalWaitTime = 0;
    
    // Se há alguém cortando, adicionar o tempo restante estimado
    if (hasCuttingClient && index === 0) {
      const currentClient = clients[0];
      const estimatedRemaining = Math.max(0, (currentClient?.estimatedDuration || 30) - Math.floor(currentCuttingDuration / 60));
      totalWaitTime = estimatedRemaining;
    } else if (hasCuttingClient) {
      // Tempo restante do corte atual
      const currentClient = clients[0];
      const estimatedRemaining = Math.max(0, (currentClient?.estimatedDuration || 30) - Math.floor(currentCuttingDuration / 60));
      totalWaitTime = estimatedRemaining;
      
      // Somar tempos dos clientes à frente na fila
      for (let i = 0; i < index; i++) {
        totalWaitTime += clients[i].estimatedDuration;
      }
    } else {
      // Somar tempos dos clientes à frente na fila
      for (let i = 0; i < index; i++) {
        totalWaitTime += clients[i].estimatedDuration;
      }
    }
    
    if (totalWaitTime < 5) return "Em breve";
    return `~${totalWaitTime}min`;
  };

  const getPositionMessage = (index: number) => {
    if (index === 0) return "Próximo da fila";
    return `${index + 1}º na fila`;
  };

  if (clients.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente na fila</h3>
            <p>Adicione o primeiro cliente para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Fila de Espera ({clients.length} {clients.length === 1 ? 'cliente' : 'clientes'})
      </h2>
      
      {clients.map((client, index) => (
        <Card 
          key={client.id} 
          className={`bg-white/90 backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
            index === 0 ? 'ring-2 ring-amber-300 border-amber-200' : ''
          } ${isPaused ? 'opacity-75' : ''}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{client.name}</h3>
                  <Badge 
                    variant={index === 0 ? "default" : "secondary"}
                    className={index === 0 ? "bg-amber-100 text-amber-800" : ""}
                  >
                    {getPositionMessage(index)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-4 h-4" />
                    {client.service}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {client.estimatedDuration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Espera: {getEstimatedWaitTime(index, currentCuttingDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Chegada: {client.arrivalTime.toLocaleTimeString('pt-BR')}
                  </span>
                  <span>
                    Na fila há: {getWaitingTime(client.arrivalTime)}min
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {index === 0 && !hasCuttingClient && !isPaused && (
                  <Button 
                    onClick={() => onStartCutting(client.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Iniciar
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRemoveClient(client.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientQueue;
