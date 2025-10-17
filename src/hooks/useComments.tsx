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
        .is("parent_id", null) // Apenas comentários principais
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar respostas para cada comentário
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select("*")
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      // Buscar perfis de todos os usuários (comentários + respostas)
      const allComments = [...commentsWithReplies, ...commentsWithReplies.flatMap(c => c.replies)];
      const userIds = [...new Set(allComments.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, username")
        .in("user_id", userIds);

      // Combinar comentários e respostas com perfis
      const commentsWithProfiles = commentsWithReplies.map((comment) => ({
        ...comment,
        profile: profiles?.find((p) => p.user_id === comment.user_id),
        replies: comment.replies.map((reply: any) => ({
          ...reply,
          profile: profiles?.find((p) => p.user_id === reply.user_id),
        })),
      }));

      return commentsWithProfiles;
    },
  });

  const createComment = useMutation({
    mutationFn: async ({ 
      content, 
      userId, 
      parentId 
    }: { 
      content: string; 
      userId: string; 
      parentId?: string;
    }) => {
      const { error } = await supabase
        .from("comments")
        .insert({
          product_id: productId,
          user_id: userId,
          content,
          parent_id: parentId || null,
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
