import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPunishments } from "@/hooks/useUserPunishments";
import { useCommentReports } from "@/hooks/useCommentReports";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ban, UserX, Clock, Shield, ExternalLink, Archive, CheckCircle, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const UserManagement = () => {
  const { punishments, isLoading, createPunishment, removePunishment } = useUserPunishments();
  const { reports: pendingReports, isLoading: isLoadingPending, updateReportStatus: updatePendingStatus } = useCommentReports('pending');
  const { reports: historyReports, isLoading: isLoadingHistory } = useCommentReports('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [punishmentType, setPunishmentType] = useState("comment_ban");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

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
          setSelectedReport(null);
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

  const handleApplyPunishmentFromReport = (report: any) => {
    const commentAuthor = report.comments;
    setSelectedUser({
      user_id: commentAuthor.user_id,
      full_name: report.reported_user?.full_name,
      username: report.reported_user?.username,
    });
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const handleResolveReport = (reportId: string) => {
    updatePendingStatus.mutate({ reportId, status: 'resolved' });
  };

  const handleDismissReport = (reportId: string) => {
    if (confirm("Deseja arquivar esta denúncia sem ação?")) {
      updatePendingStatus.mutate({ reportId, status: 'dismissed' });
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "spam":
        return "Spam";
      case "offensive":
        return "Ofensivo";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs para Denúncias Pendentes e Histórico */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Denúncias Pendentes</TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Denúncias Pendentes */}
        <TabsContent value="pending" className="space-y-6">
          <h2 className="text-2xl font-bold">Denúncias Pendentes</h2>
          
          {isLoadingPending ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingReports && pendingReports.length > 0 ? (
            <div className="grid gap-4">
              {pendingReports.map((report: any) => (
                <Card key={report.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Denunciado por @{report.reporter?.username}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">Autor do comentário:</span>{" "}
                          {report.reported_user?.full_name} (@{report.reported_user?.username})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissReport(report.id)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Comentário denunciado:</p>
                      <p className="text-sm">{report.comments.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/produto/${report.comments.product_id}`}
                        target="_blank"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Ver conversa completa em "{report.comments.products.title}"
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApplyPunishmentFromReport(report)}
                      >
                        Aplicar Punição
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma denúncia pendente</p>
            </Card>
          )}
        </TabsContent>

        {/* Histórico de Denúncias */}
        <TabsContent value="history" className="space-y-6">
          <h2 className="text-2xl font-bold">Histórico de Denúncias</h2>
          
          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyReports && historyReports.length > 0 ? (
            <div className="grid gap-4">
              {historyReports.filter((r: any) => r.status !== 'pending').map((report: any) => (
                <Card key={report.id} className="p-4 opacity-75">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                            {report.status === 'resolved' ? 'Resolvida' : 'Arquivada'}
                          </Badge>
                          <Badge variant="outline">
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Denunciado por @{report.reporter?.username}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold">Autor:</span>{" "}
                          {report.reported_user?.full_name} (@{report.reported_user?.username})
                        </p>
                        {report.verifier && (
                          <p className="text-sm text-muted-foreground">
                            Verificado por {report.verifier.full_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Comentário:</p>
                      <p className="text-sm">{report.comments.content}</p>
                    </div>

                    <Link
                      to={`/produto/${report.comments.product_id}`}
                      target="_blank"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Ver produto "{report.comments.products.title}"
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum histórico disponível</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Seção de Punições Aplicadas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Punições Aplicadas</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedReport(null);
                  setIsDialogOpen(true);
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                Aplicar Punição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Aplicar Punição</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedReport && (
                  <Card className="p-3 bg-muted">
                    <p className="text-sm font-medium mb-1">Comentário denunciado:</p>
                    <p className="text-sm">{selectedReport.comments.content}</p>
                  </Card>
                )}

                {!selectedUser && (
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
                  </div>
                )}

                {selectedUser && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-semibold">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                )}

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
    </div>
  );
};
