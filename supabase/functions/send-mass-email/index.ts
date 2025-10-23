import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MassEmailRequest {
  subject: string;
  message: string;
  percentage?: number;
  emailType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário é admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { subject, message, percentage = 100, emailType = "promotional" }: MassEmailRequest = await req.json();

    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    if (percentage < 1 || percentage > 100) {
      throw new Error("Percentage must be between 1 and 100");
    }

    // Configurações de tema baseado no tipo de email
    const emailThemes = {
      informational: {
        gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)",
        emoji: "📰",
        boxBg: "#DBEAFE",
        boxBorder: "#3B82F6",
        textColor: "#1E3A8A",
        footerText: "Fique informado sobre as melhores ofertas! 📢"
      },
      promotional: {
        gradient: "linear-gradient(135deg, #9b87f5 0%, #D946EF 50%, #F97316 100%)",
        emoji: "🎉",
        boxBg: "#FEF7CD",
        boxBorder: "#FBBF24",
        textColor: "#451A03",
        footerText: "Economize mais, compre melhor! 💰"
      },
      warning: {
        gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #DC2626 100%)",
        emoji: "⚠️",
        boxBg: "#FEE2E2",
        boxBorder: "#EF4444",
        textColor: "#7F1D1D",
        footerText: "Atenção importante para você! ⚡"
      },
      other: {
        gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #374151 100%)",
        emoji: "📧",
        boxBg: "#F3F4F6",
        boxBorder: "#9CA3AF",
        textColor: "#1F2937",
        footerText: "Mensagem importante de TNT Ofertas 📬"
      }
    };

    const theme = emailThemes[emailType as keyof typeof emailThemes] || emailThemes.promotional;

    // Buscar usuários que optaram por receber emails em massa
    const { data: emailPreferences, error: preferencesError } = await supabase
      .from("email_preferences")
      .select("user_id")
      .eq("receive_mass_emails", true)
      .limit(1000);

    if (preferencesError) throw preferencesError;

    if (!emailPreferences || emailPreferences.length === 0) {
      return new Response(
        JSON.stringify({ count: 0, message: "No users opted in for mass emails" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Selecionar porcentagem aleatória dos usuários
    let selectedPreferences = emailPreferences;
    if (percentage < 100) {
      const targetCount = Math.ceil((emailPreferences.length * percentage) / 100);
      // Embaralhar array aleatoriamente e pegar apenas a quantidade necessária
      selectedPreferences = emailPreferences
        .sort(() => Math.random() - 0.5)
        .slice(0, targetCount);
      
      console.log(`Selected ${selectedPreferences.length} out of ${emailPreferences.length} users (${percentage}%)`);
    }

    // Buscar emails dos usuários selecionados
    const userIds = selectedPreferences.map(p => p.user_id);
    const emails: string[] = [];

    for (const userId of userIds) {
      const { data: { user: userData }, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (!userError && userData?.email) {
        emails.push(userData.email);
      }
    }

    console.log(`Sending emails to ${emails.length} users`);

    // Enviar emails individualmente para cada usuário
    let sentCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TNT Ofertas <noreply@tntofertas.com.br>",
            to: [email],
            subject: subject,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${theme.gradient}; border-radius: 12px 12px 0 0; padding: 40px 30px; text-align: center; }
                    .header h1 { color: #ffffff; font-size: 32px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .content { background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; }
                    .paragraph { color: #333333; font-size: 16px; line-height: 26px; margin: 16px 0; }
                    .message-box { background-color: ${theme.boxBg}; border: 2px solid ${theme.boxBorder}; border-radius: 12px; padding: 20px; margin: 24px 0; }
                    .message-content { color: ${theme.textColor}; font-size: 15px; line-height: 24px; }
                    .footer { background-color: #f6f6f6; padding: 20px 30px; text-align: center; margin-top: 20px; }
                    .footer-text { color: #666666; font-size: 14px; line-height: 24px; margin: 8px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>${theme.emoji} ${subject} ${theme.emoji}</h1>
                    </div>
                    <div class="content">
                      <div class="message-box">
                        <div class="message-content">
                          ${message.replace(/\n/g, '<br>')}
                        </div>
                      </div>
                      <p class="paragraph">
                        Não perca esta oportunidade! Aproveite as <strong>melhores ofertas</strong> agora mesmo.
                      </p>
                    </div>
                    <div class="footer">
                      <p class="footer-text">${theme.footerText}</p>
                      <p class="footer-text">
                        Você está recebendo este email porque é cadastrado em nossa plataforma de ofertas.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }),
        });

        if (emailResponse.ok) {
          sentCount++;
          console.log(`Email ${i + 1}/${emails.length} enviado com sucesso para ${email}`);
        } else {
          const errorText = await emailResponse.text();
          console.error(`Erro ao enviar email para ${email}:`, errorText);
        }
      } catch (error) {
        console.error(`Erro ao processar email ${email}:`, error);
      }

      // Pequeno delay entre emails para não sobrecarregar a API
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return new Response(
      JSON.stringify({ count: sentCount, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-mass-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
