import { useAuth } from "@/hooks/use-auth";
import { HeartPulse, Droplets } from "lucide-react";
import { MotivationalCard } from "@/components/dashboard/motivational-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Mock data for week progress chart
  const weekData = [
    { day: "Seg", value: 40 },
    { day: "Ter", value: 60 },
    { day: "Qua", value: 75 },
    { day: "Qui", value: 55 },
    { day: "Sex", value: 80 },
    { day: "Sáb", value: 65 },
    { day: "Dom", value: 30 },
  ];
  
  // Example query for user stats (in a real app, this would fetch from API)
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: () => {
      // This would normally fetch from an API
      return {
        bmi: 24.5,
        bmiStatus: "Peso saudável",
        waterCurrent: 650,
        waterGoal: 2000
      };
    }
  });
  
  const firstName = user?.name.split(" ")[0] || "Usuário";
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-1">
          Olá, {firstName}!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Vamos alcançar suas metas hoje?
        </p>
      </div>
      
      {/* Motivational card */}
      <MotivationalCard />
      
      {/* Quick summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="IMC atual"
          value={userStats?.bmi || "--"}
          subtitle={userStats?.bmiStatus || "Carregando..."}
          icon={<HeartPulse className="h-5 w-5" />}
        />
        <SummaryCard
          title="Água hoje"
          value={userStats?.waterCurrent || 0}
          subtitle=""
          icon={<Droplets className="h-5 w-5 text-cyan-500" />}
          progress={userStats?.waterCurrent}
          progressMax={userStats?.waterGoal}
        />
      </div>
      
      {/* Today's Activities */}
      <div>
        <h3 className="font-heading font-semibold text-lg mb-3">Atividades de hoje</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium">Treino de pernas</h4>
              <span className="text-xs py-1 px-2 bg-primary-100 dark:bg-primary-900 text-primary dark:text-primary-400 rounded-full">15:30</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Treino de força com foco em quadríceps e glúteos
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium">Medição semanal</h4>
              <span className="text-xs py-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">Hoje</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Lembre-se de registrar suas medidas para acompanhar seu progresso
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Progress */}
      <div>
        <h3 className="font-heading font-semibold text-lg mb-3">Seu progresso</h3>
        <ProgressChart weekData={weekData} />
      </div>
    </div>
  );
}
