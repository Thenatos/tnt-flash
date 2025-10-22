import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Mail } from "lucide-react";

export const EmailPreferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    receive_alerts: true,
    receive_promotions: true,
    receive_mass_emails: true,
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPreferences({
          receive_alerts: data.receive_alerts,
          receive_promotions: data.receive_promotions,
          receive_mass_emails: data.receive_mass_emails,
        });
      } else {
        // Criar preferências padrão se não existirem
        await supabase.from("email_preferences").insert({
          user_id: user.id,
          receive_alerts: true,
          receive_promotions: true,
          receive_mass_emails: true,
        });
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast.error("Erro ao carregar preferências");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof typeof preferences) => {
    if (!user) return;

    const newValue = !preferences[key];
    
    // Atualizar otimisticamente
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    try {
      const { error } = await supabase
        .from("email_preferences")
        .upsert({
          user_id: user.id,
          [key]: newValue,
        });

      if (error) throw error;

      toast.success("Preferência atualizada");
    } catch (error: any) {
      // Reverter em caso de erro
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
      toast.error("Erro ao atualizar preferência");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Preferências de Email</CardTitle>
            <CardDescription>
              Gerencie quais tipos de emails você deseja receber
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <Label htmlFor="receive_alerts" className="text-base font-medium">
              Alertas de Produtos
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações quando produtos dos seus alertas estiverem disponíveis
            </p>
          </div>
          <Switch
            id="receive_alerts"
            checked={preferences.receive_alerts}
            onCheckedChange={() => handleToggle("receive_alerts")}
          />
        </div>

        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <Label htmlFor="receive_promotions" className="text-base font-medium">
              Promoções Especiais
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba emails sobre ofertas e promoções exclusivas
            </p>
          </div>
          <Switch
            id="receive_promotions"
            checked={preferences.receive_promotions}
            onCheckedChange={() => handleToggle("receive_promotions")}
          />
        </div>

        <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <Label htmlFor="receive_mass_emails" className="text-base font-medium">
              Emails em Massa
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba emails sobre grandes eventos e novidades
            </p>
          </div>
          <Switch
            id="receive_mass_emails"
            checked={preferences.receive_mass_emails}
            onCheckedChange={() => handleToggle("receive_mass_emails")}
          />
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Você ainda receberá emails importantes relacionados à sua conta, mesmo que desative todas as opções acima.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
