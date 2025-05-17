import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import DashboardPage from "@/pages/dashboard-page";
import MeasurementsPage from "@/pages/measurements-page";
import BmiPage from "@/pages/bmi-page";
import WaterPage from "@/pages/water-page";
import WorkoutsPage from "@/pages/workouts-page";
import MealPage from "@/pages/meal-page";
import AchievementsPage from "@/pages/achievements-page";
import NotificationsPage from "@/pages/notifications-page";
import SettingsPage from "@/pages/settings-page";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 dark:bg-slate-950">
      <Header setActiveSection={setActiveSection} />
      
      <main className="flex-1 px-4 py-6 overflow-y-auto pb-20">
        {activeSection === "dashboard" && <DashboardPage />}
        {activeSection === "medidas" && <MeasurementsPage />}
        {activeSection === "imc" && <BmiPage />}
        {activeSection === "agua" && <WaterPage />}
        {activeSection === "treinos" && <WorkoutsPage />}
        {activeSection === "cardapio" && <MealPage />}
        {activeSection === "conquistas" && <AchievementsPage />}
        {activeSection === "notificacoes" && <NotificationsPage />}
        {activeSection === "configuracoes" && <SettingsPage />}
      </main>
      
      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
}
