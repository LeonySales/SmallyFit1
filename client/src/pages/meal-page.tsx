import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Utensils, Plus, Search, Coffee, UtensilsCrossed, Pizza, Apple, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  getFoodIntake, 
  saveFoodIntake, 
  getUserSettings, 
  calculateCalorieGoal,
  searchFoods,
  commonFoods,
  isWithinFreeTrial
} from "@/lib/localStorage";
import { Progress } from "@/components/ui/progress";

// Definir os tipos para os modelos de dados
interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  servingSize: number;
}

interface Meal {
  id: number;
  userId: number;
  name: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface MealItem {
  id: number;
  mealId: number;
  foodItemId: number;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Schemas para validação de formulários
const foodItemSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  calories: z.coerce.number().min(0, "Calorias não pode ser negativo"),
  protein: z.coerce.number().min(0, "Proteína não pode ser negativa"),
  carbs: z.coerce.number().min(0, "Carboidratos não pode ser negativo"),
  fat: z.coerce.number().min(0, "Gordura não pode ser negativa"),
  fiber: z.coerce.number().min(0, "Fibra não pode ser negativa").optional(),
  sugar: z.coerce.number().min(0, "Açúcar não pode ser negativo").optional(),
  servingSize: z.coerce.number().min(1, "Porção deve ser pelo menos 1g/ml").default(100),
});

const mealSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
});

