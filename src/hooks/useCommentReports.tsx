import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCommentReports = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["comment-reports"],
    queryFn: async () => {
      const { data: reportsData, error } = await supabase
        .from("comment_reports")
        .select(`
          *,
          comments!inner(
            id,
            content,
            product_id,
            user_id,
            products!inner(id, title)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar informações dos perfis separadamente
      if (!reportsData || reportsData.length === 0) return [];

      const reporterIds = [...new Set(reportsData.map(r => r.reported_by))];
      const reportedUserIds = [...new Set(reportsData.map(r => r.comments.user_id))];
      const allUserIds = [...new Set([...reporterIds, ...reportedUserIds])];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .in("user_id", allUserIds);

      if (profilesError) throw profilesError;

      // Mapear perfis para as denúncias
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return reportsData.map(report => ({
        ...report,
        reporter: profilesMap.get(report.reported_by),
        reported_user: profilesMap.get(report.comments.user_id),
      }));
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
