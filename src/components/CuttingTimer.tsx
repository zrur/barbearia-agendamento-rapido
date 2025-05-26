
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause } from 'lucide-react';

interface CuttingTimerProps {
  clientName: string;
  service: string;
  estimatedDuration: number;
  startTime: Date;
  isPaused: boolean;
}

const CuttingTimer: React.FC<CuttingTimerProps> = ({ 
  clientName, 
  service, 
  estimatedDuration, 
  startTime,
  isPaused 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedSeconds = estimatedDuration * 60;
  const isOvertime = elapsedTime > estimatedSeconds;
  const progressPercentage = Math.min((elapsedTime / estimatedSeconds) * 100, 100);

  return (
    <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="w-5 h-5" />
          Cronômetro do Corte
          {isPaused && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Pause className="w-3 h-3 mr-1" />
              PAUSADO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">{clientName}</h3>
            <p className="text-blue-600">{service}</p>
          </div>
          
          <div className="text-center">
            <div className={`text-4xl font-bold ${isOvertime ? 'text-red-600' : 'text-blue-800'}`}>
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-blue-600">
              Estimado: {estimatedDuration}min ({formatTime(estimatedSeconds)})
            </div>
          </div>

          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isOvertime ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {isOvertime && (
            <div className="text-center">
              <Badge variant="destructive">
                Ultrapassou em {formatTime(elapsedTime - estimatedSeconds)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CuttingTimer;
