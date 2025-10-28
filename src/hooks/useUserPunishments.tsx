import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserPunishments = () => {
  const queryClient = useQueryClient();

  const { data: punishments, isLoading } = useQuery({
    queryKey: ["user-punishments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_punishments")
        .select(`
          *,
          profiles!user_punishments_user_id_fkey(full_name, username, avatar_url),
          admin:profiles!user_punishments_created_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createPunishment = useMutation({
    mutationFn: async ({
      userId,
      punishmentType,
      reason,
      expiresAt,
    }: {
      userId: string;
      punishmentType: string;
      reason?: string;
      expiresAt?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("user_punishments").insert({
        user_id: userId,
        punishment_type: punishmentType,
        reason,
        expires_at: expiresAt,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Punição aplicada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-punishments"] });
    },
    onError: () => {
      toast.error("Erro ao aplicar punição");
    },
  });

  const removePunishment = useMutation({
    mutationFn: async (punishmentId: string) => {
      const { error } = await supabase
        .from("user_punishments")
        .update({ is_active: false })
        .eq("id", punishmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Punição removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-punishments"] });
    },
    onError: () => {
      toast.error("Erro ao remover punição");
    },
  });

  return {
    punishments,
    isLoading,
    createPunishment,
    removePunishment,
  };
};
