import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { 
  X, 
  LayoutDashboard, 
  Ruler, 
  HeartPulse, 
  Droplets,
  Dumbbell,
  Utensils,
  Medal,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveSection: (section: string) => void;
}

export function Sidebar({ isOpen, onClose, setActiveSection }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    onClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/auth');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { id: 'medidas', label: 'Medidas', icon: <Ruler className="mr-3 h-5 w-5" /> },
    { id: 'imc', label: 'IMC e Progresso', icon: <HeartPulse className="mr-3 h-5 w-5" /> },
    { id: 'agua', label: 'Água', icon: <Droplets className="mr-3 h-5 w-5" /> },
    { id: 'treinos', label: 'Treinos', icon: <Dumbbell className="mr-3 h-5 w-5" /> },
    { id: 'cardapio', label: 'Cardápio', icon: <Utensils className="mr-3 h-5 w-5" /> },
    { id: 'conquistas', label: 'Conquistas', icon: <Medal className="mr-3 h-5 w-5" /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell className="mr-3 h-5 w-5" /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-heading font-bold text-primary dark:text-primary">SmallyFit</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                <span className="text-lg font-bold">
                  {user?.name.split(' ').map(part => part[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-2 py-2">
            <nav>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 group transition-colors"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
