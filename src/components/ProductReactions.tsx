import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Bomb, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ProductReactionsProps {
  productId: string;
}

export const ProductReactions = ({ productId }: ProductReactionsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar contadores de reações
  const { data: reactions } = useQuery({
    queryKey: ["product-reactions", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reactions")
        .select("reaction_type")
        .eq("product_id", productId);

      if (error) throw error;

      const likes = data.filter((r) => r.reaction_type === "like").length;
      const dislikes = data.filter((r) => r.reaction_type === "dislike").length;

      return { likes, dislikes };
    },
  });

  // Buscar reação do usuário atual
  const { data: userReaction } = useQuery({
    queryKey: ["user-reaction", productId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("product_reactions")
        .select("reaction_type")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.reaction_type || null;
    },
    enabled: !!user,
  });

  // Mutation para reação
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: "like" | "dislike") => {
      if (!user) {
        throw new Error("Você precisa estar logado para reagir");
      }

      // Se já tem uma reação, atualizar ou remover
      if (userReaction) {
        if (userReaction === reactionType) {
          // Remover reação
          const { error } = await supabase
            .from("product_reactions")
            .delete()
            .eq("product_id", productId)
            .eq("user_id", user.id);

          if (error) throw error;
        } else {
          // Atualizar reação
          const { error } = await supabase
            .from("product_reactions")
            .update({ reaction_type: reactionType })
            .eq("product_id", productId)
            .eq("user_id", user.id);

          if (error) throw error;
        }
      } else {
        // Criar nova reação
        const { error } = await supabase
          .from("product_reactions")
          .insert({
            product_id: productId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reactions", productId] });
      queryClient.invalidateQueries({ queryKey: ["user-reaction", productId, user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleReaction = (type: "like" | "dislike") => {
    if (!user) {
      toast.error("Faça login para reagir a este produto");
      return;
    }
    reactionMutation.mutate(type);
  };

  const likes = reactions?.likes || 0;
  const dislikes = reactions?.dislikes || 0;

  // Ícones de dinamite baseados nas contagens
  const getDynamiteIcon = () => {
    // Prioridade para likes
    if (likes > 100) {
      // Dinamite explodendo grande
      return (
        <div className="relative">
          <Bomb className="h-12 w-12 text-destructive animate-bounce" />
          <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-3 -right-3 animate-spin" />
          <Sparkles className="h-8 w-8 text-yellow-300 absolute -bottom-2 -left-2 animate-ping" />
        </div>
      );
    }
    
    if (likes >= 1) {
      // Dinamite explodindo pequeno
      return (
        <div className="relative">
          <Bomb className="h-8 w-8 text-destructive animate-pulse" />
          <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
        </div>
      );
    }

    // Se não tem likes suficientes, mostrar baseado em dislikes
    if (dislikes > 100) {
      // Dinamite com pavio apagado
      return (
        <div className="relative">
          <Bomb className="h-8 w-8 text-muted-foreground opacity-60" />
          <div className="h-3 w-3 bg-muted-foreground/30 rounded-full absolute -top-1 right-1" />
        </div>
      );
    }
    
    // Dinamite com pavio aceso (padrão)
    return (
      <div className="relative">
        <Bomb className="h-8 w-8 text-foreground" />
        <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 right-1 animate-ping" />
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4">
      {/* Ícone de Dinamite */}
      <div className="flex items-center justify-center">
        {getDynamiteIcon()}
      </div>

      {/* Botão Like */}
      <div className="flex flex-col items-center gap-1 relative">
        <Button
          variant={userReaction === "like" ? "destructive" : "outline"}
          size="sm"
          onClick={() => handleReaction("like")}
          disabled={reactionMutation.isPending}
          className={`gap-2 transition-all duration-300 ${
            userReaction === "like" 
              ? "shadow-xl shadow-destructive/60" 
              : ""
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${userReaction === "like" ? "animate-bounce" : ""}`} />
          <span className="font-bold">{likes}</span>
          {userReaction === "like" && (
            <>
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-2 -right-2 animate-ping" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -bottom-2 -left-2 animate-spin" />
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">Bombando</span>
      </div>

      {/* Botão Dislike */}
      <div className="flex flex-col items-center gap-1">
        <Button
          variant={userReaction === "dislike" ? "secondary" : "outline"}
          size="sm"
          onClick={() => handleReaction("dislike")}
          disabled={reactionMutation.isPending}
          className="gap-2"
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="font-bold">{dislikes}</span>
        </Button>
        <span className="text-xs text-muted-foreground">Gelando</span>
      </div>
    </div>
  );
};
