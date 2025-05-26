
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Scissors, Plus, X, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Barber {
  id: string;
  name: string;
  isActive: boolean;
  currentClient?: {
    id: string;
    name: string;
    service: string;
    startTime: Date;
  };
}

interface BarberManagementProps {
  barbers: Barber[];
  onAddBarber: (name: string) => void;
  onRemoveBarber: (barberId: string) => void;
  onToggleBarberStatus: (barberId: string) => void;
}

const BarberManagement: React.FC<BarberManagementProps> = ({
  barbers,
  onAddBarber,
  onRemoveBarber,
  onToggleBarberStatus
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

  const activeBarbers = barbers.filter(b => b.isActive);
  const busyBarbers = barbers.filter(b => b.currentClient);

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gestão de Barbeiros
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
          <div className="space-y-2">
            {barbers.map((barber) => (
              <div 
                key={barber.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  barber.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    barber.currentClient ? 'bg-red-500' : 
                    barber.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-800">{barber.name}</h4>
                    {barber.currentClient && (
                      <p className="text-sm text-gray-600">
                        Atendendo: {barber.currentClient.name} ({barber.currentClient.service})
                      </p>
                    )}
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
