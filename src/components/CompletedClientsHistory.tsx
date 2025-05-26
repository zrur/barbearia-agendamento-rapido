
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Scissors } from 'lucide-react';

export interface CompletedClient {
  id: string;
  name: string;
  service: string;
  startTime: Date;
  endTime: Date;
  estimatedDuration: number;
}

interface CompletedClientsHistoryProps {
  completedClients: CompletedClient[];
}

const CompletedClientsHistory: React.FC<CompletedClientsHistoryProps> = ({ completedClients }) => {
  const calculateActualDuration = (start: Date, end: Date) => {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const averageDuration = completedClients.length > 0 
    ? Math.round(completedClients.reduce((acc, client) => 
        acc + calculateActualDuration(client.startTime, client.endTime), 0) / completedClients.length)
    : 0;

  if (completedClients.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Histórico do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p>Nenhum atendimento concluído hoje</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Histórico do Dia
          </div>
          <Badge className="bg-green-100 text-green-800">
            {completedClients.length} atendimentos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">{averageDuration}min</div>
            <div className="text-sm text-green-600">Tempo médio real</div>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {completedClients.slice().reverse().map((client) => {
            const actualDuration = calculateActualDuration(client.startTime, client.endTime);
            const wasOnTime = actualDuration <= client.estimatedDuration;

            return (
              <div key={client.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{client.name}</h4>
                  <Badge variant={wasOnTime ? "default" : "destructive"}>
                    {actualDuration}min
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    {client.service}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {client.startTime.toLocaleTimeString('pt-BR')} - {client.endTime.toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedClientsHistory;
