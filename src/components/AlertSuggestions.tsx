import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Sparkles } from "lucide-react";
import { useProductAlerts } from "@/hooks/useProductAlerts";
import { useMemo } from "react";

export const AlertSuggestions = () => {
  const { createAlert } = useProductAlerts();

  // Buscar sugestões do banco de dados + produtos recentes
  const { data: dbSuggestions } = useQuery({
    queryKey: ["alert-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_suggestions")
        .select("term")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["product-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("title")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Combinar sugestões do banco + produtos recentes
  const suggestions = useMemo(() => {
    const defaultSuggestions = [
      "Smartphone Samsung",
      "iPhone",
      "Notebook",
      "SSD",
      "Fone Bluetooth",
      "Smart TV",
    ];

    // Sugestões do banco de dados
    const dbTerms = dbSuggestions?.map(s => s.term) || [];
    
    // Títulos de produtos recentes
    const productTitles = products?.map(p => p.title) || [];
    
    // Combinar tudo
    const allSuggestions = [...dbTerms, ...productTitles, ...defaultSuggestions];
    
    // Remover duplicatas e embaralhar
    const uniqueSuggestions = Array.from(new Set(allSuggestions));
    const shuffled = uniqueSuggestions.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, 6);
  }, [dbSuggestions, products]);

  const handleAddSuggestion = (term: string) => {
    createAlert.mutate({
      alert_type: "product_name",
      search_term: term,
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">Sugestões para você</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleAddSuggestion(suggestion)}
            className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{suggestion}</span>
            </div>
            <Plus className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          </button>
        ))}
      </div>
    </Card>
  );
};
