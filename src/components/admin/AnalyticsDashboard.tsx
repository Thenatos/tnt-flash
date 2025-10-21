import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Eye, MousePointerClick, Mail, MessageCircle, Share2 } from "lucide-react";

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#3b82f6', '#eab308'];

export const AnalyticsDashboard = () => {
  // Query para eventos gerais
  const { data: eventStats } = useQuery({
    queryKey: ["analytics-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event_type")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      const stats = data.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(stats).map(([name, value]) => ({ name, value }));
    },
  });

  // Query para cliques em produtos
  const { data: productClicks } = useQuery({
    queryKey: ["analytics-product-clicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("product_id, products(title)")
        .eq("event_type", "product_click")
        .not("product_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;

      const clicks = data.reduce((acc: Record<string, number>, event: any) => {
        const title = event.products?.title || 'Unknown';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(clicks)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    },
  });

  // Query para acessos por página
  const { data: pageViews } = useQuery({
    queryKey: ["analytics-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("page_path")
        .eq("event_type", "page_view");
      
      if (error) throw error;

      const views = data.reduce((acc: Record<string, number>, event) => {
        acc[event.page_path || 'Unknown'] = (acc[event.page_path || 'Unknown'] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(views)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    },
  });

  // Query para eventos por dia (últimos 7 dias)
  const { data: dailyEvents } = useQuery({
    queryKey: ["analytics-daily"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("analytics_events")
        .select("created_at, event_type")
        .gte("created_at", sevenDaysAgo.toISOString());
      
      if (error) throw error;

      const dailyData: Record<string, Record<string, number>> = {};
      
      data.forEach((event) => {
        const date = new Date(event.created_at).toLocaleDateString('pt-BR');
        if (!dailyData[date]) dailyData[date] = {};
        dailyData[date][event.event_type] = (dailyData[date][event.event_type] || 0) + 1;
      });

      return Object.entries(dailyData).map(([date, events]) => ({
        date,
        ...events
      }));
    },
  });

  // Totais
  const totalPageViews = eventStats?.find(e => e.name === 'page_view')?.value || 0;
  const totalProductClicks = eventStats?.find(e => e.name === 'product_click')?.value || 0;
  const totalEmailEvents = eventStats?.find(e => e.name.includes('email'))?.value || 0;
  const totalWhatsAppClicks = eventStats?.find(e => e.name === 'whatsapp_click')?.value || 0;
  const totalTelegramClicks = eventStats?.find(e => e.name === 'telegram_click')?.value || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageViews}</div>
            <p className="text-xs text-muted-foreground">Total de acessos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques em Produtos</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductClicks}</div>
            <p className="text-xs text-muted-foreground">Total de cliques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-mails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmailEvents}</div>
            <p className="text-xs text-muted-foreground">Total de e-mails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWhatsAppClicks}</div>
            <p className="text-xs text-muted-foreground">Redirecionamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTelegramClicks}</div>
            <p className="text-xs text-muted-foreground">Redirecionamentos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Tipo</CardTitle>
            <CardDescription>Distribuição de todos os eventos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(eventStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Páginas Mais Acessadas</CardTitle>
            <CardDescription>Visualizações por página</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageViews || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Produtos Mais Clicados</CardTitle>
            <CardDescription>Produtos com mais cliques</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productClicks || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos - Últimos 7 Dias</CardTitle>
            <CardDescription>Tendência de eventos ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyEvents || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="page_view" stroke="#8b5cf6" name="Visualizações" />
                <Line type="monotone" dataKey="product_click" stroke="#ec4899" name="Cliques em Produtos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
