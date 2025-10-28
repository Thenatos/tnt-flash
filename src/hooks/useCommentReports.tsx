import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCommentReports = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["comment-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_reports")
        .select(`
          *,
          comments!inner(
            id,
            content,
            product_id,
            user_id,
            products!inner(id, title)
          ),
          reported_user:profiles!comment_reports_comment_id_fkey(
            full_name,
            username,
            avatar_url
          ),
          reporter:profiles!comment_reports_reported_by_fkey(
            full_name,
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const reportComment = useMutation({
    mutationFn: async ({ commentId, reportType }: { commentId: string; reportType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("comment_reports").insert({
        comment_id: commentId,
        reported_by: user.id,
        report_type: reportType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Denúncia enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["comment-reports"] });
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("Você já denunciou este comentário");
      } else {
        toast.error("Erro ao enviar denúncia");
      }
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from("comment_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Denúncia arquivada!");
      queryClient.invalidateQueries({ queryKey: ["comment-reports"] });
    },
    onError: () => {
      toast.error("Erro ao arquivar denúncia");
    },
  });

  return { reports, isLoading, reportComment, deleteReport };
};
