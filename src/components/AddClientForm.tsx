
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface AddClientFormProps {
  onSubmit: (client: { name: string; service: string; estimatedDuration: number }) => void;
  onCancel: () => void;
}

const services = [
  { name: 'Corte Simples', duration: 30 },
  { name: 'Corte + Barba', duration: 45 },
  { name: 'Corte + Sobrancelha', duration: 35 },
  { name: 'Corte Completo', duration: 60 },
  { name: 'Apenas Barba', duration: 20 },
  { name: 'Acabamento', duration: 15 }
];

const AddClientForm: React.FC<AddClientFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && service) {
      onSubmit({ name: name.trim(), service, estimatedDuration });
      setName('');
      setService('');
      setEstimatedDuration(30);
    }
  };

  const handleServiceChange = (selectedService: string) => {
    setService(selectedService);
    const serviceData = services.find(s => s.name === selectedService);
    if (serviceData) {
      setEstimatedDuration(serviceData.duration);
    }
  };

  return (
    <Card className="max-w-md mx-auto mb-8 bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-gray-800">Adicionar Cliente</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Nome do Cliente</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="service" className="text-gray-700">Serviço</Label>
            <Select value={service} onValueChange={handleServiceChange} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((serviceOption) => (
                  <SelectItem key={serviceOption.name} value={serviceOption.name}>
                    {serviceOption.name} ({serviceOption.duration}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            Tempo estimado: {estimatedDuration} minutos
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddClientForm;
