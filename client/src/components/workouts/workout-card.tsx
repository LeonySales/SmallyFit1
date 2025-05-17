import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface WorkoutCardProps {
  id: number;
  title: string;
  type: string;
  exercises: Exercise[];
  date: string;
  isToday: boolean;
}

export function WorkoutCard({ id, title, type, exercises, date, isToday }: WorkoutCardProps) {
  const [expandedExercises, setExpandedExercises] = useState(isToday);
  const queryClient = useQueryClient();
  
  const toggleExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, completed }: { exerciseId: number, completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/exercises/${exerciseId}`, { completed });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/today"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/workouts/${id}/complete`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Treino concluído",
        description: "Seu treino foi marcado como concluído!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/today"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleExercise = (exerciseId: number, currentStatus: boolean) => {
    toggleExerciseMutation.mutate({ 
      exerciseId, 
      completed: !currentStatus 
    });
  };
  
  const completeWorkout = () => {
    completeWorkoutMutation.mutate();
  };
  
  return (
    <div className={`rounded-xl p-5 shadow-sm ${isToday ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{date}</p>
        </div>
        <span className="text-xs py-1 px-2 bg-primary-100 dark:bg-primary-900 text-primary dark:text-primary-400 rounded-full">
          {type}
        </span>
      </div>
      
      {expandedExercises && (
        <div className="space-y-4 mb-4">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id} 
              className={`flex items-center p-3 border rounded-lg ${
                exercise.completed 
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10' 
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex-1">
                <h4 className="font-medium mb-1">{exercise.name}</h4>
                <div className="flex text-sm text-slate-500 dark:text-slate-400">
                  <span className="mr-3">{exercise.sets} séries</span>
                  <span>{exercise.reps} repetições</span>
                </div>
              </div>
              <button 
                onClick={() => toggleExercise(exercise.id, exercise.completed)}
                className={`p-2 ${
                  exercise.completed 
                    ? 'text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-slate-500 hover:text-primary dark:hover:text-primary'
                }`}
                disabled={toggleExerciseMutation.isPending}
              >
                <CheckCircle className={`h-6 w-6 ${exercise.completed ? 'fill-primary-100 dark:fill-primary-900' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary dark:text-primary h-auto p-0"
          onClick={() => setExpandedExercises(!expandedExercises)}
        >
          <Edit className="h-4 w-4 mr-1" />
          {expandedExercises ? "Esconder treino" : "Ver treino"}
        </Button>
        
        {isToday && expandedExercises && (
          <Button 
            variant="secondary"
            size="sm"
            onClick={completeWorkout}
            disabled={completeWorkoutMutation.isPending}
          >
            Concluir treino
          </Button>
        )}
      </div>
    </div>
  );
}
