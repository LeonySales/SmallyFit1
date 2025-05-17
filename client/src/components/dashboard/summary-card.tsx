interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  progress?: number;
  progressMax?: number;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  progressMax,
}: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-slate-800 dark:text-slate-200">{title}</h3>
        <div className="text-primary dark:text-primary">{icon}</div>
      </div>
      
      {progress !== undefined && progressMax !== undefined ? (
        <>
          <div className="flex items-end">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 ml-1">/ {progressMax} ml</p>
          </div>
          <div className="mt-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (Number(progress) / Number(progressMax)) * 100)}%` }}
            ></div>
          </div>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </>
      )}
    </div>
  );
}
