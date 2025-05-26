
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface ServiceFilterProps {
  services: string[];
  selectedService: string | null;
  onServiceSelect: (service: string | null) => void;
  clientCounts: Record<string, number>;
}

const ServiceFilter: React.FC<ServiceFilterProps> = ({
  services,
  selectedService,
  onServiceSelect,
  clientCounts
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtrar por Serviço</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedService === null ? "default" : "outline"}
            size="sm"
            onClick={() => onServiceSelect(null)}
            className="text-xs"
          >
            Todos
            <Badge variant="secondary" className="ml-2">
              {Object.values(clientCounts).reduce((a, b) => a + b, 0)}
            </Badge>
          </Button>
          
          {services.map((service) => (
            <Button
              key={service}
              variant={selectedService === service ? "default" : "outline"}
              size="sm"
              onClick={() => onServiceSelect(service)}
              className="text-xs"
            >
              {service}
              <Badge variant="secondary" className="ml-2">
                {clientCounts[service] || 0}
              </Badge>
            </Button>
          ))}
          
          {selectedService && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onServiceSelect(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceFilter;
