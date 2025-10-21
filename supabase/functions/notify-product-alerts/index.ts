import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductAlert {
  id: string;
  user_id: string;
  alert_type: string;
  search_term: string;
  category_id: string | null;
  store_id: string | null;
}

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  promotional_price: number;
  discount_percentage: number;
  affiliate_link: string;
  category_id: string;
  store_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { product }: { product: Product } = await req.json();

    console.log("Verificando alertas para produto:", product.title);

    // Buscar alertas ativos que correspondem ao produto
    const { data: alerts, error: alertsError } = await supabase
      .from("product_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsError) {
      console.error("Erro ao buscar alertas:", alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log("Nenhum alerta ativo encontrado");
      return new Response(
        JSON.stringify({ message: "Nenhum alerta para processar" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Buscar dados adicionais do produto
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", product.category_id)
      .single();

    const { data: store } = await supabase
      .from("stores")
      .select("name")
      .eq("id", product.store_id)
      .single();

    // Filtrar alertas que correspondem ao produto
    const matchingAlerts = alerts.filter((alert: ProductAlert) => {
      if (alert.alert_type === "product_name") {
        return product.title.toLowerCase().includes(alert.search_term.toLowerCase());
      } else if (alert.alert_type === "category") {
        return product.category_id === alert.category_id;
      } else if (alert.alert_type === "store") {
        return product.store_id === alert.store_id;
      }
      return false;
    });

    console.log(`Encontrados ${matchingAlerts.length} alertas correspondentes`);

    // Agrupar alertas por usuário para enviar apenas um email
    const userAlerts = new Map();
    matchingAlerts.forEach((alert: any) => {
      const userId = alert.user_id;
      if (!userAlerts.has(userId)) {
        userAlerts.set(userId, { alerts: [] });
      }
      userAlerts.get(userId).alerts.push(alert);
    });

    // Buscar emails dos usuários
    const userIds = Array.from(userAlerts.keys());
    const { data: users } = await supabase.auth.admin.listUsers();
    
    // Enviar emails
    const emailPromises = Array.from(userAlerts.entries()).map(async ([userId, userData]) => {
      const user = users?.users.find(u => u.id === userId);
      if (!user?.email) {
        console.log(`Email não encontrado para usuário ${userId}`);
        return;
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerta de Oferta - TNT Ofertas</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        🎉 Oferta Encontrada!
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 16px;">
                        O produto que você estava esperando chegou!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Product Image -->
                  <tr>
                    <td style="padding: 0;">
                      <img src="${product.image_url}" alt="${product.title}" style="width: 100%; height: auto; display: block; max-height: 400px; object-fit: cover;">
                    </td>
                  </tr>
                  
                  <!-- Product Details -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 24px; font-weight: bold;">
                        ${product.title}
                      </h2>
                      
                      ${product.description ? `
                        <p style="margin: 0 0 20px 0; color: #666; font-size: 15px; line-height: 1.6;">
                          ${product.description}
                        </p>
                      ` : ''}
                      
                      <!-- Category and Store -->
                      <div style="margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 8px;">
                        <p style="margin: 0 0 8px 0; color: #2d3436; font-size: 14px;">
                          <strong>📂 Categoria:</strong> ${category?.name || "N/A"}
                        </p>
                        <p style="margin: 0; color: #2d3436; font-size: 14px;">
                          <strong>🏪 Loja:</strong> ${store?.name || "N/A"}
                        </p>
                      </div>
                      
                      <!-- Pricing -->
                      <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; text-decoration: line-through; opacity: 0.8;">
                          De: R$ ${product.original_price.toFixed(2)}
                        </p>
                        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 36px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                          R$ ${product.promotional_price.toFixed(2)}
                        </p>
                        <div style="display: inline-block; background-color: #fd79a8; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 16px; font-weight: bold; margin-top: 10px;">
                          ${product.discount_percentage}% OFF
                        </div>
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0 20px 0;">
                        <a href="https://tntofertas.com.br/produto/${product.id}" style="display: inline-block; background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4); transition: all 0.3s;">
                          🛒 Ver Oferta Agora
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; border-top: 2px solid #e9ecef;">
                      <p style="margin: 0 0 10px 0; color: #666; font-size: 13px; text-align: center;">
                        Você recebeu este email porque configurou um alerta para este tipo de produto no TNT Ofertas.
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} TNT Ofertas. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: "TNT Ofertas <noreply@tntofertas.com.br>",
            to: [user.email],
            subject: `🔥 Oferta Encontrada: ${product.title}`,
            html: emailHtml,
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`Erro ao enviar email para ${user.email}:`, error);
        } else {
          console.log(`Email enviado com sucesso para ${user.email}`);
        }
      } catch (error) {
        console.error(`Erro ao processar email para ${user.email}:`, error);
      }
    });

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: "Alertas processados com sucesso",
        notified: userAlerts.size
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("Erro na função de alertas:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
};

serve(handler);