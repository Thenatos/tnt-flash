import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordEmailRequest {
  email: string;
  resetLink: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, fullName }: ResetPasswordEmailRequest = await req.json();

    console.log(`Enviando email de reset de senha para: ${email}`);

    const userName = fullName || email.split("@")[0];
    const siteUrl = "https://www.tntofertas.com.br";

    // Create HTML email template with site colors
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9b87f5 0%, #D946EF 50%, #F97316 100%); border-radius: 12px 12px 0 0; padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; font-size: 32px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; }
            .paragraph { color: #333333; font-size: 16px; line-height: 26px; margin: 16px 0; }
            .warning-box { background-color: #FEE2E2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .warning-title { color: #991B1B; font-size: 18px; font-weight: bold; margin: 0 0 12px 0; }
            .warning-text { color: #7F1D1D; font-size: 15px; line-height: 24px; margin: 8px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { background: linear-gradient(135deg, #F97316 0%, #FBBF24 100%); border-radius: 8px; color: #ffffff; font-size: 18px; font-weight: bold; text-decoration: none; display: inline-block; padding: 16px 40px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
            .tip { background-color: #F3E8FF; border: 2px solid #9b87f5; border-radius: 8px; padding: 16px; color: #4C1D95; font-size: 14px; line-height: 22px; margin: 24px 0; }
            .footer { background-color: #f6f6f6; padding: 20px 30px; text-align: center; margin-top: 20px; }
            .footer-text { color: #666666; font-size: 14px; line-height: 24px; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperar Senha 🔐</h1>
            </div>
            <div class="content">
              <p class="paragraph">
                Oi <strong>${userName}</strong>! 👋
              </p>
              <p class="paragraph">
                Recebemos uma solicitação para redefinir a senha da sua conta <strong>TNT OFERTAS</strong>.
              </p>
              <div class="warning-box">
                <p class="warning-title">⚠️ Segurança importante:</p>
                <p class="warning-text">Se você <strong>NÃO</strong> solicitou esta redefinição de senha, ignore este email. Sua conta está segura!</p>
              </div>
              <p class="paragraph">
                Se você pediu para redefinir sua senha, clique no botão abaixo para continuar:
              </p>
              <div class="button-container">
                <a href="${resetLink}" class="button">🔑 REDEFINIR MINHA SENHA</a>
              </div>
              <div style="text-align:center; margin: 16px 0 0 0;">
                <span style="display:inline-block; font-size:13px; color:#666; background:#F3F4F6; border-radius:6px; padding:8px 12px; word-break:break-all;">
                  Ou copie e cole este link no seu navegador:<br>
                  <strong>${resetLink}</strong>
                </span>
              </div>
              <p class="paragraph" style="font-size: 14px; color: #666; margin-top: 24px;">
                Este link expira em 24 horas por motivos de segurança.
              </p>
              <div class="tip">
                💡 <strong>Dica de segurança:</strong> Nunca compartilhe este link com ninguém! 
                A equipe TNT OFERTAS nunca pedirá sua senha.
              </div>
              <p class="paragraph" style="font-size: 13px; color: #999; margin-top: 24px; text-align: center;">
                Precisa de ajuda? Visite nosso site: <a href="${siteUrl}" style="color: #F97316; text-decoration: none; font-weight: bold;">${siteUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">Segurança em primeiro lugar! 🛡️</p>
              <p class="footer-text">Estamos aqui para ajudar você a manter sua conta segura.</p>
              <p class="footer-text">© 2025 TNT Ofertas. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "TNT Ofertas 🔥 <noreply@tntofertas.com.br>",
        to: [email],
        subject: "🔐 Redefinir sua senha - TNT Ofertas 🔥",
        html,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email de reset de senha enviado com sucesso:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de reset de senha:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
