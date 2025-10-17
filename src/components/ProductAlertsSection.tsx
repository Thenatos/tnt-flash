import { useState } from "react";
import { Bell, Plus, X, Search, Tag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductAlerts } from "@/hooks/useProductAlerts";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertSuggestions } from "@/components/AlertSuggestions";

export const ProductAlertsSection = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState<"product_name" | "category" | "store">("product_name");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStore, setSelectedStore] = useState("");

  const { alerts, isLoading, createAlert, toggleAlert, deleteAlert } = useProductAlerts();
  const { data: categories } = useCategories();

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Faça login para criar alertas de produtos
          </p>
          <Button asChild>
            <a href="/auth">Fazer Login</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCreateAlert = () => {
    const alertData: any = {
      alert_type: alertType,
      search_term: searchTerm,
    };

    if (alertType === "category" && selectedCategory) {
      alertData.category_id = selectedCategory;
    } else if (alertType === "store" && selectedStore) {
      alertData.store_id = selectedStore;
    }

    createAlert.mutate(alertData);
    setIsOpen(false);
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStore("");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "category":
        return <Tag className="h-4 w-4" />;
      case "store":
        return <Store className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Meus Alertas
          </h2>
          <p className="text-muted-foreground mt-1">
            Receba notificações quando produtos de interesse forem cadastrados
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Alerta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Alerta</DialogTitle>
              <DialogDescription>
                Configure um alerta e receba emails quando produtos correspondentes forem cadastrados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Alerta</Label>
                <Select
                  value={alertType}
                  onValueChange={(value: any) => setAlertType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_name">Nome do Produto</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                    <SelectItem value="store">Loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {alertType === "product_name" && (
                <div className="space-y-2">
                  <Label htmlFor="search">Termo de Busca</Label>
                  <Input
                    id="search"
                    placeholder="Ex: smartphone, notebook, fone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              {alertType === "category" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-cat">Termo de Busca (opcional)</Label>
                    <Input
                      id="search-cat"
                      placeholder="Refinamento adicional..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </>
              )}

              {alertType === "store" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="store">Loja</Label>
                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores?.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-store">Termo de Busca (opcional)</Label>
                    <Input
                      id="search-store"
                      placeholder="Refinamento adicional..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                onClick={handleCreateAlert}
                disabled={
                  !searchTerm &&
                  (alertType === "product_name" ||
                    (!selectedCategory && alertType === "category") ||
                    (!selectedStore && alertType === "store"))
                }
                className="w-full"
              >
                Criar Alerta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Suggestions */}
      <AlertSuggestions />

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Carregando alertas...
            </CardContent>
          </Card>
        ) : alerts && alerts.length > 0 ? (
          alerts.map((alert: any) => (
            <Card key={alert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getAlertIcon(alert.alert_type)}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {alert.alert_type === "product_name" && `Produto: "${alert.search_term}"`}
                        {alert.alert_type === "category" && (
                          <>
                            Categoria: {alert.categories?.name}
                            {alert.search_term && ` - "${alert.search_term}"`}
                          </>
                        )}
                        {alert.alert_type === "store" && (
                          <>
                            Loja: {alert.stores?.name}
                            {alert.search_term && ` - "${alert.search_term}"`}
                          </>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Criado em {new Date(alert.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.is_active ? "default" : "secondary"}>
                      {alert.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) =>
                        toggleAlert.mutate({ id: alert.id, is_active: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert.mutate(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Você ainda não tem alertas configurados.
                <br />
                Crie seu primeiro alerta para começar a receber notificações!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};