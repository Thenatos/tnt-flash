import { 
  Smartphone, 
  Monitor, 
  ShoppingBag, 
  Sofa, 
  Dumbbell, 
  Baby, 
  BookOpen, 
  Gamepad2,
  Tv,
  Watch,
  Headphones,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: any;
  color: string;
}

const categories: Category[] = [
  {
    id: "1",
    name: "Eletrônicos",
    slug: "eletronicos",
    icon: Smartphone,
    color: "text-blue-500"
  },
  {
    id: "2",
    name: "Informática",
    slug: "informatica",
    icon: Monitor,
    color: "text-purple-500"
  },
  {
    id: "3",
    name: "Casa e Decoração",
    slug: "casa",
    icon: Sofa,
    color: "text-green-500"
  },
  {
    id: "4",
    name: "Moda",
    slug: "moda",
    icon: ShoppingBag,
    color: "text-pink-500"
  },
  {
    id: "5",
    name: "Esportes",
    slug: "esportes",
    icon: Dumbbell,
    color: "text-orange-500"
  },
  {
    id: "6",
    name: "TV e Áudio",
    slug: "tv-audio",
    icon: Tv,
    color: "text-indigo-500"
  },
  {
    id: "7",
    name: "Games",
    slug: "games",
    icon: Gamepad2,
    color: "text-red-500"
  },
  {
    id: "8",
    name: "Bebês",
    slug: "bebes",
    icon: Baby,
    color: "text-cyan-500"
  },
  {
    id: "9",
    name: "Livros",
    slug: "livros",
    icon: BookOpen,
    color: "text-amber-500"
  },
  {
    id: "10",
    name: "Relógios",
    slug: "relogios",
    icon: Watch,
    color: "text-yellow-600"
  },
  {
    id: "11",
    name: "Áudio",
    slug: "audio",
    icon: Headphones,
    color: "text-violet-500"
  },
  {
    id: "12",
    name: "Câmeras",
    slug: "cameras",
    icon: Camera,
    color: "text-teal-500"
  }
];

interface CategorySectionProps {
  onCategorySelect?: (slug: string | undefined) => void;
  selectedCategory?: string;
}

export const CategorySection = ({ onCategorySelect, selectedCategory }: CategorySectionProps) => {
  return (
    <section className="py-12 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Buscar por <span className="text-gradient-primary">Categorias</span>
        </h2>
        
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <Button
              variant={!selectedCategory ? "secondary" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4 px-6 hover-lift min-w-[120px] shadow-md hover:shadow-lg flex-shrink-0"
              onClick={() => onCategorySelect?.(undefined)}
            >
              <span className="text-sm font-semibold">Todas</span>
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.slug;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "secondary" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4 px-6 hover-lift min-w-[120px] shadow-md hover:shadow-lg flex-shrink-0"
                  onClick={() => onCategorySelect?.(category.slug)}
                >
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-secondary-foreground' : category.color}`} />
                  <span className="text-sm font-semibold whitespace-nowrap">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
