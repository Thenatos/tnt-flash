import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCommentUsers = (productId: string) => {
  return useQuery({
    queryKey: ["comment-users", productId],
    queryFn: async () => {
      // Buscar todos os comentários do produto
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("user_id")
        .eq("product_id", productId);

      if (commentsError) throw commentsError;

      // Obter user_ids únicos
      const uniqueUserIds = [...new Set(comments?.map((c) => c.user_id) || [])];

      if (uniqueUserIds.length === 0) return [];

      // Buscar perfis dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", uniqueUserIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
  });
};
