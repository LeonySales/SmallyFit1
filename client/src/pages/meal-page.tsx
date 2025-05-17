import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

export default function MealPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Cardápio</h2>
        <p className="text-slate-600 dark:text-slate-400">Gerencie sua alimentação</p>
      </div>
      
      {/* Placeholder Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center py-16">
        <div className="h-16 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
          <Utensils className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Cardápio e Refeições</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          Configure seu plano alimentar e acompanhe as refeições diárias para alcançar seus objetivos.
        </p>
        <Button>
          Criar cardápio
        </Button>
      </div>
    </div>
  );
}
