import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserPunishments = () => {
  const queryClient = useQueryClient();

  const { data: punishments, isLoading } = useQuery({
    queryKey: ["user-punishments"],
    queryFn: async () => {
      const { data: punishmentsData, error } = await supabase
        .from("user_punishments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar informações dos perfis separadamente
      if (!punishmentsData || punishmentsData.length === 0) return [];

      const userIds = [...new Set(punishmentsData.map(p => p.user_id))];
      const adminIds = [...new Set(punishmentsData.map(p => p.created_by))];
      const allUserIds = [...new Set([...userIds, ...adminIds])];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .in("user_id", allUserIds);

      if (profilesError) throw profilesError;

      // Mapear perfis para as punições
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return punishmentsData.map(punishment => ({
        ...punishment,
        profiles: profilesMap.get(punishment.user_id),
        admin: profilesMap.get(punishment.created_by),
      }));
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

      // Criar notificação para o usuário punido
      const punishmentLabels: Record<string, string> = {
        comment_ban: "Bloqueio de Comentários",
        site_ban: "Banimento do Site",
        temporary_ban: "Suspensão Temporária",
      };

      let durationText = "permanente";
      if (expiresAt) {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        durationText = `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
      }

      const notificationMessage = `Tipo: ${punishmentLabels[punishmentType] || punishmentType}
Duração: ${durationText}
${reason ? `Motivo: ${reason}` : ""}`;

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Você recebeu uma punição",
        message: notificationMessage,
        type: "punishment",
      });
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
