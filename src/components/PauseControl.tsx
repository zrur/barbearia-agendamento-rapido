
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Coffee } from 'lucide-react';

interface PauseControlProps {
  isPaused: boolean;
  onTogglePause: () => void;
  pauseStartTime?: Date;
}

const PauseControl: React.FC<PauseControlProps> = ({ 
  isPaused, 
  onTogglePause, 
  pauseStartTime 
}) => {
  const [pauseDuration, setPauseDuration] = React.useState(0);

  React.useEffect(() => {
    if (!isPaused || !pauseStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - pauseStartTime.getTime()) / 1000);
      setPauseDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, pauseStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`transition-all duration-300 ${
      isPaused 
        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className={`w-5 h-5 ${isPaused ? 'text-yellow-600' : 'text-gray-400'}`} />
            <div>
              <h3 className="font-semibold text-gray-800">
                {isPaused ? 'Fila Pausada' : 'Fila Ativa'}
              </h3>
              {isPaused && pauseStartTime && (
                <p className="text-sm text-yellow-600">
                  Pausado há {formatTime(pauseDuration)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPaused && (
              <Badge className="bg-yellow-100 text-yellow-800">
                INTERVALO
              </Badge>
            )}
            <Button
              onClick={onTogglePause}
              variant={isPaused ? "default" : "outline"}
              className={isPaused 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
              }
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Retomar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PauseControl;
