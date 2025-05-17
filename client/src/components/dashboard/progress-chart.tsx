import { useState } from 'react';

interface ProgressChartProps {
  weekData: {
    day: string;
    value: number;
  }[];
}

export function ProgressChart({ weekData }: ProgressChartProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  
  // Calculate max value for proper scaling
  const maxValue = Math.max(...weekData.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between mb-4">
        <button 
          className={`text-sm font-medium ${timeRange === 'week' ? 'text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-400'}`}
          onClick={() => setTimeRange('week')}
        >
          Semana
        </button>
        <button 
          className={`text-sm font-medium ${timeRange === 'month' ? 'text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-400'}`}
          onClick={() => setTimeRange('month')}
        >
          Mês
        </button>
        <button 
          className={`text-sm font-medium ${timeRange === 'quarter' ? 'text-primary dark:text-primary' : 'text-slate-600 dark:text-slate-400'}`}
          onClick={() => setTimeRange('quarter')}
        >
          3 meses
        </button>
      </div>
      
      <div className="h-40 flex items-end space-x-2">
        {weekData.map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-t-md relative overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-primary-500 dark:bg-primary-400 rounded-t-md" 
                style={{ height: `${(day.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1 text-slate-500 dark:text-slate-400">{day.day}</span>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        Progresso geral: bom
      </p>
    </div>
  );
}
