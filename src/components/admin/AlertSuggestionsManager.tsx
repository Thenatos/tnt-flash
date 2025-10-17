import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export const AlertSuggestionsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<any>(null);
  const [term, setTerm] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");

  // Buscar sugestões (admin vê todas)
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["alert-suggestions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_suggestions")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Criar sugestão
  const createMutation = useMutation({
    mutationFn: async (data: { term: string; is_active: boolean; display_order: number }) => {
      const { error } = await supabase
        .from("alert_suggestions")
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions"] });
      toast.success("Sugestão criada com sucesso!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar sugestão");
    },
  });

  // Atualizar sugestão
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from("alert_suggestions")
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions"] });
      toast.success("Sugestão atualizada!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar sugestão");
    },
  });

  // Deletar sugestão
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alert_suggestions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions"] });
      toast.success("Sugestão removida!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover sugestão");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      term,
      is_active: isActive,
      display_order: displayOrder,
    };

    if (editingSuggestion) {
      updateMutation.mutate({ id: editingSuggestion.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (suggestion: any) => {
    setEditingSuggestion(suggestion);
    setTerm(suggestion.term);
    setIsActive(suggestion.is_active);
    setDisplayOrder(suggestion.display_order);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta sugestão?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingSuggestion(null);
    setTerm("");
    setIsActive(true);
    setDisplayOrder(0);
    setIsDialogOpen(false);
  };

  const filteredSuggestions = suggestions?.filter((s) =>
    s.term.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sugestões de Alertas</h2>
          <p className="text-muted-foreground">
            Gerencie as sugestões exibidas para os usuários ao criar alertas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Sugestão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSuggestion ? "Editar Sugestão" : "Nova Sugestão"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="term">Termo da Sugestão</Label>
                <Input
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Ex: Smartphone Samsung, iPhone..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativo</Label>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSuggestion ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Filtrar sugestões..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-sm"
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Termo</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuggestions?.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{suggestion.term}</TableCell>
                    <TableCell>{suggestion.display_order}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          suggestion.is_active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {suggestion.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(suggestion)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(suggestion.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
