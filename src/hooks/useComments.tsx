import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useComments = (productId: string) => {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar perfis dos usuários
      const userIds = [...new Set(data?.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      // Combinar comentários com perfis
      const commentsWithProfiles = data?.map((comment) => ({
        ...comment,
        profile: profiles?.find((p) => p.user_id === comment.user_id),
      }));

      return commentsWithProfiles;
    },
  });

  const createComment = useMutation({
    mutationFn: async ({ content, userId }: { content: string; userId: string }) => {
      const { error } = await supabase
        .from("comments")
        .insert({
          product_id: productId,
          user_id: userId,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      toast.success("Comentário adicionado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao adicionar comentário: " + error.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      toast.success("Comentário removido!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover comentário: " + error.message);
    },
  });

  return {
    comments,
    isLoading,
    createComment,
    deleteComment,
  };
};
