import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const AlertSuggestionsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState("0");

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

  const saveMutation = useMutation({
    mutationFn: async (suggestionData: any) => {
      if (editingSuggestion) {
        const { error } = await supabase
          .from("alert_suggestions")
          .update(suggestionData)
          .eq("id", editingSuggestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("alert_suggestions")
          .insert(suggestionData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["product-suggestions"] });
      toast.success(
        editingSuggestion
          ? "Sugestão atualizada!"
          : "Sugestão criada!"
      );
      setIsDialogOpen(false);
      setEditingSuggestion(null);
      setNewTerm("");
      setNewDisplayOrder("0");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("alert_suggestions")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["product-suggestions"] });
    },
  });

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
      toast.success("Sugestão removida!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      term: newTerm.trim(),
      display_order: parseInt(newDisplayOrder) || 0,
      is_active: true,
    });
  };

  const handleEdit = (suggestion: any) => {
    setEditingSuggestion(suggestion);
    setNewTerm(suggestion.term);
    setNewDisplayOrder(suggestion.display_order.toString());
    setIsDialogOpen(true);
  };

  const filteredSuggestions = suggestions?.filter((s) =>
    s.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sugestões de Alertas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Nova Sugestão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSuggestion ? "Editar" : "Nova"} Sugestão
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Termo</Label>
                <Input
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Ex: Samsung Galaxy S24"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={newDisplayOrder}
                  onChange={(e) => setNewDisplayOrder(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingSuggestion ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Termo</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuggestions?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.term}</TableCell>
                  <TableCell>{s.display_order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: s.id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Excluir?")) deleteMutation.mutate(s.id);
                        }}
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
  );
};
