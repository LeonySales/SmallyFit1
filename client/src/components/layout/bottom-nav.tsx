import { 
  LayoutDashboard, 
  Ruler, 
  Dumbbell, 
  Droplets, 
  Utensils,
  Settings 
} from "lucide-react";

interface BottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function BottomNav({ activeSection, setActiveSection }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'medidas', label: 'Medidas', icon: <Ruler className="h-5 w-5" /> },
    { id: 'treinos', label: 'Treinos', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'agua', label: 'Água', icon: <Droplets className="h-5 w-5" /> },
    { id: 'cardapio', label: 'Cardápio', icon: <Utensils className="h-5 w-5" /> },
    { id: 'configuracoes', label: 'Mais', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 fixed bottom-0 inset-x-0 max-w-md mx-auto z-20 pb-safe-area">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex flex-col items-center py-2 px-3 ${
              activeSection === item.id 
                ? "text-primary dark:text-primary" 
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
