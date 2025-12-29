import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProducts = (searchQuery?: string, categorySlug?: string) => {
  return useQuery({
    queryKey: ["products", searchQuery, categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories (
            name,
            slug
          ),
          stores (
            name,
            slug,
            logo_url
          ),
          comments (count)
        `)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();

        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name,
            slug
          ),
          stores (
            name,
            slug,
            logo_url,
            website_url
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useRelatedProducts = (categoryId: string | undefined, currentProductId: string, limit: number = 8) => {
  return useQuery({
    queryKey: ["relatedProducts", categoryId, currentProductId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name,
            slug
          ),
          stores (
            name,
            slug,
            logo_url
          ),
          comments (count)
        `)
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });
};
