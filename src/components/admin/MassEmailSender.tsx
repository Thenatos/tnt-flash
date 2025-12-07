import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Loader2, Send, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export const MassEmailSender = () => {
  const { data: permissions } = useAdminPermissions();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [percentage, setPercentage] = useState("100");
  const [emailType, setEmailType] = useState("promotional");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Verificar se tem permissão
  if (permissions && !permissions.can_send_mass_email) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="text-lg font-semibold mb-2">Acesso Negado</p>
            <p>Você não tem permissão para enviar emails em massa.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSendEmails = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Preencha o assunto e a mensagem");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      const { data, error } = await supabase.functions.invoke("send-mass-email", {
        body: { 
          subject, 
          message, 
          percentage: parseInt(percentage), 
          emailType 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error response:", error);
        throw error;
      }

      const sentCount = data?.count || 0;
      
      if (sentCount > 0) {
        const successMsg = `✅ Emails enviados com sucesso para ${sentCount} usuários!`;
        setSuccessMessage(successMsg);
        toast.success(successMsg);
        
        // Clear form
        setSubject("");
        setMessage("");
        setPercentage("100");
        setEmailType("promotional");
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        toast.warning("Nenhum email foi enviado. Verifique se há usuários cadastrados com preferência de recebimento ativo.");
      }
    } catch (error: any) {
      console.error("Error sending mass emails:", error);
      const errorMsg = error?.message || "Erro ao enviar emails";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔥 Envio de Email em Massa</CardTitle>
          <CardDescription>
            Envie emails sobre eventos e promoções para todos os usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="emailType">Tipo de Email</Label>
            <Select value={emailType} onValueChange={setEmailType} disabled={isLoading}>
              <SelectTrigger id="emailType">
                <SelectValue placeholder="Selecione o tipo de email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informational">📰 Email Informativo</SelectItem>
                <SelectItem value="promotional">🎁 Email Promocional</SelectItem>
                <SelectItem value="warning">⚠️ Email de Aviso</SelectItem>
                <SelectItem value="other">📧 Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Ex: Grande Promoção de Black Friday!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite a mensagem do email aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={10}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage">Porcentagem da Base</Label>
            <Select value={percentage} onValueChange={setPercentage} disabled={isLoading}>
              <SelectTrigger id="percentage">
                <SelectValue placeholder="Selecione a porcentagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10% da base</SelectItem>
                <SelectItem value="20">20% da base</SelectItem>
                <SelectItem value="30">30% da base</SelectItem>
                <SelectItem value="40">40% da base</SelectItem>
                <SelectItem value="50">50% da base</SelectItem>
                <SelectItem value="60">60% da base</SelectItem>
                <SelectItem value="70">70% da base</SelectItem>
                <SelectItem value="80">80% da base</SelectItem>
                <SelectItem value="90">90% da base</SelectItem>
                <SelectItem value="100">100% da base (todos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSendEmails}
            disabled={isLoading || !subject.trim() || !message.trim()}
            className="w-full gradient-accent font-bold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Emails
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Dicas para um bom email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use um assunto chamativo e relevante</p>
          <p>• Seja claro e objetivo na mensagem</p>
          <p>• Inclua links para produtos ou categorias específicas</p>
          <p>• Adicione códigos de cupom quando aplicável</p>
          <p>• Mantenha um tom amigável e profissional</p>
          <p>• Respite os usuários que optarem por não receber emails</p>
        </CardContent>
      </Card>
    </div>
  );
};
