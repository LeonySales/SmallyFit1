import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BmiChart } from "@/components/bmi/bmi-chart";
import { Button } from "@/components/ui/button";

interface BmiHistoryEntry {
  date: string;
  bmi: number;
}

interface WeightHistoryEntry {
  date: string;
  weight: number;
}

export default function BmiPage() {
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1A'>('3M');
  
  // Fetch user's BMI history
  const { data: bmiHistory } = useQuery({
    queryKey: ["/api/bmi/history", timeRange],
    queryFn: () => {
      // Would normally fetch from API
      return [
        { date: "Mar", bmi: 25.2 },
        { date: "Abr", bmi: 25.0 },
        { date: "Mai", bmi: 24.8 },
        { date: "Jun", bmi: 24.6 },
        { date: "Jul", bmi: 24.5 },
        { date: "Ago", bmi: 24.3 },
        { date: "Set", bmi: 24.1 },
      ] as BmiHistoryEntry[];
    }
  });
  
  // Fetch user's weight history
  const { data: weightHistory } = useQuery({
    queryKey: ["/api/weight/history"],
    queryFn: () => {
      // Would normally fetch from API
      return {
        startWeight: 78.0,
        currentWeight: 75.5,
        goalWeight: 72.0,
        progress: 50
      };
    }
  });
  
  // Current BMI calculation based on latest data
  const { data: currentBmi } = useQuery({
    queryKey: ["/api/bmi/current"],
    queryFn: () => {
      // Would normally fetch from API
      return { bmi: 24.5 };
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">IMC e Progresso</h2>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe seu índice de massa corporal</p>
      </div>
      
      {/* Current BMI */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-medium text-lg mb-3">Seu IMC atual</h3>
        
        {currentBmi && <BmiChart bmi={currentBmi.bmi} />}
      </div>
      
      {/* BMI Progress Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-lg">Histórico de IMC</h3>
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === '3M' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('3M')}
              className="h-7 px-2 text-xs"
            >
              3M
            </Button>
            <Button 
              variant={timeRange === '6M' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('6M')}
              className="h-7 px-2 text-xs"
            >
              6M
            </Button>
            <Button 
              variant={timeRange === '1A' ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setTimeRange('1A')}
              className="h-7 px-2 text-xs"
            >
              1A
            </Button>
          </div>
        </div>
        
        {bmiHistory && (
          <div className="h-48 relative">
            <div className="absolute inset-0 flex items-end">
              <div className="h-full w-full flex items-end">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline 
                    points={bmiHistory.map((entry, index) => {
                      const x = (index / (bmiHistory.length - 1)) * 100;
                      // Map BMI range to chart height (30 = max BMI, 15 = min BMI)
                      const y = 100 - ((entry.bmi - 15) / 15) * 100;
                      return `${x},${y}`;
                    }).join(' ')} 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-primary" 
                    strokeWidth="2" 
                    vectorEffect="non-scaling-stroke" 
                  />
                  
                  {bmiHistory.map((entry, index) => {
                    const x = (index / (bmiHistory.length - 1)) * 100;
                    const y = 100 - ((entry.bmi - 15) / 15) * 100;
                    return (
                      <circle 
                        key={index}
                        cx={x} 
                        cy={y} 
                        r="2" 
                        className="fill-current text-primary" 
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          {bmiHistory?.map((entry, index) => (
            <span key={index}>{entry.date}</span>
          ))}
        </div>
      </div>
      
      {/* Weight Progress */}
      {weightHistory && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Progresso de peso</h3>
            <span className="text-primary dark:text-primary text-sm font-medium">
              {weightHistory.startWeight > weightHistory.currentWeight 
                ? `-${(weightHistory.startWeight - weightHistory.currentWeight).toFixed(1)}kg` 
                : `+${(weightHistory.currentWeight - weightHistory.startWeight).toFixed(1)}kg`}
            </span>
          </div>
          
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-16">Início</span>
            <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center px-2 justify-end">
              <span className="text-xs font-medium">{weightHistory.startWeight.toFixed(1)} kg</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-16">Atual</span>
            <div className="flex-1 h-6 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center px-2 justify-end">
              <span className="text-xs font-medium">{weightHistory.currentWeight.toFixed(1)} kg</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Meta: {weightHistory.goalWeight.toFixed(1)} kg</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {weightHistory.progress}% completo
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${weightHistory.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
