import { useMemo } from "react";

interface BmiChartProps {
  bmi: number;
}

export function BmiChart({ bmi }: BmiChartProps) {
  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) return { name: "Abaixo do peso", color: "text-blue-500" };
    if (bmi < 25) return { name: "Peso saudável", color: "text-green-500" };
    if (bmi < 30) return { name: "Sobrepeso", color: "text-yellow-500" };
    return { name: "Obesidade", color: "text-red-500" };
  }, [bmi]);

  // Calculate stroke offset for the circle
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const dashOffset = circumference * (1 - ((bmi - 10) / 30));
  
  // Calculate the position on the range bar
  let position = ((bmi - 15) / 25) * 100;
  position = Math.max(0, Math.min(position, 100)); // Clamp between 0 and 100%

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="8" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="currentColor" 
            className="text-primary" 
            strokeWidth="8" 
            strokeDasharray={circumference} 
            strokeDashoffset={dashOffset} 
            transform="rotate(-90 50 50)" 
          />
          <text x="50" y="50" fontSize="16" textAnchor="middle" dominantBaseline="middle" className="fill-current font-bold">
            {bmi.toFixed(1)}
          </text>
        </svg>
      </div>
      
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Abaixo</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Normal</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sobrepeso</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Obeso</span>
        </div>
        
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full flex mb-4 relative">
          <div className="h-full bg-blue-500 rounded-l-full" style={{ width: "18.5%" }}></div>
          <div className="h-full bg-green-500" style={{ width: "24.9%" }}></div>
          <div className="h-full bg-yellow-500" style={{ width: "29.9%" }}></div>
          <div className="h-full bg-red-500 rounded-r-full" style={{ width: "26.7%" }}></div>
          
          {/* Marker for current BMI */}
          <div 
            className="absolute top-0 w-2 h-4 bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-white rounded-full -translate-x-1/2" 
            style={{ left: `${position}%`, top: "-4px" }}
          ></div>
        </div>
        
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Classificação</p>
            <p className={`font-medium ${bmiCategory.color}`}>{bmiCategory.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Faixa ideal</p>
            <p className="font-medium">18.5 - 24.9</p>
          </div>
        </div>
      </div>
    </div>
  );
}
