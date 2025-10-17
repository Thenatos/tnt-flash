import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAdminHeroBanners = () => {
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createBanner = useMutation({
    mutationFn: async (bannerData: {
      title: string;
      subtitle?: string;
      image_url: string;
      link_url?: string;
      display_order: number;
    }) => {
      const { error } = await supabase.from("hero_banners").insert(bannerData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-banners"] });
      toast.success("Banner criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar banner: " + error.message);
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({
      id,
      ...bannerData
    }: {
      id: string;
      title?: string;
      subtitle?: string;
      image_url?: string;
      link_url?: string;
      is_active?: boolean;
      display_order?: number;
    }) => {
      const { error } = await supabase
        .from("hero_banners")
        .update(bannerData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-banners"] });
      toast.success("Banner atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar banner: " + error.message);
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      queryClient.invalidateQueries({ queryKey: ["hero-banners"] });
      toast.success("Banner removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover banner: " + error.message);
    },
  });

  return {
    banners,
    isLoading,
    createBanner,
    updateBanner,
    deleteBanner,
  };
};
