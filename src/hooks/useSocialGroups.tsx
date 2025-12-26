import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SocialGroup {
  id: string;
  name: string;
  platform: "whatsapp" | "telegram";
  link: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useSocialGroups = () => {
  return useQuery({
    queryKey: ["social-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_groups")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SocialGroup[];
    },
  });
};

export const useActiveSocialGroups = () => {
  return useQuery({
    queryKey: ["active-social-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_groups")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SocialGroup[];
    },
  });
};

export const useCreateSocialGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Omit<SocialGroup, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("social_groups")
        .insert([group])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-groups"] });
      queryClient.invalidateQueries({ queryKey: ["active-social-groups"] });
      toast.success("Grupo criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar grupo: " + error.message);
    },
  });
};

export const useUpdateSocialGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialGroup> & { id: string }) => {
      const { data, error } = await supabase
        .from("social_groups")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-groups"] });
      queryClient.invalidateQueries({ queryKey: ["active-social-groups"] });
      toast.success("Grupo atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar grupo: " + error.message);
    },
  });
};

export const useDeleteSocialGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_groups")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-groups"] });
      queryClient.invalidateQueries({ queryKey: ["active-social-groups"] });
      toast.success("Grupo excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir grupo: " + error.message);
    },
  });
};
