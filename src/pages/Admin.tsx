import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";
import { BannersManager } from "@/components/admin/BannersManager";
import { AlertSuggestionsManager } from "@/components/admin/AlertSuggestionsManager";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useAdmin();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-destructive">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let expiresAt = null;
      if (data.expires_in_days === "expired") {
        // Define como expirado (data no passado)
        expiresAt = new Date(Date.now() - 86400000).toISOString(); // 1 dia no passado
      } else if (data.expires_in_days && data.expires_in_days !== "never") {
        const daysToAdd = parseInt(data.expires_in_days);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysToAdd);
        expiresAt = expirationDate.toISOString();
      }

      const productData = {
        title: data.title,
        description: data.description || null,
        original_price: parseFloat(data.original_price),
        promotional_price: parseFloat(data.promotional_price),
        discount_percentage: parseInt(data.discount_percentage),
        category_id: data.category_id,
        store_id: data.store_id,
        image_url: data.image_url,
        affiliate_link: data.affiliate_link,
        coupon_code: data.coupon_code || null,
        installment_info: data.installment_info || null,
        is_hot: data.is_hot || false,
        expires_at: expiresAt,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        
        // Notificar usuários com alertas correspondentes
        try {
          await supabase.functions.invoke("notify-product-alerts", {
            body: { product: newProduct },
          });
        } catch (alertError) {
          // Notificação de alertas é opcional - não bloqueia criação do produto
        }
        
        toast.success("Produto criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      toast.success("Produto excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir produto");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct({
      ...product,
      original_price: product.original_price.toString(),
      promotional_price: product.promotional_price.toString(),
      discount_percentage: product.discount_percentage.toString(),
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="container py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold">
            Painel <span className="text-gradient-primary">Administrativo</span>
          </h1>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="alert-suggestions">Sugestões de Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Oferta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Oferta" : "Nova Oferta"}
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    onSubmit={handleSubmit}
                    defaultValues={editingProduct}
                    isLoading={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingProducts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Preço Original</TableHead>
                      <TableHead>Preço Promo</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>R$ {product.original_price}</TableCell>
                        <TableCell className="text-primary font-bold">
                          R$ {product.promotional_price}
                        </TableCell>
                        <TableCell>
                          <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm font-bold">
                            {product.discount_percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
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
          </TabsContent>

          <TabsContent value="banners">
            <BannersManager />
          </TabsContent>

          <TabsContent value="alert-suggestions">
            <AlertSuggestionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
