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

    const { subject, message }: MassEmailRequest = await req.json();

    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    // Buscar todos os usuários
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(1000);

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ count: 0, message: "No users found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar emails dos usuários
    const userIds = profiles.map(p => p.user_id);
    const emails: string[] = [];

    for (const userId of userIds) {
      const { data: { user: userData }, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (!userError && userData?.email) {
        emails.push(userData.email);
      }
    }

    console.log(`Sending emails to ${emails.length} users`);

    // Enviar emails em lotes
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ofertas <onboarding@resend.dev>",
          to: batch,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">${subject}</h1>
              <div style="color: #666; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                Você está recebendo este email porque é cadastrado em nossa plataforma de ofertas.
              </p>
            </div>
          `,
        }),
      });

      if (emailResponse.ok) {
        sentCount += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1} sent successfully`);
      } else {
        const errorText = await emailResponse.text();
        console.error(`Error sending batch ${Math.floor(i / batchSize) + 1}:`, errorText);
      }

      // Pequeno delay entre lotes para não sobrecarregar a API
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
