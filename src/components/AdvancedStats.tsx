
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Users, Target } from 'lucide-react';
import type { CompletedClient } from '@/components/CompletedClientsHistory';

interface AdvancedStatsProps {
  completedClients: CompletedClient[];
  waitingClients: number;
  currentHour: number;
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({
  completedClients,
  waitingClients,
  currentHour
}) => {
  // Calcular estatísticas por hora
  const hourlyStats = completedClients.reduce((acc, client) => {
    const hour = client.endTime.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(hourlyStats).reduce((max, [hour, count]) => 
    count > max.count ? { hour: parseInt(hour), count } : max, 
    { hour: 0, count: 0 }
  );

  // Estatísticas de tempo
  const serviceTimes = completedClients.map(client => 
    Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60))
  );

  const avgTime = serviceTimes.length > 0 
    ? Math.round(serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length)
    : 0;

  const minTime = serviceTimes.length > 0 ? Math.min(...serviceTimes) : 0;
  const maxTime = serviceTimes.length > 0 ? Math.max(...serviceTimes) : 0;

  // Eficiência (baseada no tempo estimado vs real)
  const efficiency = completedClients.length > 0
    ? Math.round(completedClients.reduce((acc, client) => {
        const actualTime = Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60));
        const estimatedTime = client.estimatedDuration;
        return acc + (estimatedTime / actualTime);
      }, 0) / completedClients.length * 100)
    : 100;

  // Projeção para o dia
  const currentProgress = currentHour >= 8 ? (currentHour - 8) / 10 : 0; // Assumindo horário 8h-18h
  const projectedTotal = currentProgress > 0 
    ? Math.round(completedClients.length / currentProgress)
    : completedClients.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Estatísticas de Tempo */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Clock className="w-5 h-5 text-blue-600" />
            Análise de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{avgTime}min</div>
              <div className="text-xs text-gray-600">Média</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{minTime}min</div>
              <div className="text-xs text-gray-600">Mínimo</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{maxTime}min</div>
              <div className="text-xs text-gray-600">Máximo</div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Eficiência</span>
              <Badge variant={efficiency >= 90 ? "default" : efficiency >= 70 ? "secondary" : "destructive"}>
                {efficiency}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pico de Movimento */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Pico de Movimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {peakHour.hour > 0 ? `${peakHour.hour}:00` : '--'}
            </div>
            <div className="text-sm text-gray-600">
              {peakHour.count} atendimentos
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Período atual</span>
              <Badge variant="outline">
                {currentHour}:00 - {hourlyStats[currentHour] || 0} clientes
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Na fila agora</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {waitingClients} esperando
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projeção do Dia */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Target className="w-5 h-5 text-purple-600" />
            Projeção do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{projectedTotal}</div>
            <div className="text-sm text-gray-600">Total estimado</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progresso</span>
              <Badge variant="outline">
                {Math.round(currentProgress * 100)}% do dia
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(currentProgress * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Serviços */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="w-5 h-5 text-orange-600" />
            Serviços Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              completedClients.reduce((acc, client) => {
                acc[client.service] = (acc[client.service] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([service, count]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{service}</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {count} ({Math.round(count / completedClients.length * 100)}%)
                </Badge>
              </div>
            ))}
            {completedClients.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Nenhum serviço concluído ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStats;
