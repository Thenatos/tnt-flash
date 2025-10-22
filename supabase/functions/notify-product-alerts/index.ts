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

    // Agrupar alertas por usuário
    const userAlerts = new Map();
    matchingAlerts.forEach((alert: any) => {
      const userId = alert.user_id;
      if (!userAlerts.has(userId)) {
        userAlerts.set(userId, { alerts: [] });
      }
      userAlerts.get(userId).alerts.push(alert);
    });

    // Criar notificações no site para todos os usuários
    const notificationPromises = Array.from(userAlerts.keys()).map(async (userId) => {
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "product_alert",
          title: "🔥 Nova Oferta Encontrada!",
          message: `${product.title} - ${product.discount_percentage}% OFF`,
          link: `/produto/${product.id}`,
        });
      } catch (error) {
        console.error(`Erro ao criar notificação para usuário ${userId}:`, error);
      }
    });

    await Promise.all(notificationPromises);

    // Buscar preferências de email dos usuários
    const { data: emailPreferences } = await supabase
      .from("email_preferences")
      .select("user_id, receive_alerts")
      .in("user_id", Array.from(userAlerts.keys()));

    // Buscar emails dos usuários
    const { data: users } = await supabase.auth.admin.listUsers();
    
    // Enviar emails apenas para quem optou por receber
    const emailPromises = Array.from(userAlerts.entries()).map(async ([userId, userData]) => {
      // Verificar preferências de email
      const userPreferences = emailPreferences?.find(p => p.user_id === userId);
      if (userPreferences && !userPreferences.receive_alerts) {
        console.log(`Usuário ${userId} optou por não receber emails de alertas`);
        return;
      }

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
          <title>Nova Oferta Encontrada - TNT Ofertas</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header com Gradiente -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🎉 Nova Oferta Encontrada!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Mensagem Inicial -->
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <p style="margin: 0 0 15px 0; color: #333; font-size: 16px; line-height: 1.5;">
                        Estamos <strong>super animados</strong> em ter uma nova oferta para você! 🚀
                      </p>
                      <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.5;">
                        Encontramos um produto que corresponde aos seus alertas configurados. Confira os detalhes abaixo:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Imagem do Produto -->
                  <tr>
                    <td style="padding: 0 30px;">
                      <img src="${product.image_url}" alt="${product.title}" style="width: 100%; height: auto; display: block; border-radius: 12px; max-height: 300px; object-fit: cover;">
                    </td>
                  </tr>
                  
                  <!-- Detalhes do Produto -->
                  <tr>
                    <td style="padding: 25px 30px;">
                      <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 22px; font-weight: bold;">
                        ${product.title}
                      </h2>
                      
                      ${product.description ? `
                        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.6;">
                          ${product.description}
                        </p>
                      ` : ''}
                      
                      <!-- Categoria e Loja -->
                      <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">
                          <strong>📂 Categoria:</strong> ${category?.name || "N/A"}
                        </p>
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                          <strong>🏪 Loja:</strong> ${store?.name || "N/A"}
                        </p>
                      </div>
                      
                      <!-- Preço com Destaque -->
                      <div style="margin: 25px 0; padding: 25px; background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #7c3aed; font-size: 14px; text-decoration: line-through;">
                          De: R$ ${product.original_price.toFixed(2)}
                        </p>
                        <p style="margin: 0 0 10px 0; color: #7c3aed; font-size: 40px; font-weight: bold; line-height: 1;">
                          R$ ${product.promotional_price.toFixed(2)}
                        </p>
                        <div style="display: inline-block; background-color: #ec4899; color: #ffffff; padding: 10px 24px; border-radius: 25px; font-size: 18px; font-weight: bold;">
                          ${product.discount_percentage}% OFF
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Botão CTA -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px; text-align: center;">
                      <a href="https://tntofertas.com.br/produto/${product.id}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; padding: 16px 50px; border-radius: 8px; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                        🛒 Explorar Oferta Agora
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Dica de Ouro -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #ede9fe; border-radius: 10px; padding: 20px; border-left: 4px solid #a855f7;">
                        <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.6;">
                          💡 <strong>Dica de ouro:</strong> Configure seus alertas personalizados para nunca perder uma promoção dos produtos que você deseja!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        Economize mais, compre melhor! 🔥
                      </p>
                      <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 13px;">
                        Se você tiver alguma dúvida, estamos aqui para ajudar.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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