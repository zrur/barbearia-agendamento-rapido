
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Client } from '@/pages/Index';
import type { CompletedClient } from '@/components/CompletedClientsHistory';

interface ExportReportProps {
  waitingClients: Client[];
  completedClients: CompletedClient[];
  currentClient?: Client;
}

const ExportReport: React.FC<ExportReportProps> = ({
  waitingClients,
  completedClients,
  currentClient
}) => {
  const generateReport = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const totalClients = waitingClients.length + completedClients.length + (currentClient ? 1 : 0);
    
    const avgTime = completedClients.length > 0 
      ? Math.round(completedClients.reduce((acc, client) => 
          acc + Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60)), 0) / completedClients.length)
      : 0;

    const serviceStats = completedClients.reduce((acc, client) => {
      acc[client.service] = (acc[client.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let report = `RELATÓRIO DIÁRIO - BARBERSHOP PRO\n`;
    report += `Data: ${today}\n`;
    report += `=====================================\n\n`;
    
    report += `RESUMO DO DIA:\n`;
    report += `• Total de clientes: ${totalClients}\n`;
    report += `• Atendimentos concluídos: ${completedClients.length}\n`;
    report += `• Na fila: ${waitingClients.length}\n`;
    report += `• Em atendimento: ${currentClient ? 1 : 0}\n`;
    report += `• Tempo médio de atendimento: ${avgTime}min\n\n`;

    if (Object.keys(serviceStats).length > 0) {
      report += `SERVIÇOS REALIZADOS:\n`;
      Object.entries(serviceStats).forEach(([service, count]) => {
        report += `• ${service}: ${count} atendimentos\n`;
      });
      report += `\n`;
    }

    if (completedClients.length > 0) {
      report += `HISTÓRICO DE ATENDIMENTOS:\n`;
      completedClients.forEach((client, index) => {
        const duration = Math.floor((client.endTime.getTime() - client.startTime.getTime()) / (1000 * 60));
        report += `${index + 1}. ${client.name} - ${client.service} (${duration}min)\n`;
        report += `   ${client.startTime.toLocaleTimeString('pt-BR')} - ${client.endTime.toLocaleTimeString('pt-BR')}\n\n`;
      });
    }

    if (waitingClients.length > 0) {
      report += `FILA ATUAL:\n`;
      waitingClients.forEach((client, index) => {
        report += `${index + 1}. ${client.name} - ${client.service}\n`;
        report += `   Chegada: ${client.arrivalTime.toLocaleTimeString('pt-BR')}\n\n`;
      });
    }

    // Criar e baixar arquivo
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-barbershop-${today.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "O arquivo foi baixado com sucesso.",
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="w-5 h-5" />
          Relatório do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('pt-BR')}
            </div>
            <p>Gere um relatório completo do dia com estatísticas e histórico de atendimentos.</p>
          </div>
          
          <Button 
            onClick={generateReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportReport;