const mealItemSchema = z.object({
  foodItemId: z.coerce.number().min(1, "Selecione um alimento"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1g/ml"),
});

type FoodItemFormValues = z.infer<typeof foodItemSchema>;
type MealFormValues = z.infer<typeof mealSchema>;
type MealItemFormValues = z.infer<typeof mealItemSchema>;

// Componente para exibir informações nutricionais
const NutritionInfo = ({ calories, protein, carbs, fat }: { calories: number, protein: number, carbs: number, fat: number }) => (
  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
      <div className="text-sm text-slate-500 dark:text-slate-400">Calorias</div>
      <div className="font-bold">{calories}</div>
    </div>
    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
      <div className="text-sm text-slate-500 dark:text-slate-400">Proteína</div>
      <div className="font-bold">{protein}g</div>
    </div>
    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
      <div className="text-sm text-slate-500 dark:text-slate-400">Carboidratos</div>
      <div className="font-bold">{carbs}g</div>
    </div>
    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
      <div className="text-sm text-slate-500 dark:text-slate-400">Gorduras</div>
      <div className="font-bold">{fat}g</div>
    </div>
  </div>
);

// Componente para o formulário de adição de alimentos
const AddFoodItemForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const form = useForm<FoodItemFormValues>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      servingSize: 100,
    },
  });

  const createFoodItem = useMutation({
    mutationFn: async (data: FoodItemFormValues) => {
      const res = await apiRequest("POST", "/api/food-items", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Alimento adicionado",
        description: "O alimento foi adicionado com sucesso.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/food-items"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar alimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FoodItemFormValues) => {
    createFoodItem.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Alimento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Arroz branco" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calorias (por 100g/ml)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="servingSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho da porção (g/ml)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proteínas (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carboidratos (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gorduras (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fiber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fibras (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açúcares (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={createFoodItem.isPending}>
            {createFoodItem.isPending ? "Adicionando..." : "Adicionar Alimento"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Componente para o formulário de criação de refeição
const CreateMealForm = ({ onSuccess }: { onSuccess: (mealId: number) => void }) => {
  const { toast } = useToast();
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const createMeal = useMutation({
    mutationFn: async (data: MealFormValues) => {
      const res = await apiRequest("POST", "/api/meals", data);
      return await res.json();
    },
    onSuccess: (meal: Meal) => {
      toast({
        title: "Refeição criada",
        description: "A refeição foi criada com sucesso.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      onSuccess(meal.id);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar refeição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MealFormValues) => {
    createMeal.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Refeição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Café da Manhã" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="submit" disabled={createMeal.isPending}>
            {createMeal.isPending ? "Criando..." : "Criar Refeição"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Componente para adicionar alimentos a uma refeição
const AddFoodToMealForm = ({ mealId, onSuccess }: { mealId: number, onSuccess: () => void }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items", searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/food-items?q=${encodeURIComponent(searchTerm)}` 
        : "/api/food-items";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao buscar alimentos");
      return res.json();
    },
  });

  const form = useForm<MealItemFormValues>({
    resolver: zodResolver(mealItemSchema),
    defaultValues: {
      foodItemId: 0,
      quantity: 100,
    },
  });

  const addFoodToMeal = useMutation({
    mutationFn: async (data: MealItemFormValues) => {
      const res = await apiRequest("POST", `/api/meals/${mealId}/items`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Alimento adicionado",
        description: "O alimento foi adicionado à refeição com sucesso.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/meals/${mealId}/items`] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar alimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MealItemFormValues) => {
    addFoodToMeal.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Buscar alimentos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="foodItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alimento</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um alimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {foodItems.length === 0 ? (
                      <SelectItem value="0" disabled>Nenhum alimento encontrado</SelectItem>
                    ) : (
                      foodItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.calories} cal / 100g)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (g/ml)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mt-4">
            {(() => {
              const selectedFood = foodItems.find(item => item.id === form.watch("foodItemId"));
              const quantity = form.watch("quantity");
              
              if (selectedFood && quantity) {
                const ratio = quantity / selectedFood.servingSize;
                const calories = Math.round(selectedFood.calories * ratio);
                const protein = parseFloat((selectedFood.protein * ratio).toFixed(1));
                const carbs = parseFloat((selectedFood.carbs * ratio).toFixed(1));
                const fat = parseFloat((selectedFood.fat * ratio).toFixed(1));
                
                return (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                    <h4 className="font-medium mb-2">Informações Nutricionais (Calculadas)</h4>
                    <NutritionInfo 
                      calories={calories}
                      protein={protein}
                      carbs={carbs}
                      fat={fat}
                    />
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
          
          <Button type="submit" disabled={addFoodToMeal.isPending}>
            {addFoodToMeal.isPending ? "Adicionando..." : "Adicionar à Refeição"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

// Componente principal para a página de refeições
export default function MealPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showAddFoodDialog, setShowAddFoodDialog] = useState<boolean>(false);
  const [showCreateMealDialog, setShowCreateMealDialog] = useState<boolean>(false);
  const [showAddToMealDialog, setShowAddToMealDialog] = useState<boolean>(false);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  
  // Estados para nova funcionalidade de busca de alimentos
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [trialActive, setTrialActive] = useState(true);
  const [userGoal, setUserGoal] = useState<'emagrecer' | 'manter' | 'ganhar'>('manter');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  
  // Verificar período de teste e carregar configurações do usuário
  useEffect(() => {
    if (user?.id) {
      const isActive = isWithinFreeTrial(user.id);
      setTrialActive(isActive);
      
      if (!isActive) {
        toast({
          title: "Período gratuito encerrado",
          description: "Algumas funcionalidades estão limitadas. Torne-se Premium para acesso completo.",
          variant: "destructive"
        });
      }
      
      // Carregar configurações do usuário
      const settings = getUserSettings(user.id);
      if (settings?.goal) {
        setUserGoal(settings.goal);
        setCalorieGoal(calculateCalorieGoal(settings.goal));
      }
    }
  }, [user?.id, toast]);
  
  // Função para pesquisar alimentos
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = searchFoods(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Adicionar alimento à lista de selecionados
  const addFoodToSelected = (food: any) => {
    if (!trialActive && selectedFoods.length >= 2) {
      toast({
        title: "Funcionalidade limitada",
        description: "Torne-se Premium para adicionar mais alimentos ao cardápio",
        variant: "destructive"
      });
      return;
    }
    
    const newFood = {...food, quantity: 1};
    setSelectedFoods([...selectedFoods, newFood]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    
    toast({
      title: "Alimento adicionado",
      description: `${food.name} foi adicionado ao seu cardápio`
    });
  };
  
  // Remover alimento da lista
  const removeFoodFromSelected = (index: number) => {
    const newFoods = [...selectedFoods];
    newFoods.splice(index, 1);
    setSelectedFoods(newFoods);
  };
  
  // Atualizar quantidade de alimento
  const updateFoodQuantity = (index: number, quantity: number) => {
    if (!trialActive && quantity > 1) {
      toast({
        title: "Funcionalidade limitada",
        description: "Torne-se Premium para aumentar as quantidades",
        variant: "destructive"
      });
      return;
    }
    
    const newFoods = [...selectedFoods];
    newFoods[index].quantity = quantity;
    setSelectedFoods(newFoods);
  };
  
  // Calcular total de calorias dos alimentos selecionados
  const calculateTotalCalories = () => {
    return selectedFoods.reduce((total, food) => {
      return total + (food.calories * food.quantity);
    }, 0);
  };
  
  // Calcular % da meta diária
  const calculatePercentage = () => {
    const total = calculateTotalCalories();
    return Math.min(Math.round((total / calorieGoal) * 100), 100);
  };
  
  // Salvar dados no banco
  const saveMealData = async () => {
    if (!user?.id || selectedFoods.length === 0) return;
    
    try {
      // Criar nova refeição
      const mealData = {
        name: "Refeição personalizada",
        date: selectedDate,
        totalCalories: calculateTotalCalories(),
        totalProtein: selectedFoods.reduce((total, food) => total + ((food.protein || 0) * food.quantity), 0),
        totalCarbs: selectedFoods.reduce((total, food) => total + ((food.carbs || 0) * food.quantity), 0),
        totalFat: selectedFoods.reduce((total, food) => total + ((food.fat || 0) * food.quantity), 0),
      };
      
      // Salvar refeição no banco
      const mealRes = await apiRequest("POST", "/api/meals", mealData);
      const savedMeal = await mealRes.json();
      
      // Adicionar itens à refeição
      for (const food of selectedFoods) {
        const mealItemData = {
          mealId: savedMeal.id,
          foodItemId: food.id,
          quantity: food.quantity,
          calories: food.calories * food.quantity,
          protein: (food.protein || 0) * food.quantity,
          carbs: (food.carbs || 0) * food.quantity,
          fat: (food.fat || 0) * food.quantity,
        };
        
        await apiRequest("POST", "/api/meals/" + savedMeal.id + "/items", mealItemData);
      }
      
      // Invalidar cache de refeições
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      
      toast({
        title: "Refeição salva!",
        description: "Sua refeição personalizada foi salva com sucesso"
      });
      
      // Limpar alimentos selecionados
      setSelectedFoods([]);
      
    } catch (error) {
      toast({
        title: "Erro ao salvar refeição",
        description: "Ocorreu um erro ao salvar sua refeição",
        variant: "destructive"
      });
    }
  };
  
  // Buscar refeições do banco de dados
  const { data: meals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/meals?date=${selectedDate}`);
      if (!res.ok) throw new Error("Falha ao buscar refeições");
      return res.json();
    },
  });

  const { data: mealItems = [] } = useQuery<MealItem[]>({
    queryKey: [`/api/meals/${selectedMealId}/items`],
    queryFn: async () => {
      if (!selectedMealId) return [];
      const res = await fetch(`/api/meals/${selectedMealId}/items`);
      if (!res.ok) throw new Error("Falha ao buscar itens da refeição");
      return res.json();
    },
    enabled: !!selectedMealId,
  });

  const { data: foodItemsMap = {} } = useQuery<Record<number, FoodItem>>({
    queryKey: ["/api/food-items", "all"],
    queryFn: async () => {
      const res = await fetch("/api/food-items");
      if (!res.ok) throw new Error("Falha ao buscar alimentos");
      const items: FoodItem[] = await res.json();
      return items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<number, FoodItem>);
    },
  });

  const deleteMealItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meal-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      if (selectedMealId) {
        queryClient.invalidateQueries({ queryKey: [`/api/meals/${selectedMealId}/items`] });
      }
    },
  });

  const handleAddToMeal = (mealId: number) => {
    setSelectedMealId(mealId);
    setShowAddToMealDialog(true);
  };

  const getMealIcon = (mealName: string) => {
    const name = mealName.toLowerCase();
    if (name.includes("café") || name.includes("manha")) return <Coffee className="h-6 w-6" />;
    if (name.includes("almoço")) return <UtensilsCrossed className="h-6 w-6" />;
    if (name.includes("jantar")) return <Pizza className="h-6 w-6" />;
    if (name.includes("lanche")) return <Apple className="h-6 w-6" />;
    return <Utensils className="h-6 w-6" />;
  };

  // Função para calcular o total de nutrientes para o dia
  const calculateDailyTotals = () => {
    return meals.reduce((acc, meal) => {
      acc.calories += meal.totalCalories;
      acc.protein += meal.totalProtein;
      acc.carbs += meal.totalCarbs;
      acc.fat += meal.totalFat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold mb-1">Cardápio</h2>
          <p className="text-slate-600 dark:text-slate-400">Gerencie sua alimentação</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Dialog open={showCreateMealDialog} onOpenChange={setShowCreateMealDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Nova Refeição
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Refeição</DialogTitle>
                <DialogDescription>
                  Adicione uma nova refeição ao seu plano alimentar.
                </DialogDescription>
              </DialogHeader>
              <CreateMealForm 
                onSuccess={(mealId) => {
                  setShowCreateMealDialog(false);
                  setSelectedMealId(mealId);
                  setShowAddToMealDialog(true);
                }} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddFoodDialog} onOpenChange={setShowAddFoodDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Novo Alimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Alimento</DialogTitle>
                <DialogDescription>
                  Cadastre um novo alimento com suas informações nutricionais.
                </DialogDescription>
              </DialogHeader>
              <AddFoodItemForm onSuccess={() => setShowAddFoodDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex gap-3 items-center mb-6">
        <Label htmlFor="date-select">Data:</Label>
        <Input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>
      
      {/* Visão geral do dia */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Nutricional do Dia</CardTitle>
          <CardDescription>
            Total de nutrientes consumidos na data selecionada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NutritionInfo
            calories={dailyTotals.calories}
            protein={parseFloat(dailyTotals.protein.toFixed(1))}
            carbs={parseFloat(dailyTotals.carbs.toFixed(1))}
            fat={parseFloat(dailyTotals.fat.toFixed(1))}
          />
        </CardContent>
      </Card>
      
      {/* Lista de refeições */}
      {meals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center py-16">
          <div className="h-16 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <Utensils className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma Refeição Cadastrada</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-4">
            Você ainda não tem refeições cadastradas para esta data. Crie sua primeira refeição para começar a registrar sua alimentação.
          </p>
          <Button onClick={() => setShowCreateMealDialog(true)}>
            Criar Refeição
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id} className={cn(
              "transition-all",
              selectedMealId === meal.id ? "ring-2 ring-primary" : ""
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getMealIcon(meal.name)}
                    </div>
                    <CardTitle>{meal.name}</CardTitle>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToMeal(meal.id)}
                    variant="ghost"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <NutritionInfo
                    calories={meal.totalCalories}
                    protein={meal.totalProtein}
                    carbs={meal.totalCarbs}
                    fat={meal.totalFat}
                  />
                </div>
                
                {/* Itens da refeição */}
                {selectedMealId === meal.id && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium mb-2">Alimentos na Refeição</h4>
                    {mealItems.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum alimento adicionado</p>
                    ) : (
                      <div className="space-y-2">
                        {mealItems.map((item) => {
                          const foodItem = foodItemsMap[item.foodItemId];
                          return foodItem ? (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                              <div>
                                <div className="font-medium">{foodItem.name}</div>
                                <div className="text-sm text-slate-500">
                                  {item.quantity}g • {item.calories} kcal • {item.protein}g prot • {item.carbs}g carb • {item.fat}g gord
                                </div>
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => deleteMealItem.mutate(item.id)}
                                disabled={deleteMealItem.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedMealId !== meal.id && (
                  <Button 
                    variant="ghost" 
                    className="mt-2 w-full justify-start text-slate-500"
                    onClick={() => setSelectedMealId(meal.id)}
                  >
                    Ver detalhes
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog para adicionar alimento a uma refeição */}
      <Dialog open={showAddToMealDialog} onOpenChange={setShowAddToMealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar Alimento à Refeição
            </DialogTitle>
            <DialogDescription>
              Selecione um alimento e informe a quantidade para adicionar à refeição.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="search">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Buscar Alimentos</TabsTrigger>
              <TabsTrigger value="create">Criar Novo</TabsTrigger>
            </TabsList>
            <TabsContent value="search" className="py-4">
              {selectedMealId && (
                <AddFoodToMealForm 
                  mealId={selectedMealId} 
                  onSuccess={() => setShowAddToMealDialog(false)} 
                />
              )}
            </TabsContent>
            <TabsContent value="create" className="py-4">
              <AddFoodItemForm onSuccess={() => {}} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
