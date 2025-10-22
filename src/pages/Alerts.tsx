import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductAlertsSection } from "@/components/ProductAlertsSection";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Alerts = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <ProductAlertsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Alerts;