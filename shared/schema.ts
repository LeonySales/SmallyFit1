import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Measurements table
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  weight: real("weight").notNull(), // in kg
  height: real("height").notNull(), // in cm
  waist: real("waist").notNull(), // in cm
  hip: real("hip").notNull(), // in cm
  arms: real("arms").notNull(), // in cm
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Water intake table
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in ml
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workouts table
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  day: text("day").notNull(), // Day of the week: "Monday", "Tuesday", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  icon: text("icon").notNull(), // "water", "workout", "measurement", etc.
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table for user preferences
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  darkMode: boolean("dark_mode").default(false).notNull(),
  units: text("units").default("metric").notNull(), // "metric" or "imperial"
  notificationSound: boolean("notification_sound").default(true).notNull(),
  waterReminders: boolean("water_reminders").default(true).notNull(),
  workoutReminders: boolean("workout_reminders").default(true).notNull(),
  measurementReminders: boolean("measurement_reminders").default(true).notNull(),
  motivationTips: boolean("motivation_tips").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create schemas for validation and type inference
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  isAdmin: true,
});

export const insertMeasurementSchema = createInsertSchema(measurements).pick({
  userId: true,
  weight: true,
  height: true,
  waist: true,
  hip: true,
  arms: true,
});

export const insertWaterIntakeSchema = createInsertSchema(waterIntake).pick({
  userId: true,
  amount: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  userId: true,
  title: true,
  type: true,
  day: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  workoutId: true,
  name: true,
  sets: true,
  reps: true,
  completed: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  icon: true,
  read: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  darkMode: true,
  units: true,
  notificationSound: true,
  waterReminders: true,
  workoutReminders: true,
  measurementReminders: true,
  motivationTips: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
