
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Scissors, Plus, X, User, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CompletedClient } from '@/components/CompletedClientsHistory';

export interface Barber {
  id: string;
  name: string;
  isActive: boolean;
  currentClient?: {
    id: string;
    name: string;
    service: string;
    startTime: Date;
    estimatedDuration: number;
  };
  completedClients: CompletedClient[];
}

interface BarberManagementProps {
  barbers: Barber[];
  waitingClients: any[];
  onAddBarber: (name: string) => void;
  onRemoveBarber: (barberId: string) => void;
  onToggleBarberStatus: (barberId: string) => void;
  onAssignClient: (barberId: string, clientId: string) => void;
  onCompleteService: (barberId: string) => void;
}

const BarberManagement: React.FC<BarberManagementProps> = ({
  barbers,
  waitingClients,
  onAddBarber,
  onRemoveBarber,
  onToggleBarberStatus,
  onAssignClient,
  onCompleteService
}) => {
  const [newBarberName, setNewBarberName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBarber = () => {
    if (newBarberName.trim()) {
      onAddBarber(newBarberName.trim());
      setNewBarberName('');
      setShowAddForm(false);
      toast({
        title: "Barbeiro adicionado!",
        description: `${newBarberName} foi adicionado à equipe.`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (startTime: Date) => {
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  const activeBarbers = barbers.filter(b => b.isActive);
  const busyBarbers = barbers.filter(b => b.currentClient);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Controle de Barbeiros
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">
              {activeBarbers.length} ativos
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {busyBarbers.length} ocupados
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Lista de barbeiros */}
          <div className="space-y-4">
            {barbers.map((barber) => (
              <div 
                key={barber.id}
                className={`border rounded-lg p-4 ${
                  barber.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      barber.currentClient ? 'bg-red-500' : 
                      barber.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-gray-800">{barber.name}</h4>
                      <div className="text-sm text-gray-600">
                        Atendimentos hoje: {barber.completedClients.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {barber.currentClient ? (
                      <Badge variant="destructive">Ocupado</Badge>
                    ) : barber.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Livre</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleBarberStatus(barber.id)}
                      className={barber.isActive ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                    >
                      {barber.isActive ? 'Pausar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveBarber(barber.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Cliente atual */}
                {barber.currentClient && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-blue-800">{barber.currentClient.name}</h5>
                        <p className="text-sm text-blue-600">{barber.currentClient.service}</p>
                        <p className="text-xs text-blue-500">
                          Tempo: {formatTime(getElapsedTime(barber.currentClient.startTime))} / {barber.currentClient.estimatedDuration}min
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onCompleteService(barber.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Finalizar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Atribuir cliente */}
                {barber.isActive && !barber.currentClient && waitingClients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Próximos clientes:</p>
                    <div className="space-y-1">
                      {waitingClients.slice(0, 3).map((client) => (
                        <div key={client.id} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                          <span>{client.name} - {client.service}</span>
                          <Button
                            size="sm"
                            onClick={() => onAssignClient(barber.id, client.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1"
                          >
                            <Scissors className="w-3 h-3 mr-1" />
                            Atender
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Histórico resumido */}
                {barber.completedClients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Últimos atendimentos:</p>
                    <div className="space-y-1">
                      {barber.completedClients.slice(-2).map((client) => (
                        <div key={client.id} className="text-xs text-gray-500 flex justify-between">
                          <span>{client.name} - {client.service}</span>
                          <span>{Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60))}min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Adicionar barbeiro */}
          {showAddForm ? (
            <div className="flex gap-2">
              <Input
                placeholder="Nome do barbeiro"
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBarber()}
              />
              <Button onClick={handleAddBarber} size="sm">
                Adicionar
              </Button>
              <Button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewBarberName('');
                }} 
                variant="outline" 
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Barbeiro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarberManagement;
