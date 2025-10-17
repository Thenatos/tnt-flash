import { 
  Smartphone, 
  Monitor, 
  ShoppingBag, 
  Sofa, 
  Dumbbell, 
  Baby, 
  BookOpen, 
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";

const getCategoryIcon = (slug: string) => {
  const iconMap: Record<string, any> = {
    "bebes": Baby,
    "casa": Sofa,
    "celulares": Smartphone,
    "eletronicos": Smartphone,
    "esportes": Dumbbell,
    "informatica": Monitor,
    "livros-games": BookOpen,
    "moda": ShoppingBag
  };
  return iconMap[slug] || Gamepad2;
};

const getCategoryColor = (slug: string) => {
  const colorMap: Record<string, string> = {
    "bebes": "text-cyan-500",
    "casa": "text-green-500",
    "celulares": "text-blue-500",
    "eletronicos": "text-purple-500",
    "esportes": "text-orange-500",
    "informatica": "text-indigo-500",
    "livros-games": "text-amber-500",
    "moda": "text-pink-500"
  };
  return colorMap[slug] || "text-gray-500";
};

interface CategorySectionProps {
  onCategorySelect?: (slug: string | undefined) => void;
  selectedCategory?: string;
}

export const CategorySection = ({ onCategorySelect, selectedCategory }: CategorySectionProps) => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-12 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Buscar por <span className="text-gradient-primary">Categorias</span>
        </h2>
        
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
            <Button
              variant={!selectedCategory ? "secondary" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4 px-6 hover-lift min-w-[120px] shadow-md hover:shadow-lg flex-shrink-0 snap-start"
              onClick={() => onCategorySelect?.(undefined)}
            >
              <span className="text-sm font-semibold">Todas</span>
            </Button>
            {!isLoading && categories?.map((category) => {
              const Icon = getCategoryIcon(category.slug);
              const color = getCategoryColor(category.slug);
              const isSelected = selectedCategory === category.slug;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "secondary" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4 px-6 hover-lift min-w-[120px] shadow-md hover:shadow-lg flex-shrink-0 snap-start"
                  onClick={() => onCategorySelect?.(category.slug)}
                >
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-secondary-foreground' : color}`} />
                  <span className="text-sm font-semibold whitespace-nowrap">{category.name}</span>
                </Button>
              );
            })}
          </div>
          <div className="text-center mt-2 text-sm text-muted-foreground">
            ← Deslize para ver mais categorias →
          </div>
        </div>
      </div>
    </section>
  );
};
