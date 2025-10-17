import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCommentReactions = (commentId: string, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: reactions, isLoading } = useQuery({
    queryKey: ["comment-reactions", commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_reactions")
        .select("*")
        .eq("comment_id", commentId);

      if (error) throw error;

      const likes = data?.filter((r) => r.reaction_type === "like").length || 0;
      const dislikes = data?.filter((r) => r.reaction_type === "dislike").length || 0;
      const userReaction = userId 
        ? data?.find((r) => r.user_id === userId)?.reaction_type 
        : null;

      return { likes, dislikes, userReaction };
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async (reactionType: "like" | "dislike") => {
      if (!userId) throw new Error("Usuário não autenticado");

      // Verificar se já existe uma reação
      const { data: existingReaction } = await supabase
        .from("comment_reactions")
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingReaction) {
        // Se é a mesma reação, remove
        if (existingReaction.reaction_type === reactionType) {
          const { error } = await supabase
            .from("comment_reactions")
            .delete()
            .eq("id", existingReaction.id);

          if (error) throw error;
        } else {
          // Se é diferente, atualiza
          const { error } = await supabase
            .from("comment_reactions")
            .update({ reaction_type: reactionType })
            .eq("id", existingReaction.id);

          if (error) throw error;
        }
      } else {
        // Cria nova reação
        const { error } = await supabase
          .from("comment_reactions")
          .insert({
            comment_id: commentId,
            user_id: userId,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-reactions", commentId] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao reagir: " + error.message);
    },
  });

  return {
    reactions: reactions || { likes: 0, dislikes: 0, userReaction: null },
    isLoading,
    toggleReaction,
  };
};
