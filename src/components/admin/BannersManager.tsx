import { useState } from "react";
import { useAdminHeroBanners } from "@/hooks/useHeroBanners";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Button } from "@/components/ui/button";
import { BannerForm } from "./BannerForm";
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
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const BannersManager = () => {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useAdminHeroBanners();
  const { data: permissions } = useAdminPermissions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner.id, ...data });
    } else {
      await createBanner.mutateAsync(data);
    }
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    await deleteBanner.mutateAsync(id);
  };

  const handleToggleActive = async (banner: any) => {
    await updateBanner.mutateAsync({
      id: banner.id,
      is_active: !banner.is_active,
    });
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Banners</h2>
        {(permissions?.can_create_banners ?? true) && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingBanner(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Banner
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Editar Banner" : "Novo Banner"}
              </DialogTitle>
            </DialogHeader>
            <BannerForm
              onSubmit={handleSubmit}
              defaultValues={editingBanner}
              isLoading={createBanner.isPending || updateBanner.isPending}
            />
          </DialogContent>
          </Dialog>
        )}
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
                <TableHead>Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-32 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{banner.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={banner.is_active ? "default" : "secondary"}>
                      {banner.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(banner)}
                        title={banner.is_active ? "Desativar" : "Ativar"}
                      >
                        {banner.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {(permissions?.can_edit_banners ?? true) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {(permissions?.can_delete_banners ?? true) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                          title="Excluir"
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
    </div>
  );
};
