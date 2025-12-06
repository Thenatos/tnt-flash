import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentReplyRequest {
  commentId: string;
  parentId: string;
  authorId: string;
  productId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commentId, parentId, authorId, productId }: CommentReplyRequest = await req.json();
    
    console.log("Processing reply notification for comment:", commentId);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar informações do comentário pai
    const { data: parentComment, error: parentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", parentId)
      .single();

    if (parentError || !parentComment) {
      console.error("Error fetching parent comment:", parentError);
      return new Response(JSON.stringify({ success: false, error: "Parent comment not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Não notificar se o autor da resposta for o mesmo do comentário original
    if (parentComment.user_id === authorId) {
      console.log("Author is replying to their own comment, skipping notification");
      return new Response(JSON.stringify({ success: true, notificationsSent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar informações do autor da resposta e do produto
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

    const { data: parentAuthorProfile } = await supabase
      .from("profiles")
      .select("user_id, full_name, username")
      .eq("user_id", parentComment.user_id)
      .single();

    if (!parentAuthorProfile) {
      console.log("Parent comment author not found");
      return new Response(JSON.stringify({ success: false, error: "Author not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar email do autor do comentário pai
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmail = authUsers.users.find(u => u.id === parentAuthorProfile.user_id)?.email;

    if (!userEmail) {
      console.log("Email not found for parent comment author");
      return new Response(JSON.stringify({ success: false, error: "Email not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productLink = `/produto/${productId}#comment-${commentId}`;

    // Sempre criar notificação no banco
    await supabase.from("notifications").insert({
      user_id: parentAuthorProfile.user_id,
      type: "reply",
      title: "Nova resposta ao seu comentário",
      message: `@${author?.username || "Usuário"} respondeu seu comentário em "${product?.title || "um produto"}"`,
      link: productLink,
    });

    // Verificar se usuário está online (online nos últimos 2 minutos)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: onlineCheck } = await supabase
      .from("profiles")
      .select("online_at")
      .eq("user_id", parentAuthorProfile.user_id)
      .gte("online_at", twoMinutesAgo)
      .single();

    const isOnline = !!onlineCheck;

    // Enviar email apenas se o usuário estiver offline
    if (!isOnline) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "TNT Ofertas 🔥 <noreply@tntofertas.com.br>",
            to: [userEmail],
            subject: "Nova resposta ao seu comentário",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Olá, ${parentAuthorProfile.full_name || parentAuthorProfile.username}!</h2>
                <p><strong>@${author?.username || "Usuário"}</strong> respondeu ao seu comentário em <strong>"${product?.title || "um produto"}"</strong>.</p>
                <a href="${productLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                  Ver Resposta
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  Esta é uma notificação automática. Para desativá-la, acesse as configurações da sua conta.
                </p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log(`Email sent to ${userEmail} (user was offline)`);
        } else {
          const errorData = await emailResponse.json();
          console.error(`Error sending email to ${userEmail}:`, errorData);
        }
      } catch (emailError) {
        console.error(`Error sending email to ${userEmail}:`, emailError);
      }
    } else {
      console.log(`User ${parentAuthorProfile.user_id} is online, skipping email`);
    }

    return new Response(
      JSON.stringify({ success: true, notificationsSent: 1 }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing reply notification:", error);
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
