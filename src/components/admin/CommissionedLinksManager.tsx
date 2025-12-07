import { useState, useEffect } from "react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Store {
  id: string;
  name: string;
}

interface AffiliateId {
  id: string;
  store_id: string;
  affiliate_id: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CommissionedLinksManager = () => {
  const { data: permissions } = useAdminPermissions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [affiliateIds, setAffiliateIds] = useState<AffiliateId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<AffiliateId | null>(null);
  const [formData, setFormData] = useState({
    affiliate_id: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadAffiliateIds();
    }
  }, [selectedStore]);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar lojas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadAffiliateIds = async () => {
    if (!selectedStore) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("store_affiliate_ids")
        .select("*")
        .eq("store_id", selectedStore)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAffiliateIds(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar IDs de afiliado",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStore) {
      toast({
        title: "Selecione uma loja",
        variant: "destructive",
      });
      return;
    }

    if (!formData.affiliate_id.trim()) {
      toast({
        title: "ID de afiliado é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("store_affiliate_ids")
          .update({
            affiliate_id: formData.affiliate_id.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active,
          })
          .eq("id", editingId.id);

        if (error) throw error;

        toast({
          title: "ID atualizado com sucesso",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from("store_affiliate_ids")
          .insert({
            store_id: selectedStore,
            affiliate_id: formData.affiliate_id.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active,
            created_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: "ID criado com sucesso",
        });
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ affiliate_id: "", description: "", is_active: true });
      loadAffiliateIds();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ID de afiliado?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_affiliate_ids")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "ID excluído com sucesso",
      });

      loadAffiliateIds();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (affiliateId: AffiliateId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_affiliate_ids")
        .update({ is_active: !affiliateId.is_active })
        .eq("id", affiliateId.id);

      if (error) throw error;

      toast({
        title: `ID ${!affiliateId.is_active ? "ativado" : "desativado"} com sucesso`,
      });

      loadAffiliateIds();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (affiliateId: AffiliateId) => {
    setEditingId(affiliateId);
    setFormData({
      affiliate_id: affiliateId.affiliate_id,
      description: affiliateId.description || "",
      is_active: affiliateId.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({ affiliate_id: "", description: "", is_active: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Links Comissionados</CardTitle>
          <CardDescription>
            Gerencie os IDs de afiliado por loja. Os produtos só poderão ser cadastrados se o link contiver um dos IDs ativos configurados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="store-select">Selecione uma loja</Label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger id="store-select">
                    <SelectValue placeholder="Escolha uma loja..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedStore && (permissions?.can_create_products ?? true) && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleDialogClose()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo ID
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingId ? "Editar ID de Afiliado" : "Novo ID de Afiliado"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="affiliate_id">ID de Afiliado *</Label>
                        <Input
                          id="affiliate_id"
                          value={formData.affiliate_id}
                          onChange={(e) =>
                            setFormData({ ...formData, affiliate_id: e.target.value })
                          }
                          placeholder="Ex: affil123, tag=xyz, etc."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Descrição opcional do ID..."
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_active: checked })
                          }
                        />
                        <Label htmlFor="is_active">Ativo</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDialogClose}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedStore && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : affiliateIds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum ID de afiliado cadastrado para esta loja.
                    {(permissions?.can_create_products ?? true) && (
                      <p className="mt-2">Clique em "Novo ID" para adicionar o primeiro.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-lg shadow-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID de Afiliado</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {affiliateIds.map((affiliateId) => (
                          <TableRow key={affiliateId.id}>
                            <TableCell className="font-mono font-medium">
                              {affiliateId.affiliate_id}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {affiliateId.description || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={affiliateId.is_active ? "default" : "secondary"}>
                                {affiliateId.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(affiliateId.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleActive(affiliateId)}
                                  title={affiliateId.is_active ? "Desativar" : "Ativar"}
                                >
                                  <Switch checked={affiliateId.is_active} />
                                </Button>
                                {(permissions?.can_edit_products ?? true) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(affiliateId)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {(permissions?.can_delete_products ?? true) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(affiliateId.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
