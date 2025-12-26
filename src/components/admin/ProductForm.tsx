import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { optimizeImage, isImageFile, formatFileSize } from "@/utils/imageOptimizer";

const productSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  original_price: z.string().min(1, "Preço original é obrigatório"),
  promotional_price: z.string().min(1, "Preço promocional é obrigatório"),
  discount_percentage: z.string().min(1, "Desconto é obrigatório"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  store_id: z.string().min(1, "Loja é obrigatória"),
  image_url: z.string().min(1, "Imagem é obrigatória"),
  affiliate_link: z.string().url("Link de afiliado inválido"),
  coupon_code: z.string().optional(),
  installment_count: z.string().optional(),
  has_interest: z.boolean().default(false),
  is_hot: z.boolean().default(false),
  expires_in_days: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  defaultValues?: Partial<ProductFormData>;
  isLoading?: boolean;
}

export const ProductForm = ({ onSubmit, defaultValues, isLoading }: ProductFormProps) => {
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

  const [useImageUpload, setUseImageUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validatingLink, setValidatingLink] = useState(false);
  const [linkValidationError, setLinkValidationError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      original_price: "",
      promotional_price: "",
      discount_percentage: "",
      category_id: "",
      store_id: "",
      image_url: "",
      affiliate_link: "",
      coupon_code: "",
      installment_count: "",
      has_interest: false,
      is_hot: false,
      expires_in_days: "never",
    },
  });

  // Calcular desconto automaticamente
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "original_price" || name === "promotional_price") {
        const original = parseFloat(value.original_price || "0");
        const promotional = parseFloat(value.promotional_price || "0");
        
        if (original > 0 && promotional > 0 && promotional < original) {
          const discount = Math.round(((original - promotional) / original) * 100);
          form.setValue("discount_percentage", discount.toString());
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Valida se é uma imagem
      if (!isImageFile(file)) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      const originalSize = file.size;
      console.log(`📸 Imagem original: ${formatFileSize(originalSize)}`);

      setUploading(true);
      toast.loading("Otimizando imagem...", { id: "image-upload" });

      // Otimiza a imagem (converte para WebP e redimensiona)
      const optimizedFile = await optimizeImage(file, 800, 800, 0.85);
      const optimizedSize = optimizedFile.size;
      const savings = Math.round((1 - optimizedSize / originalSize) * 100);

      console.log(`✅ Imagem otimizada: ${formatFileSize(optimizedSize)} (${savings}% menor)`);
      toast.loading(`Enviando imagem otimizada (${savings}% menor)...`, { id: "image-upload" });

      const fileName = `${Math.random()}.webp`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      form.setValue("image_url", publicUrl);
      toast.success(`Imagem otimizada e enviada! (${savings}% menor)`, { id: "image-upload" });
    } catch (error: any) {
      console.error("Erro ao processar imagem:", error);
      toast.error(error?.message || "Erro ao processar imagem", { id: "image-upload" });
    } finally {
      setUploading(false);
    }
  };

  const validateAffiliateLink = async (link: string, storeId: string) => {
    if (!link || !storeId) return;

    setValidatingLink(true);
    setLinkValidationError(null);

    try {
      let urlToValidate = link;

      // Check if it's a shortened URL (common patterns)
      const isShortened = /^https?:\/\/(s\.|bit\.ly|tinyurl\.|goo\.gl|short\.|t\.co)/i.test(link);

      if (isShortened) {
        // Expand the URL first
        const { data: expandData, error: expandError } = await supabase.functions.invoke(
          "expand-url",
          {
            body: { url: link },
          }
        );

        if (expandError) {
          toast.error("Erro ao expandir link encurtado: " + expandError.message);
          setValidatingLink(false);
          return;
        }

        if (expandData?.expandedUrl) {
          urlToValidate = expandData.expandedUrl;
          toast.success("Link expandido para validação");
        }
      }

      // Validate the (possibly expanded) URL
      const { data, error } = await supabase.rpc("validate_affiliate_link", {
        p_store_id: storeId,
        p_link: urlToValidate,
      });

      if (error) throw error;

      if (!data) {
        setLinkValidationError(
          `O link ${isShortened ? "expandido" : ""} não contém um ID de afiliado válido para esta loja. Por favor, verifique o link.`
        );
      } else if (isShortened) {
        toast.success("Link encurtado validado com sucesso!");
      }
    } catch (error: any) {
      toast.error("Erro ao validar link: " + error.message);
    } finally {
      setValidatingLink(false);
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    // Validate affiliate link before submitting
    if (linkValidationError) {
      toast.error("Corrija o erro no link de afiliado antes de continuar.");
      return;
    }

    // Final validation check
    setValidatingLink(true);
    try {
      let urlToValidate = data.affiliate_link;

      // Check if it's a shortened URL
      const isShortened = /^https?:\/\/(s\.|bit\.ly|tinyurl\.|goo\.gl|short\.|t\.co)/i.test(data.affiliate_link);

      if (isShortened) {
        // Expand the URL first
        const { data: expandData, error: expandError } = await supabase.functions.invoke(
          "expand-url",
          {
            body: { url: data.affiliate_link },
          }
        );

        if (expandError) {
          toast.error("Erro ao expandir link encurtado: " + expandError.message);
          setValidatingLink(false);
          return;
        }

        if (expandData?.expandedUrl) {
          urlToValidate = expandData.expandedUrl;
        }
      }

      const { data: isValid, error } = await supabase.rpc("validate_affiliate_link", {
        p_store_id: data.store_id,
        p_link: urlToValidate,
      });

      if (error) throw error;

      if (!isValid) {
        toast.error(`O link ${isShortened ? "expandido" : ""} não contém um ID de afiliado válido para esta loja.`);
        setLinkValidationError("Link inválido");
        return;
      }

      // Link is valid, proceed with submission
      onSubmit(data);
    } catch (error: any) {
      toast.error("Erro ao validar link: " + error.message);
    } finally {
      setValidatingLink(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Nome do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="original_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Original</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="199.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="promotional_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Promocional</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="149.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="discount_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desconto (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="25" {...field} disabled />
              </FormControl>
              <FormDescription>Calculado automaticamente</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="store_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loja</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores?.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <Label>Imagem do Produto</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant={useImageUpload ? "outline" : "default"}
              size="sm"
              onClick={() => setUseImageUpload(false)}
            >
              URL
            </Button>
            <Button
              type="button"
              variant={useImageUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setUseImageUpload(true)}
            >
              Upload
            </Button>
          </div>

          {useImageUpload ? (
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-muted-foreground mt-2">Enviando...</p>}
              {form.watch("image_url") && (
                <img
                  src={form.watch("image_url")}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded"
                />
              )}
            </div>
          ) : (
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="affiliate_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link de Afiliado</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://loja.com/produto?ref=..." 
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    const storeId = form.getValues("store_id");
                    if (e.target.value && storeId) {
                      validateAffiliateLink(e.target.value, storeId);
                    }
                  }}
                />
              </FormControl>
              {validatingLink && (
                <p className="text-sm text-muted-foreground">Validando link...</p>
              )}
              {linkValidationError && (
                <p className="text-sm text-destructive">{linkValidationError}</p>
              )}
              <FormDescription>
                O link deve conter um ID de afiliado configurado para a loja selecionada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coupon_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cupom (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="DESCONTO10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="installment_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcelas</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Quantidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="has_interest"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel>Tipo de Parcelamento</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">Sem Juros</SelectItem>
                    <SelectItem value="true">Com Juros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expires_in_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validade da Oferta</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo de validade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="never">Nunca expira</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} {days === 1 ? "dia" : "dias"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                A oferta será marcada como expirada após esse período
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="secondary" className="w-full" disabled={isLoading || uploading || validatingLink}>
          {isLoading ? "Salvando Promoção..." : "Salvar Produto"}
        </Button>
      </form>
    </Form>
  );
};
