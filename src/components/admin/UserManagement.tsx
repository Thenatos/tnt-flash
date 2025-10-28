import { useState } from "react";
import { useUserPunishments } from "@/hooks/useUserPunishments";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Ban, UserX, Clock, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const UserManagement = () => {
  const { punishments, isLoading, createPunishment, removePunishment } = useUserPunishments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [punishmentType, setPunishmentType] = useState("comment_ban");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${searchEmail}%`)
      .limit(1)
      .single();

    if (error || !data) {
      alert("Usuário não encontrado");
      return;
    }

    setSelectedUser(data);
  };

  const handleApplyPunishment = () => {
    if (!selectedUser) return;

    let expiresAt: string | undefined;
    if (duration && duration !== "permanent") {
      const days = parseInt(duration);
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString();
    }

    createPunishment.mutate(
      {
        userId: selectedUser.user_id,
        punishmentType,
        reason: reason || undefined,
        expiresAt,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedUser(null);
          setSearchEmail("");
          setReason("");
          setDuration("");
        },
      }
    );
  };

  const getPunishmentIcon = (type: string) => {
    switch (type) {
      case "comment_ban":
        return <UserX className="h-4 w-4" />;
      case "site_ban":
        return <Ban className="h-4 w-4" />;
      case "temporary_ban":
        return <Clock className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPunishmentLabel = (type: string) => {
    switch (type) {
      case "comment_ban":
        return "Bloqueio de Comentários";
      case "site_ban":
        return "Banimento do Site";
      case "temporary_ban":
        return "Suspensão Temporária";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Ban className="mr-2 h-4 w-4" />
              Aplicar Punição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aplicar Punição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar Usuário</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o username..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                  <Button onClick={handleSearchUser}>Buscar</Button>
                </div>
                {selectedUser && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Punição</Label>
                <Select value={punishmentType} onValueChange={setPunishmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment_ban">Bloqueio de Comentários</SelectItem>
                    <SelectItem value="site_ban">Banimento do Site</SelectItem>
                    <SelectItem value="temporary_ban">Suspensão Temporária</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duração</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="permanent">Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Motivo (opcional)</Label>
                <Textarea
                  placeholder="Descreva o motivo da punição..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleApplyPunishment}
                disabled={!selectedUser || createPunishment.isPending}
                className="w-full"
              >
                Aplicar Punição
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo de Punição</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aplicado por</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {punishments && punishments.length > 0 ? (
                punishments.map((punishment: any) => (
                  <TableRow key={punishment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{punishment.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{punishment.profiles?.username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPunishmentIcon(punishment.punishment_type)}
                        {getPunishmentLabel(punishment.punishment_type)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {punishment.reason || "-"}
                    </TableCell>
                    <TableCell>
                      {punishment.is_active ? (
                        <Badge variant="destructive">
                          Ativa
                          {punishment.expires_at && (
                            <span className="ml-1 text-xs">
                              (expira{" "}
                              {formatDistanceToNow(new Date(punishment.expires_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                              )
                            </span>
                          )}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>{punishment.admin?.full_name}</TableCell>
                    <TableCell>
                      {punishment.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePunishment.mutate(punishment.id)}
                        >
                          Remover
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma punição aplicada ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
