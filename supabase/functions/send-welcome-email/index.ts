import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName }: WelcomeEmailRequest = await req.json();

    console.log(`Enviando email de boas-vindas para: ${email}`);

    const userName = fullName || email.split("@")[0];
    const siteUrl = "https://www.tntofertas.com.br";

    // Criar cliente Supabase com service role para gerar link de confirmação
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gerar link de confirmação via admin API
    const { data: confirmationData, error: confirmError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      options: {
        redirectTo: `${siteUrl}/`,
      },
    });

    if (confirmError) {
      console.warn("Aviso ao gerar link de confirmação:", confirmError.message);
      // Continua mesmo se falhar (email ainda é enviado, apenas sem link)
    }

    // Extrair o token de confirmação do link (se gerado com sucesso)
    let confirmationLink = `${siteUrl}/auth`;
    if (confirmationData?.properties?.action_link) {
      confirmationLink = confirmationData.properties.action_link;
    }

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
            .benefits-box { background-color: #FEF7CD; border: 2px solid #FBBF24; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .benefits-title { color: #92400E; font-size: 18px; font-weight: bold; margin: 0 0 12px 0; }
            .benefit-item { color: #451A03; font-size: 15px; line-height: 24px; margin: 8px 0; }
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
              <h1>🎉 Uhull Seja Muito Bem-vindo(a), ${userName}! 🎉</h1>
            </div>
            <div class="content">
              <p class="paragraph">
                Estamos <strong>super animados</strong> em ter você conosco! 🚀
              </p>
              <p class="paragraph">
                Você acabou de entrar no <strong>maior clube de ofertas</strong> da internet! 
                Prepare-se para descobrir promoções incríveis todos os dias.
              </p>
              <div class="benefits-box">
                <p class="benefits-title">🌟 O que te espera:</p>
                <p class="benefit-item">✨ Ofertas exclusivas com até 90% de desconto</p>
                <p class="benefit-item">🔥 Alertas personalizados dos produtos que você procura</p>
                <p class="benefit-item">⚡ Promoções relâmpago notificadas em primeira mão</p>
                <p class="benefit-item">💬 Comunidade ativa para compartilhar achados</p>
              </div>
              <p class="paragraph">
                Não perca tempo! As <strong>melhores ofertas</strong> podem acabar a qualquer momento.
              </p>
              <div class="button-container">
                <a href="${confirmationLink}" class="button">✅ CONFIRMAR MEU EMAIL</a>
              </div>
              <div style="text-align:center; margin: 16px 0 0 0;">
                <span style="display:inline-block; font-size:13px; color:#666; background:#F3F4F6; border-radius:6px; padding:8px 12px; word-break:break-all;">
                  Ou copie e cole este link no seu navegador:<br>
                  <strong>${confirmationLink}</strong>
                </span>
              </div>
              <p class="paragraph" style="font-size: 14px; color: #666; margin-top: 24px;">
                Após confirmar seu email, você terá acesso completo a todas as ofertas e poderá criar alertas personalizados!
              </p>
              <div class="button-container" style="margin-top: 20px;">
                <a href="${siteUrl}" class="button" style="background: #E5E7EB; color: #374151;">🛍️ EXPLORAR OFERTAS (sem confirmar)</a>
              </div>
              <p class="tip">
                💡 <strong>Dica de ouro:</strong> Configure seus alertas personalizados para nunca perder 
                uma promoção dos produtos que você deseja!
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">Economize mais, compre melhor! 💰</p>
              <p class="footer-text">Se você tiver alguma dúvida, estamos aqui para ajudar.</p>
              <p class="footer-text">É um prazer ter você conosto!.🌟</p>
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
        subject: "🎉 Bem-vindo ao clube das melhores ofertas! 🔥",
        html,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email de boas-vindas enviado com sucesso:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de boas-vindas:", error);
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
