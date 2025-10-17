import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentMentionRequest {
  commentId: string;
  content: string;
  authorId: string;
  productId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commentId, content, authorId, productId }: CommentMentionRequest = await req.json();
    
    console.log("Processing mentions for comment:", commentId);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair menções (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);
    
    if (mentions.length === 0) {
      console.log("No mentions found");
      return new Response(JSON.stringify({ success: true, mentionsProcessed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Found mentions:", mentions);

    // Buscar perfis dos usuários mencionados
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, username, full_name")
      .in("username", mentions);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No valid users found for mentions");
      return new Response(JSON.stringify({ success: true, mentionsProcessed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar informações do autor e do produto
    const { data: author } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("user_id", authorId)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("title")
      .eq("id", productId)
      .single();

    // Buscar emails dos usuários
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmails = new Map(authUsers.users.map(u => [u.id, u.email]));

    // Processar cada menção
    let notificationsSent = 0;
    for (const profile of profiles) {
      // Não notificar o próprio autor
      if (profile.user_id === authorId) continue;

      const email = userEmails.get(profile.user_id);
      if (!email) continue;

      const productLink = `${Deno.env.get("SUPABASE_URL")?.replace("https://lndlitesudgswlejhupp.supabase.co", "https://descola.lovable.app")}/produto/${productId}#comment-${commentId}`;

      // Criar notificação no banco
      await supabase.from("notifications").insert({
        user_id: profile.user_id,
        type: "mention",
        title: "Você foi mencionado em um comentário",
        message: `@${author?.username || "Usuário"} mencionou você em "${product?.title || "um produto"}"`,
        link: productLink,
      });

      // Enviar email usando Resend API diretamente
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Descola <onboarding@resend.dev>",
            to: [email],
            subject: "Você foi mencionado em um comentário",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Olá, ${profile.full_name || profile.username}!</h2>
                <p><strong>@${author?.username || "Usuário"}</strong> mencionou você em um comentário sobre <strong>"${product?.title || "um produto"}"</strong>.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;">${content.substring(0, 200)}${content.length > 200 ? "..." : ""}</p>
                </div>
                <a href="${productLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                  Ver Comentário
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  Esta é uma notificação automática. Para desativá-la, acesse as configurações da sua conta.
                </p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          notificationsSent++;
          console.log(`Notification sent to ${email}`);
        } else {
          const errorData = await emailResponse.json();
          console.error(`Error sending email to ${email}:`, errorData);
        }
      } catch (emailError) {
        console.error(`Error sending email to ${email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, mentionsProcessed: notificationsSent }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing mentions:", error);
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
