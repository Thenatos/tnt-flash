import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCommentReports = () => {
  const queryClient = useQueryClient();

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

  return { reportComment };
};
