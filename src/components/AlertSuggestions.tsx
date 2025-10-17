import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Sparkles } from "lucide-react";
import { useProductAlerts } from "@/hooks/useProductAlerts";
import { useMemo } from "react";

export const AlertSuggestions = () => {
  const { createAlert } = useProductAlerts();

  // Buscar produtos únicos do banco de dados
  const { data: products } = useQuery({
    queryKey: ["product-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("title")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Extrair palavras-chave únicas dos títulos
      const keywords = new Set<string>();
      
      data.forEach((product) => {
        const words = product.title
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3); // Apenas palavras com mais de 3 letras
        
        words.forEach((word) => keywords.add(word));
      });
      
      return Array.from(keywords);
    },
  });

  // Selecionar 6 sugestões aleatórias
  const suggestions = useMemo(() => {
    if (!products || products.length === 0) {
      // Sugestões padrão caso não haja produtos
      return [
        "Smartphone",
        "Notebook",
        "Fone de ouvido",
        "Smart TV",
        "Air Fryer",
        "Geladeira",
        "Máquina de lavar",
        "Fogão",
        "Micro-ondas",
        "Ar condicionado",
      ];
    }
    
    // Embaralhar e pegar 6 itens
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [products]);

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
              <span className="font-medium capitalize">{suggestion}</span>
            </div>
            <Plus className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          </button>
        ))}
      </div>
    </Card>
  );
};
