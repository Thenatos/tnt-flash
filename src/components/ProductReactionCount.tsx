import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface ProductReactionCountProps {
  productId: string;
}

export const ProductReactionCount = ({ productId }: ProductReactionCountProps) => {
  const { data: count } = useQuery({
    queryKey: ["product-reaction-count", productId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("product_reactions")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

      if (error) throw error;
      return count || 0;
    },
  });

  const totalReactions = count || 0;

  if (totalReactions === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Users className="h-3.5 w-3.5" />
      <span className="font-medium">
        {totalReactions} {totalReactions === 1 ? "pessoa reagiu" : "pessoas reagiram"}
      </span>
    </div>
  );
};
