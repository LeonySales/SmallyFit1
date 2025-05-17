import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { calculateBMI, calculateWaterIntake } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Measurements routes
  app.get("/api/measurements/latest", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const measurement = await storage.getLatestMeasurement(req.user.id);
      res.json(measurement);
    } catch (error) {
      res.status(500).json({ message: "Error fetching measurement" });
    }
  });

  app.get("/api/measurements/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const measurements = await storage.getMeasurementHistory(req.user.id);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching measurements history" });
    }
  });

  app.post("/api/measurements", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { weight, height, waist, hip, arms } = req.body;
      const measurement = await storage.createMeasurement({
        userId: req.user.id,
        weight,
        height,
        waist,
        hip,
        arms,
      });
      
      // Calculate and store BMI
      const bmi = calculateBMI(weight, height);
      
      // Automatically create water goal based on weight
      const waterGoal = calculateWaterIntake(weight);
      
      res.status(201).json(measurement);
    } catch (error) {
      res.status(500).json({ message: "Error saving measurement" });
    }
  });

  // Water tracking routes
  app.get("/api/water/today", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const todayWater = await storage.getTodayWaterIntake(req.user.id);
      
      // Get latest measurement to calculate water goal
      const latestMeasurement = await storage.getLatestMeasurement(req.user.id);
      let goal = 2000; // Default goal: 2L
      
      if (latestMeasurement) {
        goal = calculateWaterIntake(latestMeasurement.weight);
      }
      
      res.json({ current: todayWater || 0, goal });
    } catch (error) {
      res.status(500).json({ message: "Error fetching water intake" });
    }
  });

  app.get("/api/water/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const waterHistory = await storage.getWaterIntakeHistory(req.user.id);
      res.json(waterHistory);
    } catch (error) {
      res.status(500).json({ message: "Error fetching water history" });
    }
  });

  app.post("/api/water", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      
      if (amount > 0) {
        // Add water
        await storage.addWaterIntake(req.user.id, amount);
      } else {
        // Remove water
        await storage.removeWaterIntake(req.user.id, Math.abs(amount));
      }
      
      const todayWater = await storage.getTodayWaterIntake(req.user.id);
      res.status(200).json({ amount: todayWater });
    } catch (error) {
      res.status(500).json({ message: "Error updating water intake" });
    }
  });

  // Workouts routes
  app.get("/api/workouts/today", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const todayWorkout = await storage.getTodayWorkout(req.user.id);
      res.json(todayWorkout);
    } catch (error) {
      res.status(500).json({ message: "Error fetching today's workout" });
    }
  });

  app.get("/api/workouts/schedule", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const workouts = await storage.getWorkoutSchedule(req.user.id);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout schedule" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, type, day, exercises } = req.body;
      
      const workout = await storage.createWorkout({
        userId: req.user.id,
        title,
        type,
        day,
      });
      
      if (exercises && exercises.length > 0) {
        for (const exercise of exercises) {
          await storage.createExercise({
            workoutId: workout.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            completed: false,
          });
        }
      }
      
      res.status(201).json(workout);
    } catch (error) {
      res.status(500).json({ message: "Error creating workout" });
    }
  });

  app.patch("/api/exercises/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const { completed } = req.body;
      
      // Verify the exercise belongs to a workout owned by the user
      const exerciseOwner = await storage.verifyExerciseOwner(parseInt(id), req.user.id);
      if (!exerciseOwner) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedExercise = await storage.updateExercise(parseInt(id), { completed });
      res.json(updatedExercise);
    } catch (error) {
      res.status(500).json({ message: "Error updating exercise" });
    }
  });

  app.patch("/api/workouts/:id/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      
      // Verify the workout belongs to the user
      const workout = await storage.getWorkoutById(parseInt(id));
      if (!workout || workout.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Mark all exercises as completed
      await storage.completeWorkout(parseInt(id));
      
      res.json({ message: "Workout completed" });
    } catch (error) {
      res.status(500).json({ message: "Error completing workout" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.markAllNotificationsAsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating notifications" });
    }
  });

  app.get("/api/notifications/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const settings = await storage.getUserSettings(req.user.id);
      
      // Format settings to match frontend expectations
      const notificationSettings = [
        {
          id: "water_reminders",
          name: "Lembretes de água",
          description: "Receba alertas para se hidratar",
          enabled: settings?.waterReminders || true,
        },
        {
          id: "workout_reminders",
          name: "Lembretes de treino",
          description: "Seja notificado sobre seus treinos",
          enabled: settings?.workoutReminders || true,
        },
        {
          id: "measurement_reminders",
          name: "Atualizações de medidas",
          description: "Lembretes para registrar suas medidas",
          enabled: settings?.measurementReminders || true,
        },
        {
          id: "motivation_tips",
          name: "Dicas e motivações",
          description: "Receba dicas motivacionais",
          enabled: settings?.motivationTips || false,
        },
      ];
      
      res.json(notificationSettings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notification settings" });
    }
  });

  app.patch("/api/notifications/settings/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      
      // Get user settings
      let settings = await storage.getUserSettings(req.user.id);
      
      if (!settings) {
        // Create default settings if none exist
        settings = await storage.createSettings({
          userId: req.user.id,
          darkMode: false,
          units: "metric",
          notificationSound: true,
          waterReminders: true,
          workoutReminders: true,
          measurementReminders: true,
          motivationTips: false,
        });
      }
      
      // Update the specific setting
      const updateData: any = {};
      switch (id) {
        case "water_reminders":
          updateData.waterReminders = enabled;
          break;
        case "workout_reminders":
          updateData.workoutReminders = enabled;
          break;
        case "measurement_reminders":
          updateData.measurementReminders = enabled;
          break;
        case "motivation_tips":
          updateData.motivationTips = enabled;
          break;
      }
      
      // Update the settings
      if (Object.keys(updateData).length > 0) {
        await storage.updateSettings(req.user.id, updateData);
      }
      
      res.json({ id, enabled });
    } catch (error) {
      res.status(500).json({ message: "Error updating notification settings" });
    }
  });

  // BMI and stats routes
  app.get("/api/bmi/current", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const latestMeasurement = await storage.getLatestMeasurement(req.user.id);
      
      if (!latestMeasurement) {
        return res.json({ bmi: null });
      }
      
      const bmi = calculateBMI(latestMeasurement.weight, latestMeasurement.height);
      res.json({ bmi });
    } catch (error) {
      res.status(500).json({ message: "Error calculating BMI" });
    }
  });

  app.get("/api/bmi/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const measurements = await storage.getMeasurementHistory(req.user.id);
      
      // Calculate BMI for each measurement and format for chart
      const bmiHistory = measurements.map(m => ({
        date: new Date(m.createdAt).toLocaleDateString('pt-BR', { month: 'short' }),
        bmi: calculateBMI(m.weight, m.height),
      }));
      
      res.json(bmiHistory);
    } catch (error) {
      res.status(500).json({ message: "Error fetching BMI history" });
    }
  });

  app.get("/api/weight/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const measurements = await storage.getMeasurementHistory(req.user.id);
      
      if (measurements.length === 0) {
        return res.json({
          startWeight: null,
          currentWeight: null,
          goalWeight: null,
          progress: 0,
        });
      }
      
      // Get first and latest measurements
      const startWeight = measurements[measurements.length - 1].weight;
      const currentWeight = measurements[0].weight;
      
      // For simplicity, set goal weight as 90% of start weight if starting weight > current weight
      // or 110% of start weight if starting weight < current weight
      const goalWeight = startWeight > currentWeight 
        ? startWeight * 0.9 
        : startWeight * 1.1;
      
      // Calculate progress
      const totalDifference = Math.abs(goalWeight - startWeight);
      const currentDifference = Math.abs(currentWeight - startWeight);
      const progress = Math.min(100, Math.round((currentDifference / totalDifference) * 100));
      
      res.json({
        startWeight,
        currentWeight,
        goalWeight,
        progress,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching weight history" });
    }
  });

  app.get("/api/user/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const latestMeasurement = await storage.getLatestMeasurement(req.user.id);
      const todayWater = await storage.getTodayWaterIntake(req.user.id);
      
      let bmi = null;
      let bmiStatus = "";
      let waterGoal = 2000; // Default
      
      if (latestMeasurement) {
        bmi = calculateBMI(latestMeasurement.weight, latestMeasurement.height);
        
        if (bmi < 18.5) bmiStatus = "Abaixo do peso";
        else if (bmi < 25) bmiStatus = "Peso saudável";
        else if (bmi < 30) bmiStatus = "Sobrepeso";
        else bmiStatus = "Obesidade";
        
        waterGoal = calculateWaterIntake(latestMeasurement.weight);
      }
      
      res.json({
        bmi,
        bmiStatus,
        waterCurrent: todayWater || 0,
        waterGoal,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  // Food items routes
  app.get("/api/food-items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const query = req.query.q as string;
      let foodItems;
      
      if (query) {
        foodItems = await storage.searchFoodItems(query);
      } else {
        foodItems = await storage.getFoodItems();
      }
      
      res.json(foodItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food items" });
    }
  });
  
  app.get("/api/food-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id, 10);
      const foodItem = await storage.getFoodItemById(id);
      
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.json(foodItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching food item" });
    }
  });
  
  app.post("/api/food-items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const foodItem = await storage.createFoodItem(req.body);
      res.status(201).json(foodItem);
    } catch (error) {
      res.status(500).json({ message: "Error creating food item" });
    }
  });
  
  // Meals routes
  app.get("/api/meals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const meals = await storage.getUserMealsByDate(req.user.id, date);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meals" });
    }
  });
  
  app.get("/api/meals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id, 10);
      const meal = await storage.getMealById(id);
      
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      if (meal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this meal" });
      }
      
      res.json(meal);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal" });
    }
  });
  
  app.post("/api/meals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const mealData = {
        ...req.body,
        userId: req.user.id,
      };
      
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      res.status(500).json({ message: "Error creating meal" });
    }
  });
  
  // Meal items routes
  app.get("/api/meals/:mealId/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const mealId = parseInt(req.params.mealId, 10);
      const meal = await storage.getMealById(mealId);
      
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      if (meal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this meal" });
      }
      
      const mealItems = await storage.getMealItems(mealId);
      res.json(mealItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal items" });
    }
  });
  
  app.post("/api/meals/:mealId/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const mealId = parseInt(req.params.mealId, 10);
      const meal = await storage.getMealById(mealId);
      
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      
      if (meal.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this meal" });
      }
      
      const mealItemData = {
        ...req.body,
        mealId,
      };
      
      const mealItem = await storage.createMealItem(mealItemData);
      res.status(201).json(mealItem);
    } catch (error) {
      res.status(500).json({ message: "Error creating meal item" });
    }
  });
  
  app.delete("/api/meal-items/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteMealItem(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting meal item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
