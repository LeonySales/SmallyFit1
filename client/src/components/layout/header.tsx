import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";

interface HeaderProps {
  setActiveSection: (section: string) => void;
}

export function Header({ setActiveSection }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-heading font-bold text-primary dark:text-primary">
            SmallyFit
          </h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 bg-orange-500 rounded-full h-2 w-2"></span>
            </Button>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        setActiveSection={setActiveSection} 
      />
    </>
  );
}
