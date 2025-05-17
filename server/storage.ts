import { 
  User, InsertUser, 
  Measurement, InsertMeasurement,
  WaterIntake, InsertWaterIntake,
  Workout, InsertWorkout,
  Exercise, InsertExercise,
  Notification, InsertNotification,
  Settings, InsertSettings,
  FoodItem, InsertFoodItem,
  Meal, InsertMeal,
  MealItem, InsertMealItem,
  users, measurements, waterIntake, workouts, exercises, notifications,
  settings, foodItems, meals, mealItems
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc, and, sql, like, gte, lte } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Measurements methods
  getLatestMeasurement(userId: number): Promise<Measurement | undefined>;
  getMeasurementHistory(userId: number): Promise<Measurement[]>;
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  
  // Water intake methods
  getTodayWaterIntake(userId: number): Promise<number>;
  getWaterIntakeHistory(userId: number): Promise<{ day: string, amount: number }[]>;
  addWaterIntake(userId: number, amount: number): Promise<WaterIntake>;
  removeWaterIntake(userId: number, amount: number): Promise<void>;
  
  // Workout methods
  getTodayWorkout(userId: number): Promise<any>;
  getWorkoutSchedule(userId: number): Promise<any[]>;
  getWorkoutById(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  completeWorkout(workoutId: number): Promise<void>;
  
  // Exercise methods
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, data: Partial<Exercise>): Promise<Exercise>;
  verifyExerciseOwner(exerciseId: number, userId: number): Promise<boolean>;
  
  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Settings methods
  getUserSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, data: Partial<Settings>): Promise<Settings>;
  
  // Food items methods
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItemById(id: number): Promise<FoodItem | undefined>;
  searchFoodItems(query: string): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  
  // Meal methods
  getUserMeals(userId: number): Promise<Meal[]>;
  getUserMealsByDate(userId: number, date: Date): Promise<Meal[]>;
  getMealById(id: number): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMealNutrition(id: number, nutrition: { 
    totalCalories: number, 
    totalProtein: number, 
    totalCarbs: number, 
    totalFat: number 
  }): Promise<Meal>;
  
  // Meal items methods
  getMealItems(mealId: number): Promise<MealItem[]>;
  createMealItem(mealItem: InsertMealItem): Promise<MealItem>;
  deleteMealItem(id: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Create admin user if it doesn't exist
    this.getUserByEmail("admin@example.com").then(user => {
      if (!user) {
        this.createUser({
          name: "Admin",
          email: "admin@example.com",
          password: "$2b$10$eCUm8giJAEzA9EMeGqpHsOX6iJQECRbQJA9BPOS9obdPW8m/exE8e", // password is "password"
          isAdmin: true
        }).then(user => {
          console.log(`Admin user created with ID: ${user.id}`);
        });
      }
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    
    // Create default settings for the user
    await this.createSettings({
      userId: user.id,
      darkMode: false,
      units: "metric",
      notificationSound: true,
      waterReminders: true,
      workoutReminders: true,
      measurementReminders: true,
      motivationTips: false
    });
    
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    return this.updateUser(id, { password });
  }
  
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
  
  async getLatestMeasurement(userId: number): Promise<Measurement | undefined> {
    const [measurement] = await db.select()
      .from(measurements)
      .where(eq(measurements.userId, userId))
      .orderBy(desc(measurements.createdAt))
      .limit(1);
    
    return measurement;
  }
  
  async getMeasurementHistory(userId: number): Promise<Measurement[]> {
    return db.select()
      .from(measurements)
      .where(eq(measurements.userId, userId))
      .orderBy(desc(measurements.createdAt));
  }
  
  async createMeasurement(measurement: InsertMeasurement): Promise<Measurement> {
    const [newMeasurement] = await db.insert(measurements)
      .values(measurement)
      .returning();
    
    return newMeasurement;
  }
  
  async getTodayWaterIntake(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({
      total: sql`SUM(${waterIntake.amount})`
    })
      .from(waterIntake)
      .where(
        and(
          eq(waterIntake.userId, userId),
          gte(waterIntake.createdAt, today)
        )
      );
    
    return result[0]?.total || 0;
  }
  
  async getWaterIntakeHistory(userId: number): Promise<{ day: string, amount: number }[]> {
    const result = await db.select({
      day: sql`DATE(${waterIntake.createdAt})`,
      amount: sql`SUM(${waterIntake.amount})`
    })
      .from(waterIntake)
      .where(eq(waterIntake.userId, userId))
      .groupBy(sql`DATE(${waterIntake.createdAt})`)
      .orderBy(desc(sql`DATE(${waterIntake.createdAt})`));
    
    return result.map(item => ({
      day: item.day.toISOString().split('T')[0],
      amount: Number(item.amount)
    }));
  }
  
  async addWaterIntake(userId: number, amount: number): Promise<WaterIntake> {
    const [newIntake] = await db.insert(waterIntake)
      .values({ userId, amount })
      .returning();
    
    return newIntake;
  }
  
  async removeWaterIntake(userId: number, amount: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find the most recent water intake
    const [latestIntake] = await db.select()
      .from(waterIntake)
      .where(
        and(
          eq(waterIntake.userId, userId),
          gte(waterIntake.createdAt, today)
        )
      )
      .orderBy(desc(waterIntake.createdAt))
      .limit(1);
    
    if (latestIntake) {
      if (latestIntake.amount <= amount) {
        await db.delete(waterIntake)
          .where(eq(waterIntake.id, latestIntake.id));
      } else {
        await db.update(waterIntake)
          .set({ amount: latestIntake.amount - amount })
          .where(eq(waterIntake.id, latestIntake.id));
      }
    }
  }
  
  async getTodayWorkout(userId: number): Promise<any> {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[today.getDay()];
    
    const [workout] = await db.select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          eq(workouts.day, todayName)
        )
      );
    
    if (workout) {
      const workoutExercises = await db.select()
        .from(exercises)
        .where(eq(exercises.workoutId, workout.id));
      
      return {
        ...workout,
        exercises: workoutExercises
      };
    }
    
    return null;
  }
  
  async getWorkoutSchedule(userId: number): Promise<any[]> {
    const userWorkouts = await db.select()
      .from(workouts)
      .where(eq(workouts.userId, userId));
    
    const workoutIds = userWorkouts.map(w => w.id);
    
    // Only fetch exercises if there are workouts
    const workoutExercises = workoutIds.length > 0 
      ? await db.select()
          .from(exercises)
          .where(sql`${exercises.workoutId} IN (${workoutIds.join(',')})`)
      : [];
    
    // Group exercises by workout ID
    const exercisesByWorkout = workoutExercises.reduce<Record<number, Exercise[]>>((acc, exercise) => {
      if (!acc[exercise.workoutId]) {
        acc[exercise.workoutId] = [];
      }
      acc[exercise.workoutId].push(exercise);
      return acc;
    }, {});
    
    // Add exercises to workouts
    const workoutsWithExercises = userWorkouts.map(workout => ({
      ...workout,
      exercises: exercisesByWorkout[workout.id] || []
    }));
    
    // Sort by days of the week
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return workoutsWithExercises
      .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  }
  
  async getWorkoutById(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select()
      .from(workouts)
      .where(eq(workouts.id, id));
    
    return workout;
  }
  
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts)
      .values(workout)
      .returning();
    
    return newWorkout;
  }
  
  async completeWorkout(workoutId: number): Promise<void> {
    await db.update(exercises)
      .set({ completed: true })
      .where(eq(exercises.workoutId, workoutId));
  }
  
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises)
      .values(exercise)
      .returning();
    
    return newExercise;
  }
  
  async updateExercise(id: number, data: Partial<Exercise>): Promise<Exercise> {
    const [exercise] = await db.update(exercises)
      .set(data)
      .where(eq(exercises.id, id))
      .returning();
    
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    
    return exercise;
  }
  
  async verifyExerciseOwner(exerciseId: number, userId: number): Promise<boolean> {
    const result = await db.select()
      .from(exercises)
      .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
      .where(
        and(
          eq(exercises.id, exerciseId),
          eq(workouts.userId, userId)
        )
      );
    
    return result.length > 0;
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }
  
  async getUserSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select()
      .from(settings)
      .where(eq(settings.userId, userId));
    
    return setting;
  }
  
  async createSettings(setting: InsertSettings): Promise<Settings> {
    const [newSettings] = await db.insert(settings)
      .values(setting)
      .returning();
    
    return newSettings;
  }
  
  async updateSettings(userId: number, data: Partial<Settings>): Promise<Settings> {
    let userSettings = await this.getUserSettings(userId);
    
    if (!userSettings) {
      userSettings = await this.createSettings({
        userId,
        darkMode: false,
        units: "metric",
        notificationSound: true,
        waterReminders: true,
        workoutReminders: true,
        measurementReminders: true,
        motivationTips: false
      });
    }
    
    const [updatedSettings] = await db.update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, userSettings.id))
      .returning();
    
    return updatedSettings;
  }
  
  async getFoodItems(): Promise<FoodItem[]> {
    return db.select().from(foodItems);
  }
  
  async getFoodItemById(id: number): Promise<FoodItem | undefined> {
    const [foodItem] = await db.select()
      .from(foodItems)
      .where(eq(foodItems.id, id));
    
    return foodItem;
  }
  
  async searchFoodItems(query: string): Promise<FoodItem[]> {
    return db.select()
      .from(foodItems)
      .where(
        like(foodItems.name, `%${query}%`)
      );
  }
  
  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const [newFoodItem] = await db.insert(foodItems)
      .values(foodItem)
      .returning();
    
    return newFoodItem;
  }
  
  async getUserMeals(userId: number): Promise<Meal[]> {
    return db.select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.date));
  }
  
  async getUserMealsByDate(userId: number, date: Date): Promise<Meal[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return db.select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.date, startOfDay),
          lte(meals.date, endOfDay)
        )
      );
  }
  
  async getMealById(id: number): Promise<Meal | undefined> {
    const [meal] = await db.select()
      .from(meals)
      .where(eq(meals.id, id));
    
    return meal;
  }
  
  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals)
      .values(meal)
      .returning();
    
    return newMeal;
  }
  
  async updateMealNutrition(id: number, nutrition: { 
    totalCalories: number, 
    totalProtein: number, 
    totalCarbs: number, 
    totalFat: number 
  }): Promise<Meal> {
    const [updatedMeal] = await db.update(meals)
      .set(nutrition)
      .where(eq(meals.id, id))
      .returning();
    
    if (!updatedMeal) {
      throw new Error("Meal not found");
    }
    
    return updatedMeal;
  }
  
  async getMealItems(mealId: number): Promise<MealItem[]> {
    return db.select()
      .from(mealItems)
      .where(eq(mealItems.mealId, mealId));
  }
  
  async createMealItem(mealItem: InsertMealItem): Promise<MealItem> {
    const [newMealItem] = await db.insert(mealItems)
      .values(mealItem)
      .returning();
    
    // Update meal nutrition totals
    const meal = await this.getMealById(mealItem.mealId);
    
    if (meal) {
      const totalCalories = (meal.totalCalories || 0) + mealItem.calories;
      const totalProtein = (meal.totalProtein || 0) + mealItem.protein;
      const totalCarbs = (meal.totalCarbs || 0) + mealItem.carbs;
      const totalFat = (meal.totalFat || 0) + mealItem.fat;
      
      await this.updateMealNutrition(meal.id, {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat
      });
    }
    
    return newMealItem;
  }
  
  async deleteMealItem(id: number): Promise<void> {
    // First get the meal item to update nutrition totals
    const [mealItem] = await db.select()
      .from(mealItems)
      .where(eq(mealItems.id, id));
    
    if (mealItem) {
      // Update meal nutrition totals
      const meal = await this.getMealById(mealItem.mealId);
      
      if (meal) {
        const totalCalories = Math.max(0, (meal.totalCalories || 0) - mealItem.calories);
        const totalProtein = Math.max(0, (meal.totalProtein || 0) - mealItem.protein);
        const totalCarbs = Math.max(0, (meal.totalCarbs || 0) - mealItem.carbs);
        const totalFat = Math.max(0, (meal.totalFat || 0) - mealItem.fat);
        
        await this.updateMealNutrition(meal.id, {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat
        });
      }
      
      // Now delete the meal item
      await db.delete(mealItems).where(eq(mealItems.id, id));
    }
  }
}

export const storage = new DatabaseStorage();