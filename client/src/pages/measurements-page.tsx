import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MeasurementForm } from "@/components/measurements/measurement-form";
import { Clock, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { 
  getMeasurements, 
  saveMeasurements, 
  isWithinFreeTrial, 
  getUserSettings 
} from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Usando o tipo do histórico de medições do localStorage
import { MeasurementHistoryData } from "@/lib/localStorage";

type Measurement = {
  id: number;
  userId: number;
  weight: number;
  height: number;
  waist?: number;
  hip?: number;
  arms?: number;
  createdAt: string;
};

export default function MeasurementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [measurementList, setMeasurementList] = useState<Measurement[]>([]);
  const [trialActive, setTrialActive] = useState(true);
  
  // Verificar período de teste e carregar medições do localStorage
  useEffect(() => {
    if (user?.id) {
      // Verificar período de teste
      const isActive = isWithinFreeTrial(user.id);
      setTrialActive(isActive);
      
      if (!isActive) {
        toast({
          title: "Período gratuito encerrado",
          description: "Algumas funcionalidades estão limitadas. Torne-se Premium para acesso completo.",
          variant: "destructive"
        });
      }
      
      // Carregar medições do localStorage
      const localMeasurements = getMeasurements(user.id);
      if (localMeasurements && Array.isArray(localMeasurements)) {
        // Ordenar por data (mais recente primeiro)
        const sortedMeasurements = [...localMeasurements].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMeasurementList(sortedMeasurements);
      }
    }
  }, [user?.id, toast]);
  
  // Adicionar nova medição
  const addMeasurement = (newMeasurement: Omit<Measurement, 'id' | 'userId' | 'createdAt'>) => {
    if (!user?.id) return;
    
    // Verificar limitação do período gratuito
    if (!trialActive && measurementList.length >= 3) {
      toast({
        title: "Funcionalidade limitada",
        description: "Torne-se Premium para registrar mais medições",
        variant: "destructive"
      });
      return;
    }
    
    // Criar nova medição
    const measurement: Measurement = {
      id: Date.now(),
      userId: user.id,
      ...newMeasurement,
      createdAt: new Date().toISOString()
    };
    
    // Atualizar lista local
    const updatedList = [measurement, ...measurementList];
    setMeasurementList(updatedList);
    
    // Salvar no localStorage usando nossa função helper
    saveMeasurements(user.id, updatedList);
    
    toast({
      title: "Medidas salvas",
      description: "Suas medidas foram atualizadas com sucesso!"
    });
  };
  
  // Obter última medição (a mais recente)
  const latestMeasurement = measurementList.length > 0 ? measurementList[0] : null;
  const isLoading = false;
  
  // Histórico de medições (limitado no período gratuito)
  const measurementHistory = trialActive ? measurementList : measurementList.slice(0, 3);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Suas medidas</h2>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe seu progresso físico</p>
      </div>
      
      {/* Current Measurements */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Última atualização</h3>
          {latestMeasurement && (
            <span className="text-xs py-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(latestMeasurement.createdAt)}
            </span>
          )}
        </div>
        
        {isLoading ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            Carregando suas medidas...
          </p>
        ) : latestMeasurement ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Peso</p>
                <p className="font-bold text-xl">{latestMeasurement.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Altura</p>
                <p className="font-bold text-xl">{latestMeasurement.height} cm</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cintura</p>
                <p className="font-bold text-xl">{latestMeasurement.waist} cm</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Quadril</p>
                <p className="font-bold text-xl">{latestMeasurement.hip} cm</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Braços</p>
                <p className="font-bold text-xl">{latestMeasurement.arms} cm</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            Nenhuma medida registrada ainda
          </p>
        )}
        
        <Button 
          variant="link" 
          className="mt-4 p-0 h-auto" 
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="h-4 w-4 mr-1" />
          {showHistory ? "Esconder histórico" : "Ver histórico"}
        </Button>
        
        {showHistory && measurementHistory && measurementHistory.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">Histórico de medidas</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2">Data</th>
                    <th className="text-right py-2">Peso</th>
                    <th className="text-right py-2">Cintura</th>
                    <th className="text-right py-2">Quadril</th>
                    <th className="text-right py-2">Braços</th>
                  </tr>
                </thead>
                <tbody>
                  {measurementHistory.map((measurement) => (
                    <tr key={measurement.id} className="border-b border-slate-200 dark:border-slate-800">
                      <td className="py-2">{formatDate(measurement.createdAt)}</td>
                      <td className="text-right py-2">{measurement.weight} kg</td>
                      <td className="text-right py-2">{measurement.waist} cm</td>
                      <td className="text-right py-2">{measurement.hip} cm</td>
                      <td className="text-right py-2">{measurement.arms} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Add New Measurements */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-lg mb-4">Atualizar medidas</h3>
        
        {!trialActive && measurementList.length >= 3 ? (
          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Funcionalidade limitada</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Você atingiu o limite de 3 registros de medidas no plano gratuito.
            </p>
            <a
              href="https://pay.kiwify.com.br/Yc34ebd"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full" variant="default">
                Assinar Premium - R$49,90/mês
              </Button>
            </a>
          </div>
        ) : (
          <MeasurementForm 
            currentMeasurements={latestMeasurement} 
            onSuccess={(data) => {
              addMeasurement({
                weight: parseFloat(data.weight),
                height: parseFloat(data.height),
                waist: parseFloat(data.waist || '0'),
                hip: parseFloat(data.hip || '0'),
                arms: parseFloat(data.arms || '0'),
              });
              setShowHistory(true);
            }}
          />
        )}
      </div>
      
      {/* Premium Banner - Mostrado apenas para usuários no plano gratuito */}
      {!trialActive && (
        <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-bold mb-2">Desbloqueie todas as funcionalidades</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Registre medidas ilimitadas e tenha acesso a recursos avançados de acompanhamento
              </p>
              <a
                href="https://pay.kiwify.com.br/Yc34ebd"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full" size="sm">
                  Assinar Premium - R$49,90/mês
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
