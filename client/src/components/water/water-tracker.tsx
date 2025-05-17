import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface WaterTrackerProps {
  currentAmount: number;
  goalAmount: number;
}

export function WaterTracker({ currentAmount, goalAmount }: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState<number>(250);
  const queryClient = useQueryClient();
  
  const waterMutation = useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const res = await apiRequest("POST", "/api/water", { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/water/history"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const addWater = (amount: number) => {
    toast({
      title: `${amount}ml adicionado`,
      description: "Sua hidratação foi atualizada!",
    });
    waterMutation.mutate({ amount });
  };
  
  const removeWater = () => {
    const amount = -customAmount;
    toast({
      title: `${Math.abs(amount)}ml removido`,
      description: "Sua hidratação foi atualizada!",
    });
    waterMutation.mutate({ amount });
  };
  
  const percentage = Math.round((currentAmount / goalAmount) * 100);
  
  return (
    <div className="space-y-6">
      {/* Water bottle visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-64">
          {/* Water bottle outline */}
          <div className="absolute inset-0 border-4 border-cyan-500 rounded-b-3xl rounded-t-lg"></div>
          
          {/* Water level */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-cyan-500/60 rounded-b-3xl transition-all duration-500 ease-in-out" 
            style={{ height: `${Math.min(100, percentage)}%` }}
          ></div>
          
          {/* Water amount text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">
              {currentAmount}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / {goalAmount} ml
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Progresso diário</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {percentage}% completo
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full">
          <div 
            className="h-full bg-cyan-500 rounded-full transition-all" 
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Quick add buttons */}
      <div className="flex justify-center space-x-4">
        {[100, 250, 500].map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="h-16 w-16 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-medium">{amount}ml</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {amount === 100 ? "copo" : amount === 250 ? "copo" : "garrafa"}
            </span>
          </button>
        ))}
      </div>
      
      {/* Add/Remove buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => addWater(customAmount)}
          disabled={waterMutation.isPending}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Adicionar
        </Button>
        <Button 
          variant="outline" 
          onClick={removeWater}
          disabled={waterMutation.isPending || currentAmount <= 0}
        >
          <MinusCircle className="mr-1 h-4 w-4" /> Remover
        </Button>
      </div>
      
      {/* Custom amount */}
      <div className="flex space-x-2">
        <Input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
          min={1}
          className="flex-1"
        />
        <Button 
          onClick={() => addWater(customAmount)}
          disabled={waterMutation.isPending || customAmount <= 0}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}
