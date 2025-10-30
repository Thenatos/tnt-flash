import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCommentReports = (status: 'pending' | 'resolved' | 'dismissed' | 'all' = 'pending') => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["comment-reports", status],
    queryFn: async () => {
      let query = supabase
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

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: reportsData, error } = await query;

      if (error) throw error;

      // Buscar informações dos perfis separadamente
      if (!reportsData || reportsData.length === 0) return [];

      const reporterIds = [...new Set(reportsData.map(r => r.reported_by))];
      const reportedUserIds = [...new Set(reportsData.map(r => r.comments.user_id))];
      const verifierIds = [...new Set(reportsData.filter(r => r.verified_by).map(r => r.verified_by))];
      const allUserIds = [...new Set([...reporterIds, ...reportedUserIds, ...verifierIds])];

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
        verifier: report.verified_by ? profilesMap.get(report.verified_by) : null,
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

  const updateReportStatus = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: 'resolved' | 'dismissed' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("comment_reports")
        .update({ 
          status,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      const message = status === 'resolved' ? 'Denúncia marcada como resolvida!' : 'Denúncia arquivada!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["comment-reports"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar denúncia");
    },
  });

  return { reports, isLoading, reportComment, updateReportStatus };
};
