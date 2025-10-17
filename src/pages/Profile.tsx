import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, User, ArrowLeft } from "lucide-react";

const PRESET_AVATARS = [
  // Homens brancos
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Felix&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Max&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Charlie&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Oliver&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Leo&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Cooper&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Duke&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Jack&skinColor=ffdbb4",
  
  // Homens negros
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Rocky&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Milo&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Buddy&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Bailey&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Bear&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Toby&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Zeus&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Oscar&skinColor=8d5524",
  
  // Mulheres brancas
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Aneka&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Luna&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Bella&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Lucy&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Lily&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Chloe&skinColor=ffdbb4",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Stella&skinColor=f4c8a8",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Penny&skinColor=ffdbb4",
  
  // Mulheres negras
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Sophie&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Daisy&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Molly&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Sadie&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Zoe&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Ruby&skinColor=8d5524",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Rosie&skinColor=ae7242",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=Ellie&skinColor=8d5524",
];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

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
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setFullName(data.full_name || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setSelectedPreset(null);
      toast.success("Foto enviada com sucesso!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (presetUrl: string) => {
    setAvatarUrl(presetUrl);
    setSelectedPreset(presetUrl);
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
        <div className="container px-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Meu Perfil</h1>
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

              {/* Avatares predefinidos */}
              <div className="space-y-3">
                <Label>Ou escolha um avatar:</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg">
                  {PRESET_AVATARS.map((preset) => (
                    <div
                      key={preset}
                      onClick={() => handleSelectPreset(preset)}
                      className={`cursor-pointer rounded-full border-2 transition-all hover:scale-110 ${
                        selectedPreset === preset || avatarUrl === preset
                          ? "border-primary shadow-lg"
                          : "border-transparent"
                      }`}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={preset} />
                      </Avatar>
                    </div>
                  ))}
                </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
