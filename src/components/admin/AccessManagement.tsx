import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, Shield, Eye, Edit, Trash2, Plus } from "lucide-react";

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
}

interface AdminPermissions {
  id: string;
  user_id: string;
  can_view_products: boolean;
  can_view_banners: boolean;
  can_view_alert_suggestions: boolean;
  can_view_analytics: boolean;
  can_view_mass_email: boolean;
  can_view_user_management: boolean;
  can_view_access_management: boolean;
  can_create_products: boolean;
  can_edit_products: boolean;
  can_delete_products: boolean;
  can_create_banners: boolean;
  can_edit_banners: boolean;
  can_delete_banners: boolean;
  can_create_alert_suggestions: boolean;
  can_edit_alert_suggestions: boolean;
  can_delete_alert_suggestions: boolean;
  can_send_mass_email: boolean;
}

export const AccessManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadPermissions(selectedUserId);
    }
  }, [selectedUserId]);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      // Usar a view que já traz os dados completos
      const { data, error } = await supabase
        .from("admin_users_with_email")
        .select("*");

      if (error) throw error;

      console.log("Admin users from view:", data);

      const adminsData = data.map((item: any) => ({
        user_id: item.user_id,
        email: item.email || "Sem email",
        full_name: item.full_name || "Admin",
      }));

      console.log("Admins data processed:", adminsData);
      setAdmins(adminsData);
    } catch (error: any) {
      toast.error("Erro ao carregar administradores: " + error.message);
      console.error("Error loading admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissions = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPermissions(data);
      } else {
        // Criar permissões padrão se não existir
        const defaultPermissions = {
          id: "",
          user_id: userId,
          can_view_products: true,
          can_view_banners: true,
          can_view_alert_suggestions: true,
          can_view_analytics: true,
          can_view_mass_email: false,
          can_view_user_management: true,
          can_view_access_management: false,
          can_create_products: true,
          can_edit_products: true,
          can_delete_products: false,
          can_create_banners: true,
          can_edit_banners: true,
          can_delete_banners: false,
          can_create_alert_suggestions: true,
          can_edit_alert_suggestions: true,
          can_delete_alert_suggestions: false,
          can_send_mass_email: false,
        };
        setPermissions(defaultPermissions);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar permissões");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!permissions || !selectedUserId) return;

    setIsSaving(true);
    try {
      const permissionsData = {
        user_id: selectedUserId,
        can_view_products: permissions.can_view_products,
        can_view_banners: permissions.can_view_banners,
        can_view_alert_suggestions: permissions.can_view_alert_suggestions,
        can_view_analytics: permissions.can_view_analytics,
        can_view_mass_email: permissions.can_view_mass_email,
        can_view_user_management: permissions.can_view_user_management,
        can_view_access_management: permissions.can_view_access_management,
        can_create_products: permissions.can_create_products,
        can_edit_products: permissions.can_edit_products,
        can_delete_products: permissions.can_delete_products,
        can_create_banners: permissions.can_create_banners,
        can_edit_banners: permissions.can_edit_banners,
        can_delete_banners: permissions.can_delete_banners,
        can_create_alert_suggestions: permissions.can_create_alert_suggestions,
        can_edit_alert_suggestions: permissions.can_edit_alert_suggestions,
        can_delete_alert_suggestions: permissions.can_delete_alert_suggestions,
        can_send_mass_email: permissions.can_send_mass_email,
      };

      const { error } = await supabase
        .from("admin_permissions")
        .upsert(permissionsData as any, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Permissões atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar permissões");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePermission = (key: keyof AdminPermissions, value: boolean) => {
    if (permissions) {
      setPermissions({ ...permissions, [key]: value });
    }
  };

  const PermissionSwitch = ({
    label,
    icon: Icon,
    permissionKey,
    description,
  }: {
    label: string;
    icon: any;
    permissionKey: keyof AdminPermissions;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <Label className="cursor-pointer">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={permissions?.[permissionKey] as boolean || false}
        onCheckedChange={(checked) => updatePermission(permissionKey, checked)}
        disabled={!selectedUserId || isLoading}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestão de Acessos
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure as permissões de cada administrador
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Administrador</CardTitle>
          <CardDescription>
            Escolha um administrador para gerenciar suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um administrador" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.user_id} value={admin.user_id}>
                  {admin.full_name} - {admin.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && selectedUserId && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && permissions && selectedUserId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Visualização de Abas</CardTitle>
              <CardDescription>
                Defina quais abas do painel administrativo o usuário pode acessar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionSwitch
                label="Produtos"
                icon={Eye}
                permissionKey="can_view_products"
                description="Acesso à aba de gerenciamento de produtos"
              />
              <PermissionSwitch
                label="Banners"
                icon={Eye}
                permissionKey="can_view_banners"
                description="Acesso à aba de gerenciamento de banners"
              />
              <PermissionSwitch
                label="Sugestões de Alertas"
                icon={Eye}
                permissionKey="can_view_alert_suggestions"
                description="Acesso à aba de sugestões de alertas"
              />
              <PermissionSwitch
                label="Analytics"
                icon={Eye}
                permissionKey="can_view_analytics"
                description="Acesso à aba de analytics e estatísticas"
              />
              <PermissionSwitch
                label="Email em Massa"
                icon={Eye}
                permissionKey="can_view_mass_email"
                description="Acesso à aba de envio de emails em massa"
              />
              <PermissionSwitch
                label="Gerenciar Denúncias"
                icon={Eye}
                permissionKey="can_view_user_management"
                description="Acesso à aba de gerenciamento de usuários e denúncias"
              />
              <PermissionSwitch
                label="Gestão de Acessos"
                icon={Eye}
                permissionKey="can_view_access_management"
                description="Acesso à aba de gestão de acessos (esta aba)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões - Produtos</CardTitle>
              <CardDescription>
                Configure as ações que o usuário pode realizar com produtos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionSwitch
                label="Criar Produtos"
                icon={Plus}
                permissionKey="can_create_products"
                description="Permite criar novos produtos"
              />
              <PermissionSwitch
                label="Editar Produtos"
                icon={Edit}
                permissionKey="can_edit_products"
                description="Permite editar produtos existentes"
              />
              <PermissionSwitch
                label="Excluir Produtos"
                icon={Trash2}
                permissionKey="can_delete_products"
                description="Permite excluir produtos (ação irreversível)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões - Banners</CardTitle>
              <CardDescription>
                Configure as ações que o usuário pode realizar com banners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionSwitch
                label="Criar Banners"
                icon={Plus}
                permissionKey="can_create_banners"
                description="Permite criar novos banners"
              />
              <PermissionSwitch
                label="Editar Banners"
                icon={Edit}
                permissionKey="can_edit_banners"
                description="Permite editar banners existentes"
              />
              <PermissionSwitch
                label="Excluir Banners"
                icon={Trash2}
                permissionKey="can_delete_banners"
                description="Permite excluir banners (ação irreversível)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões - Sugestões de Alertas</CardTitle>
              <CardDescription>
                Configure as ações que o usuário pode realizar com sugestões de alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionSwitch
                label="Criar Sugestões"
                icon={Plus}
                permissionKey="can_create_alert_suggestions"
                description="Permite criar novas sugestões de alertas"
              />
              <PermissionSwitch
                label="Editar Sugestões"
                icon={Edit}
                permissionKey="can_edit_alert_suggestions"
                description="Permite editar sugestões existentes"
              />
              <PermissionSwitch
                label="Excluir Sugestões"
                icon={Trash2}
                permissionKey="can_delete_alert_suggestions"
                description="Permite excluir sugestões (ação irreversível)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões - Email em Massa</CardTitle>
              <CardDescription>
                Configure se o usuário pode enviar emails em massa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionSwitch
                label="Enviar Email em Massa"
                icon={Shield}
                permissionKey="can_send_mass_email"
                description="Permite enviar emails para todos os usuários (permissão sensível)"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSavePermissions}
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Permissões
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {!selectedUserId && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um administrador para gerenciar suas permissões</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
