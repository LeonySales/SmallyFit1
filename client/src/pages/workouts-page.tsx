import { useQuery } from "@tanstack/react-query";
import { WorkoutCard } from "@/components/workouts/workout-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface Workout {
  id: number;
  title: string;
  type: string;
  date: string;
  dayOfWeek: string;
  exercises: Exercise[];
  isToday: boolean;
}

export default function WorkoutsPage() {
  // Fetch today's workout
  const { data: todayWorkout, isLoading: loadingToday } = useQuery({
    queryKey: ["/api/workouts/today"],
    queryFn: () => {
      // Would normally fetch from API
      return {
        id: 1,
        title: "Treino de hoje",
        type: "Pernas",
        date: "Segunda-feira",
        dayOfWeek: "Seg",
        exercises: [
          { id: 1, name: "Agachamento", sets: 4, reps: 12, completed: false },
          { id: 2, name: "Leg Press", sets: 3, reps: 15, completed: false },
          { id: 3, name: "Cadeira Extensora", sets: 3, reps: 12, completed: false },
          { id: 4, name: "Cadeira Flexora", sets: 3, reps: 12, completed: false },
        ],
        isToday: true
      } as Workout;
    }
  });
  
  // Fetch weekly schedule
  const { data: weekSchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ["/api/workouts/schedule"],
    queryFn: () => {
      // Would normally fetch from API
      return [
        {
          id: 1,
          title: "Treino de hoje",
          type: "Pernas",
          date: "Segunda-feira",
          dayOfWeek: "Seg",
          isToday: true,
          exercises: [
            { id: 1, name: "Agachamento", sets: 4, reps: 12, completed: false },
            { id: 2, name: "Leg Press", sets: 3, reps: 15, completed: false },
            { id: 3, name: "Cadeira Extensora", sets: 3, reps: 12, completed: false },
            { id: 4, name: "Cadeira Flexora", sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: 2,
          title: "Peito e Tríceps",
          type: "Peito/Tríceps",
          date: "Terça-feira",
          dayOfWeek: "Ter",
          isToday: false,
          exercises: [
            { id: 5, name: "Supino Reto", sets: 4, reps: 10, completed: false },
            { id: 6, name: "Crucifixo", sets: 3, reps: 12, completed: false },
            { id: 7, name: "Tríceps Corda", sets: 3, reps: 15, completed: false },
          ],
        },
        {
          id: 3,
          title: "Descanso",
          type: "Descanso",
          date: "Quarta-feira",
          dayOfWeek: "Qua",
          isToday: false,
          exercises: [],
        },
        {
          id: 4,
          title: "Costas e Bíceps",
          type: "Costas/Bíceps",
          date: "Quinta-feira",
          dayOfWeek: "Qui",
          isToday: false,
          exercises: [
            { id: 8, name: "Puxada Frontal", sets: 4, reps: 12, completed: false },
            { id: 9, name: "Remada Curvada", sets: 3, reps: 10, completed: false },
            { id: 10, name: "Rosca Direta", sets: 3, reps: 12, completed: false },
          ],
        },
        {
          id: 5,
          title: "Ombros",
          type: "Ombros",
          date: "Sexta-feira",
          dayOfWeek: "Sex",
          isToday: false,
          exercises: [
            { id: 11, name: "Desenvolvimento", sets: 4, reps: 10, completed: false },
            { id: 12, name: "Elevação Lateral", sets: 3, reps: 12, completed: false },
            { id: 13, name: "Encolhimento", sets: 3, reps: 15, completed: false },
          ],
        },
      ] as Workout[];
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Seus treinos</h2>
        <p className="text-slate-600 dark:text-slate-400">Gerencie sua rotina de exercícios</p>
      </div>
      
      {/* Today's Workout */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-4">Treino de hoje</h3>
        
        {loadingToday ? (
          <p className="text-center py-4 text-slate-500 dark:text-slate-400">
            Carregando seu treino de hoje...
          </p>
        ) : todayWorkout ? (
          <WorkoutCard 
            id={todayWorkout.id}
            title={todayWorkout.title}
            type={todayWorkout.type}
            exercises={todayWorkout.exercises}
            date={todayWorkout.date}
            isToday={true}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm text-center">
            <p className="text-slate-500 dark:text-slate-400 py-4">
              Você não tem treinos programados para hoje.
            </p>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Adicionar treino
            </Button>
          </div>
        )}
      </div>
      
      {/* Weekly Schedule */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-4">Agenda semanal</h3>
        
        {loadingSchedule ? (
          <p className="text-center py-4 text-slate-500 dark:text-slate-400">
            Carregando sua agenda...
          </p>
        ) : weekSchedule && weekSchedule.length > 0 ? (
          <div className="space-y-3">
            {weekSchedule.map((workout) => (
              <div key={workout.id} className="flex items-center">
                <div className="w-16 flex flex-col items-center">
                  <span className="text-sm font-medium">{workout.dayOfWeek}</span>
                  {workout.isToday && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">Hoje</span>
                  )}
                </div>
                <div className="flex-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <h4 className="font-medium">{workout.type}</h4>
                  {workout.exercises.length > 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {workout.exercises.length} exercícios • {workout.exercises.length * 10 + 15} min
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Recuperação muscular
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-slate-500 dark:text-slate-400">
            Você não tem treinos programados para esta semana.
          </p>
        )}
      </div>
      
      {/* Add New Workout Button */}
      <Button className="w-full">
        <Plus className="h-4 w-4 mr-1" /> Criar novo treino
      </Button>
    </div>
  );
}
