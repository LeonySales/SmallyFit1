import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const measurementSchema = z.object({
  weight: z.coerce.number().positive({ message: "O peso deve ser positivo" }),
  height: z.coerce.number().positive({ message: "A altura deve ser positiva" }),
  waist: z.coerce.number().positive({ message: "A medida da cintura deve ser positiva" }).optional(),
  hip: z.coerce.number().positive({ message: "A medida do quadril deve ser positiva" }).optional(),
  arms: z.coerce.number().positive({ message: "A medida dos braços deve ser positiva" }).optional(),
});

type MeasurementFormValues = z.infer<typeof measurementSchema>;

export function MeasurementForm({ currentMeasurements, onSuccess }: { 
  currentMeasurements?: Partial<MeasurementFormValues>, 
  onSuccess?: (data: MeasurementFormValues) => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      weight: currentMeasurements?.weight || 0,
      height: currentMeasurements?.height || 0,
      waist: currentMeasurements?.waist || 0,
      hip: currentMeasurements?.hip || 0,
      arms: currentMeasurements?.arms || 0,
    },
  });

  function onSubmit(data: MeasurementFormValues) {
    setIsSubmitting(true);
    
    try {
      // Usando o callback para passar os dados para o componente pai
      if (onSuccess) {
        onSuccess(data);
      }
      
      toast({
        title: "Medidas salvas",
        description: "Suas medidas foram salvas com sucesso!",
      });
      
      // Resetar o formulário com os novos valores como padrão
      form.reset({
        ...data
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas medidas.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="176"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cintura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="82"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quadril (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="98"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Braços (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="36"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar medidas"
          )}
        </Button>
      </form>
    </Form>
  );
}
