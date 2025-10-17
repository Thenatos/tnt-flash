import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface BannerFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isLoading?: boolean;
}

export const BannerForm = ({
  onSubmit,
  defaultValues,
  isLoading,
}: BannerFormProps) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: defaultValues || {
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      is_active: true,
      display_order: 0,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(defaultValues?.image_url || "");
  const isActive = watch("is_active");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas imagens");
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from('banner-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banner-images')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      setPreviewUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao fazer upload da imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setValue('image_url', '');
    setPreviewUrl('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...register("title", { required: true })}
          placeholder="OFERTAS EXPLOSIVAS"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Textarea
          id="subtitle"
          {...register("subtitle")}
          placeholder="As melhores promoções do Brasil em um só lugar!"
        />
      </div>

      <div className="space-y-2">
        <Label>Imagem do Banner *</Label>
        
        {/* Preview da imagem */}
        {previewUrl && (
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload de arquivo */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: 1920x500px. Máximo: 5MB
            </p>
          </div>
          {uploading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Ou URL manual */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou use uma URL
            </span>
          </div>
        </div>

        <Input
          id="image_url"
          {...register("image_url", { required: true })}
          placeholder="https://exemplo.com/imagem.jpg"
          value={previewUrl}
          onChange={(e) => {
            setValue('image_url', e.target.value);
            setPreviewUrl(e.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="link_url">Link (opcional)</Label>
        <Input
          id="link_url"
          {...register("link_url")}
          placeholder="https://exemplo.com/oferta"
        />
      </div>

      <div>
        <Label htmlFor="display_order">Ordem de Exibição</Label>
        <Input
          id="display_order"
          type="number"
          {...register("display_order", { valueAsNumber: true })}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Menor número aparece primeiro
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue("is_active", checked)}
        />
        <Label htmlFor="is_active">Banner Ativo</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || uploading}>
        {isLoading ? "Salvando..." : defaultValues ? "Atualizar" : "Criar"} Banner
      </Button>
    </form>
  );
};
