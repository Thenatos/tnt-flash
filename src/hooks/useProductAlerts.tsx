import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductAlert {
  id: string;
  user_id: string;
  alert_type: "product_name" | "category" | "store";
  search_term: string;
  category_id: string | null;
  store_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductAlerts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["product-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_alerts")
        .select(`
          *,
          categories:category_id(name),
          stores:store_id(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductAlert[];
    },
  });

  const createAlert = useMutation({
    mutationFn: async (alertData: {
      alert_type: string;
      search_term: string;
      category_id?: string;
      store_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("product_alerts")
        .insert({
          user_id: user.id,
          ...alertData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-alerts"] });
      toast({
        title: "Alerta criado!",
        description: "Você será notificado quando encontrarmos produtos correspondentes.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar alerta",
        description: error.message,
      });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("product_alerts")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-alerts"] });
      toast({
        title: "Alerta atualizado!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar alerta",
        description: error.message,
      });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-alerts"] });
      toast({
        title: "Alerta removido!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover alerta",
        description: error.message,
      });
    },
  });

  return {
    alerts,
    isLoading,
    createAlert,
    toggleAlert,
    deleteAlert,
  };
};