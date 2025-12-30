import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductAlertsSection } from "@/components/ProductAlertsSection";
import { EmailPreferences } from "@/components/admin/EmailPreferences";
import { AvatarCreator } from "@/components/AvatarCreator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, User, ArrowLeft, Bell, Mail } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, username")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setFullName(data.full_name || "");
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const resizeImage = (file: File, maxSize: number = 400): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo proporção
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Erro ao processar imagem'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Redimensionar imagem para economizar espaço
      const resizedBlob = await resizeImage(file);
      
      const fileExt = 'jpg'; // Sempre salvar como JPEG
      const filePath = `${user?.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Foto enviada e otimizada com sucesso!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarCreated = (createdAvatarUrl: string) => {
    setAvatarUrl(createdAvatarUrl);
    toast.success("Avatar criado com sucesso!");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          username: username,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <h1 className="text-3xl font-bold mb-6">Minha Conta</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="h-4 w-4 mr-2" />
                Alertas
              </TabsTrigger>
              <TabsTrigger value="email-preferences">
                <Mail className="h-4 w-4 mr-2" />
                Emails
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Meu Perfil</h2>
                    <p className="text-muted-foreground">
                      Gerencie suas informações pessoais
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Avatar atual */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Upload customizado */}
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                          <Upload className="h-4 w-4" />
                          {uploading ? "Enviando..." : "Enviar Foto"}
                        </div>
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadAvatar}
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  {/* Criador de Avatar */}
                  <div className="space-y-3">
                    <Label>Ou crie seu avatar personalizado:</Label>
                    <AvatarCreator 
                      onAvatarCreated={handleAvatarCreated} 
                      onSave={handleSaveProfile}
                    />
                  </div>

                  {/* Nome completo */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  {/* Username (@) */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted text-sm rounded-l-md">@</span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="seu_usuario"
                        className="rounded-l-none flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Seu identificador público (sem espaços).</p>
                  </div>

                  {/* Email (readonly) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  {/* Trocar senha in-site */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowChangePasswordDialog(true)}
                    >
                      Trocar Senha
                    </Button>
                  </div>

                  {/* Botão salvar */}
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Dialog para trocar senha */}
            <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Trocar Senha</DialogTitle>
                  <DialogDescription>Altere sua senha com segurança.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <div className="flex w-full gap-2">
                    <Button variant="outline" className="w-full" onClick={() => setShowChangePasswordDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      className="w-full"
                      disabled={changingPassword}
                      onClick={async () => {
                        if (newPassword.length < 8) {
                          toast.error('A senha deve ter pelo menos 8 caracteres');
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          toast.error('As senhas não coincidem');
                          return;
                        }

                        try {
                          setChangingPassword(true);
                          const { error } = await supabase.auth.updateUser({ password: newPassword });
                          if (error) throw error;
                          toast.success('Senha alterada com sucesso');
                          setShowChangePasswordDialog(false);
                          setNewPassword('');
                          setConfirmPassword('');
                        } catch (err: any) {
                          toast.error(err?.message || 'Erro ao alterar senha');
                        } finally {
                          setChangingPassword(false);
                        }
                      }}
                    >
                      {changingPassword ? 'Alterando...' : 'Salvar'}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <TabsContent value="alerts">
              <ProductAlertsSection />
            </TabsContent>

            <TabsContent value="email-preferences">
              <EmailPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
