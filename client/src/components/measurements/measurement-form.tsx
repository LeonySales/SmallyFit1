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
  waist: z.coerce.number().positive({ message: "A medida da cintura deve ser positiva" }),
  hip: z.coerce.number().positive({ message: "A medida do quadril deve ser positiva" }),
  arms: z.coerce.number().positive({ message: "A medida dos braços deve ser positiva" }),
});

type MeasurementFormValues = z.infer<typeof measurementSchema>;

export function MeasurementForm({ currentMeasurements, onSuccess }: { 
  currentMeasurements?: MeasurementFormValues, 
  onSuccess?: () => void 
}) {
  const queryClient = useQueryClient();
  
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: currentMeasurements || {
      weight: 0,
      height: 0,
      waist: 0,
      hip: 0,
      arms: 0,
    },
  });

  const saveMeasurementMutation = useMutation({
    mutationFn: async (data: MeasurementFormValues) => {
      const res = await apiRequest("POST", "/api/measurements", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Medidas salvas",
        description: "Suas medidas foram salvas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/measurements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/measurements/latest"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: MeasurementFormValues) {
    saveMeasurementMutation.mutate(data);
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
          disabled={saveMeasurementMutation.isPending}
        >
          {saveMeasurementMutation.isPending ? (
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
