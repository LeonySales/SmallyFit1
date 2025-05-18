// Tipos de dados para armazenamento local
export interface UserSettings {
  userId: number;
  weight?: number;
  height?: number;
  goal?: 'emagrecer' | 'manter' | 'ganhar';
  waterGoal?: number;
  darkMode?: boolean;
  createdAt: string; // Para cálculo do período gratuito
  isPremium: boolean;
}

export interface WaterIntakeData {
  userId: number;
  date: string;
  amount: number;
}

export interface MeasurementData {
  userId: number;
  date: string;
  weight: number;
  height: number;
  waist?: number;
  hip?: number;
  arms?: number;
  chest?: number;
  thighs?: number;
}

export interface FoodIntakeData {
  userId: number;
  date: string;
  meals: {
    id: string;
    name: string;
    type: 'cafe' | 'almoco' | 'jantar' | 'lanche';
    foods: {
      id: string;
      name: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      quantity: number;
    }[];
    totalCalories: number;
  }[];
  totalCaloriesDay: number;
}

// Funções para gerenciar armazenamento local
export const storageKeys = {
  userSettings: 'smallyfit_user_settings',
  waterIntake: 'smallyfit_water_intake',
  measurements: 'smallyfit_measurements',
  foodIntake: 'smallyfit_food_intake',
  workouts: 'smallyfit_workouts'
};

// Função genérica para salvar dados
const saveData = <T>(key: string, userId: number, data: T): void => {
  try {
    // Recupera dados existentes ou inicia objeto vazio
    const storageData = localStorage.getItem(key);
    const existingData = storageData ? JSON.parse(storageData) : {};
    
    // Salva com o ID do usuário como chave
    existingData[userId.toString()] = data;
    localStorage.setItem(key, JSON.stringify(existingData));
  } catch (error) {
    console.error(`Erro ao salvar dados (${key}):`, error);
  }
};

// Função genérica para recuperar dados
const getData = <T>(key: string, userId: number): T | null => {
  try {
    const storageData = localStorage.getItem(key);
    if (!storageData) return null;
    
    const parsedData = JSON.parse(storageData);
    return parsedData[userId.toString()] || null;
  } catch (error) {
    console.error(`Erro ao recuperar dados (${key}):`, error);
    return null;
  }
};

// Funções específicas para cada tipo de dado
export const saveUserSettings = (userId: number, settings: UserSettings): void => {
  saveData<UserSettings>(storageKeys.userSettings, userId, settings);
};

export const getUserSettings = (userId: number): UserSettings | null => {
  return getData<UserSettings>(storageKeys.userSettings, userId);
};

export const saveWaterIntake = (userId: number, data: WaterIntakeData): void => {
  saveData<WaterIntakeData>(storageKeys.waterIntake, userId, data);
};

export const getWaterIntake = (userId: number): WaterIntakeData | null => {
  return getData<WaterIntakeData>(storageKeys.waterIntake, userId);
};

export const saveMeasurements = (userId: number, data: MeasurementData): void => {
  saveData<MeasurementData>(storageKeys.measurements, userId, data);
};

export const getMeasurements = (userId: number): MeasurementData | null => {
  return getData<MeasurementData>(storageKeys.measurements, userId);
};

export const saveFoodIntake = (userId: number, data: FoodIntakeData): void => {
  saveData<FoodIntakeData>(storageKeys.foodIntake, userId, data);
};

export const getFoodIntake = (userId: number): FoodIntakeData | null => {
  return getData<FoodIntakeData>(storageKeys.foodIntake, userId);
};

// Funções para verificar se o usuário está no período gratuito
export const isWithinFreeTrial = (userId: number): boolean => {
  const settings = getUserSettings(userId);
  if (!settings) return true; // Se não há configurações, considerar dentro do período
  
  if (settings.isPremium) return true; // Usuário premium tem acesso ilimitado
  
  const createdAt = new Date(settings.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays <= 7; // Retorna true se estiver dentro dos 7 dias
};

// Função para calcular meta calórica com base no objetivo
export const calculateCalorieGoal = (goal?: 'emagrecer' | 'manter' | 'ganhar'): number => {
  switch (goal) {
    case 'emagrecer':
      return 1500;
    case 'ganhar':
      return 2500;
    case 'manter':
    default:
      return 2000;
  }
};

// Alimentos comuns pré-definidos para sugestões
export const commonFoods = [
  { id: '1', name: 'Arroz branco', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: '100g' },
  { id: '2', name: 'Arroz integral', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: '100g' },
  { id: '3', name: 'Feijão preto', calories: 132, protein: 8.7, carbs: 23.7, fat: 0.5, portion: '100g' },
  { id: '4', name: 'Peito de frango', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
  { id: '5', name: 'Ovo inteiro', calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: 'unidade' },
  { id: '6', name: 'Pão francês', calories: 150, protein: 4, carbs: 28, fat: 2, portion: 'unidade' },
  { id: '7', name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, portion: 'unidade média' },
  { id: '8', name: 'Maçã', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, portion: 'unidade média' },
  { id: '9', name: 'Batata doce', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, portion: '100g' },
  { id: '10', name: 'Batata inglesa', calories: 77, protein: 2, carbs: 17, fat: 0.1, portion: '100g' },
  { id: '11', name: 'Aveia', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, portion: '100g' },
  { id: '12', name: 'Leite integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, portion: '100ml' },
  { id: '13', name: 'Leite desnatado', calories: 35, protein: 3.4, carbs: 5, fat: 0.1, portion: '100ml' },
  { id: '14', name: 'Iogurte natural', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, portion: '100g' },
  { id: '15', name: 'Queijo branco', calories: 264, protein: 18.9, carbs: 1.3, fat: 20.3, portion: '100g' },
  { id: '16', name: 'Azeite de oliva', calories: 884, protein: 0, carbs: 0, fat: 100, portion: '100ml' },
  { id: '17', name: 'Pão integral', calories: 247, protein: 13, carbs: 41, fat: 3.4, portion: '100g' },
  { id: '18', name: 'Espinafre', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, portion: '100g' },
  { id: '19', name: 'Brócolis', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, portion: '100g' },
  { id: '20', name: 'Cenoura', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, portion: '100g' },
];

// Função para buscar alimentos com base em uma consulta
export const searchFoods = (query: string) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  return commonFoods.filter(food => 
    food.name.toLowerCase().includes(normalizedQuery)
  );
};