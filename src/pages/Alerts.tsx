import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductAlertsSection } from "@/components/ProductAlertsSection";

const Alerts = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductAlertsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Alerts;