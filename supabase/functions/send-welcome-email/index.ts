import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

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
    const siteUrl = "https://tntofertas.com.br";

    // Create HTML email template with TNT Ofertas design
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao TNT Ofertas</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Oxygen", "Ubuntu", "Cantarell", sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 40px 20px; }
            .email-card { background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 50%, #f39c12 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; font-size: 28px; margin: 0; font-weight: bold; }
            .party-emoji { font-size: 36px; margin-right: 10px; }
            .content { padding: 40px 30px; }
            .greeting { color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
            .intro { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
            .benefits-box { background-color: #FEF7CD; border: 2px solid #FBBF24; border-radius: 12px; padding: 24px; margin: 30px 0; }
            .benefits-title { color: #92400E; font-size: 18px; font-weight: bold; margin: 0 0 16px 0; }
            .benefit-item { color: #451A03; font-size: 15px; line-height: 28px; margin: 8px 0; padding-left: 4px; }
            .highlight { color: #1a1a1a; font-weight: bold; }
            .cta-text { color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 10px 0; text-align: center; }
            .button-container { text-align: center; margin: 20px 0 30px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #F97316 0%, #FBBF24 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3); }
            .tip-box { background-color: #F3E8FF; border: 2px solid #9b87f5; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .tip-content { color: #4C1D95; font-size: 14px; line-height: 1.6; margin: 0; }
            .tip-title { font-weight: bold; }
            .footer { background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #718096; font-size: 14px; line-height: 1.6; margin: 10px 0; }
            .footer-small { color: #a0aec0; font-size: 12px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <h1><span class="party-emoji">🎉</span>Bem-vindo, ${userName}!</h1>
                <div style="font-size: 48px; margin-top: 10px;">🎊</div>
              </div>
              
              <div class="content">
                <p class="greeting">
                  Estamos <span class="highlight">super animados</span> em ter você conosco! 🚀
                </p>
                
                <p class="intro">
                  Você acabou de entrar no <span class="highlight">maior clube de ofertas</span> da internet! 
                  Prepare-se para descobrir promoções incríveis todos os dias.
                </p>
                
                <div class="benefits-box">
                  <p class="benefits-title">🌟 O que te espera:</p>
                  <p class="benefit-item">✨ Ofertas exclusivas com até 90% de desconto</p>
                  <p class="benefit-item">🔥 Alertas personalizados dos produtos que você procura</p>
                  <p class="benefit-item">⚡ Promoções relâmpago notificadas em primeira mão</p>
                  <p class="benefit-item">💬 Comunidade ativa para compartilhar achados</p>
                </div>
                
                <p class="cta-text">
                  Não perca tempo! As <span class="highlight">melhores ofertas</span> podem acabar a qualquer momento.
                </p>
                
                <div class="button-container">
                  <a href="${siteUrl}" class="button">🛍️ EXPLORAR OFERTAS AGORA</a>
                </div>
                
                <div class="tip-box">
                  <p class="tip-content">
                    <span class="tip-title">💡 Dica de ouro:</span> Configure seus alertas personalizados para nunca perder 
                    uma promoção dos produtos que você deseja!
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p class="footer-text">Economize mais, compre melhor! 💰</p>
                <p class="footer-text">Se você tiver alguma dúvida, estamos aqui para ajudar.</p>
                <p class="footer-small">© ${new Date().getFullYear()} TNT Ofertas. Todos os direitos reservados.</p>
                <p class="footer-small">Este é um email automático, por favor não responda.</p>
              </div>
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
        from: "TNT Ofertas <onboarding@resend.dev>",
        to: [email],
        subject: "🎉 Bem-vindo ao TNT Ofertas - Clube das Melhores Ofertas!",
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
