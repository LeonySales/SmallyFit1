import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { 
  getUserSettings,
  saveUserSettings,
  isWithinFreeTrial
} from "@/lib/localStorage";

const profileSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "A senha atual deve ter no mínimo 6 caracteres" }),
  newPassword: z.string().min(6, { message: "A nova senha deve ter no mínimo 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "A confirmação deve ter no mínimo 6 caracteres" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userGoal, setUserGoal] = useState<'emagrecer' | 'manter' | 'ganhar'>('manter');
  const [isPremium, setIsPremium] = useState(false);
  const [daysLeft, setDaysLeft] = useState(7);
  const queryClient = useQueryClient();
  
  // Carregar configurações salvas do usuário
  useEffect(() => {
    if (user?.id) {
      const settings = getUserSettings(user.id);
      
      if (settings) {
        setIsPremium(settings.isPremium);
        
        if (settings.goal) {
          setUserGoal(settings.goal);
        }
        
        // Calcular dias restantes do período de teste
        if (settings.createdAt) {
          const createdDate = new Date(settings.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const remaining = Math.max(0, 7 - diffDays);
          setDaysLeft(remaining);
        }
      } else {
        // Se não existir configuração, criar uma
        const today = new Date().toISOString();
        saveUserSettings(user.id, {
          userId: user.id,
          createdAt: today,
          isPremium: false,
          goal: 'manter'
        });
        setDaysLeft(7);
      }
    }
  }, [user?.id]);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });
      passwordForm.reset();
      setPasswordDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user", {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold mb-1">Configurações</h2>
        <p className="text-slate-600 dark:text-slate-400">Gerencie suas preferências</p>
      </div>
      
      {/* Profile Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-medium text-lg mb-4">Perfil</h3>
        
        <div className="mb-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary-400 mb-2">
            <span className="text-2xl font-bold">
              {user?.name.split(' ').map(part => part[0]).join('').toUpperCase()}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-auto py-1">
            Alterar foto
          </Button>
        </div>
        
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto">
                  Alterar senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar senha</DialogTitle>
                  <DialogDescription>
                    Digite sua senha atual e a nova senha
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha atual</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar nova senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Alterando...
                          </>
                        ) : (
                          "Alterar senha"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      {/* App Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-medium text-lg mb-4">Preferências do aplicativo</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Tema escuro</p>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-0.5">Seu objetivo</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Define sua meta calórica diária</p>
            </div>
            <Select 
              value={userGoal} 
              onValueChange={(value) => {
                if (user?.id) {
                  const settings = getUserSettings(user.id) || {
                    userId: user.id,
                    createdAt: new Date().toISOString(),
                    isPremium: isPremium
                  };
                  
                  saveUserSettings(user.id, {
                    ...settings,
                    goal: value as 'emagrecer' | 'manter' | 'ganhar'
                  });
                  
                  setUserGoal(value as 'emagrecer' | 'manter' | 'ganhar');
                  
                  toast({
                    title: "Objetivo atualizado",
                    description: "Sua meta calórica foi ajustada!"
                  });
                }
              }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emagrecer">Emagrecer (1500 kcal)</SelectItem>
                <SelectItem value="manter">Manter peso (2000 kcal)</SelectItem>
                <SelectItem value="ganhar">Ganhar massa (2500 kcal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-0.5">Unidades de medida</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Escolha o sistema de medidas</p>
            </div>
            <Select defaultValue="metric">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Métrico (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="font-medium">Som de notificações</p>
            <Switch defaultChecked />
          </div>
          
          {/* Informações do plano */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-medium">Seu plano</p>
                <p className="text-xs text-slate-500">
                  {isPremium 
                    ? "Premium (Acesso completo)" 
                    : daysLeft > 0 
                      ? `Gratuito (${daysLeft} dias restantes)` 
                      : "Gratuito (Período encerrado)"}
                </p>
              </div>
              <span className={`text-xs py-1 px-2 rounded-full 
                ${isPremium 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"}`}>
                {isPremium ? "Premium" : "Gratuito"}
              </span>
            </div>
            
            {!isPremium && (
              <p className="text-xs text-slate-500 mt-1 mb-3">
                {daysLeft > 0 
                  ? `Após o período gratuito, algumas funções serão limitadas.` 
                  : `Algumas funções estão limitadas. Assine o Premium para acesso completo.`}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* SmallyFit Premium */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-medium text-lg mb-4">SmallyFit Premium</h3>
        
        <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-lg">Desbloqueie todas as funções</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Apenas R$49,90/mês</p>
            </div>
            <span className="text-xs py-1 px-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full font-medium">
              {isWithinFreeTrial(user?.id || 0) ? 'Grátis por mais ' + (7 - Math.floor((Date.now() - new Date(getUserSettings(user?.id || 0)?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))) + ' dias' : 'Período grátis encerrado'}
            </span>
          </div>
          
          <ul className="space-y-2 mt-3 mb-4">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Acesso completo a todas as funções</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Cardápio interativo e cálculo de calorias</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Histórico de medidas e evolução</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Treinos e desafios semanais</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Conquistas e motivação diária</span>
            </li>
          </ul>
          
          <a
            href="https://pay.kiwify.com.br/Yc34ebd"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button className="w-full" size="lg">
              Assinar Premium - R$49,90/mês
            </Button>
          </a>
        </div>
        
        <div className="mt-4">
          <Button
            variant="ghost"
            className="text-red-500 dark:text-red-400 p-0"
            onClick={() => {
              const confirmed = window.confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.");
              if (confirmed) {
                deleteAccountMutation.mutate();
              }
            }}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir minha conta"
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
        <p>SmallyFit v1.0.0</p>
      </div>
    </div>
  );
}
