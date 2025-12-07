import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AdminPermissions {
  id: string;
  user_id: string;
  // Visualização de abas
  can_view_products: boolean;
  can_view_banners: boolean;
  can_view_alert_suggestions: boolean;
  can_view_analytics: boolean;
  can_view_mass_email: boolean;
  can_view_user_management: boolean;
  can_view_access_management: boolean;
  // CRUD Produtos
  can_create_products: boolean;
  can_edit_products: boolean;
  can_delete_products: boolean;
  // CRUD Banners
  can_create_banners: boolean;
  can_edit_banners: boolean;
  can_delete_banners: boolean;
  // CRUD Sugestões de Alertas
  can_create_alert_suggestions: boolean;
  can_edit_alert_suggestions: boolean;
  can_delete_alert_suggestions: boolean;
  // Email em Massa
  can_send_mass_email: boolean;
}

export const useAdminPermissions = () => {
  const { user } = useAuth();

  return useQuery<AdminPermissions | null>({
    queryKey: ["adminPermissions", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching admin permissions:", error);
        // Retornar permissões COMPLETAS por padrão para admins sem registro
        return {
          id: "",
          user_id: user.id,
          can_view_products: true,
          can_view_banners: true,
          can_view_alert_suggestions: true,
          can_view_analytics: true,
          can_view_mass_email: true,
          can_view_user_management: true,
          can_view_access_management: true,
          can_create_products: true,
          can_edit_products: true,
          can_delete_products: true,
          can_create_banners: true,
          can_edit_banners: true,
          can_delete_banners: true,
          can_create_alert_suggestions: true,
          can_edit_alert_suggestions: true,
          can_delete_alert_suggestions: true,
          can_send_mass_email: true,
        };
      }

      return data;
    },
    enabled: !!user,
  });
};
