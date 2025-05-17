import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { Droplets, Dumbbell, Scale } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  icon: "water" | "workout" | "measurement";
  read: boolean;
}

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => {
      // Would normally fetch from API
      return [
        {
          id: 1,
          title: "Lembrete de hidratação",
          message: "Hora de beber água! Você está abaixo da meta diária.",
          timestamp: new Date().toISOString(),
          icon: "water",
          read: false
        },
        {
          id: 2,
          title: "Treino agendado",
          message: "Seu treino de pernas está agendado para hoje às 15:30.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: "workout",
          read: true
        },
        {
          id: 3,
          title: "Atualização de medidas",
          message: "Parabéns! Você perdeu 2.5kg desde o início.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          icon: "measurement",
          read: true
        }
      ] as Notification[];
    }
  });
  
  // Fetch notification settings
  const { data: notificationSettings } = useQuery({
    queryKey: ["/api/notifications/settings"],
    queryFn: () => {
      // Would normally fetch from API
      return [
        {
          id: "water_reminders",
          name: "Lembretes de água",
          description: "Receba alertas para se hidratar",
          enabled: true
        },
        {
          id: "workout_reminders",
          name: "Lembretes de treino",
          description: "Seja notificado sobre seus treinos",
          enabled: true
        },
        {
          id: "measurement_reminders",
          name: "Atualizações de medidas",
          description: "Lembretes para registrar suas medidas",
          enabled: true
        },
        {
          id: "motivation_tips",
          name: "Dicas e motivações",
          description: "Receba dicas motivacionais",
          enabled: false
        }
      ] as NotificationSetting[];
    }
  });
  
  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/notifications/mark-all-read", {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notificações atualizadas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle notification setting
  const toggleSettingMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string, enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/notifications/settings/${id}`, { enabled });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Format time relative to now
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} minutos atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    return "Ontem";
  };
  
  // Get icon component based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "water":
        return <Droplets className="h-4 w-4" />;
      case "workout":
        return <Dumbbell className="h-4 w-4" />;
      case "measurement":
        return <Scale className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Notificações</h2>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe seus alertas</p>
      </div>
      
      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-medium">Recentes</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto py-0"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            Marcar tudo como lido
          </Button>
        </div>
        
        {notifications && notifications.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={notification.read ? "" : "bg-slate-50 dark:bg-slate-800/50"}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className={`h-8 w-8 rounded-full ${
                      notification.read 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" 
                        : "bg-primary-100 dark:bg-primary-900 text-primary dark:text-primary-400"
                    } flex items-center justify-center mr-3`}>
                      {getIcon(notification.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1 font-medium">{notification.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            Você não tem notificações
          </p>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-lg mb-4">Configurações de notificações</h3>
        
        {notificationSettings && (
          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-0.5">{setting.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{setting.description}</p>
                </div>
                <Switch 
                  checked={setting.enabled}
                  onCheckedChange={(checked) => {
                    toggleSettingMutation.mutate({ 
                      id: setting.id, 
                      enabled: checked 
                    });
                  }}
                  disabled={toggleSettingMutation.isPending}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
