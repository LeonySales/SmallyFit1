import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToLocalCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function calculateBMI(weight: number, height: number): number {
  // Height should be in meters, but we store it in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Abaixo do peso";
  if (bmi < 25) return "Peso saudável";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidade";
}

export function calculateWaterIntake(weight: number): number {
  // A common formula: 35ml per kg of body weight
  return Math.round(weight * 35);
}
