import { useQuery } from "@tanstack/react-query";
import { WaterTracker } from "@/components/water/water-tracker";

interface WaterEntry {
  day: string;
  amount: number;
}

export default function WaterPage() {
  // Fetch today's water data
  const { data: todayWater, isLoading } = useQuery({
    queryKey: ["/api/water/today"],
    queryFn: () => {
      // Would normally fetch from API
      return {
        current: 650,
        goal: 2000
      };
    }
  });
  
  // Fetch weekly water history
  const { data: weeklyHistory } = useQuery({
    queryKey: ["/api/water/history"],
    queryFn: () => {
      // Would normally fetch from API
      return [
        { day: "Seg", amount: 1800 },
        { day: "Ter", amount: 2000 },
        { day: "Qua", amount: 1700 },
        { day: "Qui", amount: 1300 },
        { day: "Sex", amount: 1600 },
        { day: "Sáb", amount: 1400 },
        { day: "Hoje", amount: 650 },
      ] as WaterEntry[];
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Controle de Água</h2>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe sua hidratação diária</p>
      </div>
      
      {/* Today's Water Intake */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-medium text-lg mb-4">Hoje</h3>
        
        {isLoading ? (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            Carregando dados de hidratação...
          </p>
        ) : todayWater ? (
          <WaterTracker 
            currentAmount={todayWater.current} 
            goalAmount={todayWater.goal} 
          />
        ) : (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhum dado disponível
          </p>
        )}
      </div>
      
      {/* Weekly History */}
      {weeklyHistory && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm">
          <h3 className="font-medium text-lg mb-4">Histórico semanal</h3>
          
          <div className="space-y-3">
            {weeklyHistory.map((entry, index) => {
              const percentage = Math.min(100, (entry.amount / 2000) * 100);
              
              return (
                <div key={index} className="flex items-center">
                  <span className="w-10 text-sm text-slate-500 dark:text-slate-400">
                    {entry.day}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div 
                        className="h-full bg-cyan-500 rounded-full flex items-center justify-end px-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs text-white font-medium">
                            {entry.amount}ml
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
