import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MeasurementForm } from "@/components/measurements/measurement-form";
import { Clock, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Measurement = {
  id: number;
  userId: number;
  weight: number;
  height: number;
  waist: number;
  hip: number;
  arms: number;
  createdAt: string;
};

export default function MeasurementsPage() {
  const [showHistory, setShowHistory] = useState(false);
  
  // Fetch latest measurements
  const { data: latestMeasurement, isLoading } = useQuery({
    queryKey: ["/api/measurements/latest"],
    queryFn: () => {
      // This would normally fetch from an API
      return {
        id: 1,
        userId: 1,
        weight: 75.5,
        height: 176,
        waist: 82,
        hip: 98,
        arms: 36,
        createdAt: new Date().toISOString(),
      } as Measurement;
    }
  });
  
  // Fetch measurement history
  const { data: measurementHistory } = useQuery({
    queryKey: ["/api/measurements/history"],
    queryFn: () => {
      // This would normally fetch from an API
      return [
        {
          id: 1,
          userId: 1,
          weight: 75.5,
          height: 176,
          waist: 82,
          hip: 98,
          arms: 36,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          weight: 76.2,
          height: 176,
          waist: 83,
          hip: 99,
          arms: 36.5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          userId: 1,
          weight: 77.8,
          height: 176,
          waist: 84,
          hip: 100,
          arms: 37,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ] as Measurement[];
    }
  });
  
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
        <MeasurementForm 
          currentMeasurements={latestMeasurement} 
          onSuccess={() => setShowHistory(false)}
        />
      </div>
    </div>
  );
}
