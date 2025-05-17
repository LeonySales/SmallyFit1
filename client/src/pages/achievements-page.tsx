import { Button } from "@/components/ui/button";
import { Medal } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Conquistas</h2>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe seu progresso</p>
      </div>
      
      {/* Placeholder Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center py-16">
        <div className="h-16 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Medal className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Suas Conquistas</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          Continue sua jornada fitness e desbloqueie medalhas e conquistas pelo seu progresso.
        </p>
        <Button>
          Ver conquistas
        </Button>
      </div>
    </div>
  );
}
