import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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

  const isActive = watch("is_active");

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

      <div>
        <Label htmlFor="image_url">URL da Imagem *</Label>
        <Input
          id="image_url"
          {...register("image_url", { required: true })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Recomendado: 1920x500px ou maior
        </p>
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Salvando..." : defaultValues ? "Atualizar" : "Criar"} Banner
      </Button>
    </form>
  );
};
