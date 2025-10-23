import { useState } from "react";
import { Search, Menu, User, LogIn, LogOut, Shield, ChevronDown, MessageCircle, Bell } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (slug: string | undefined) => void;
  onBestDealsFilter?: () => void;
}

export const Header = ({ onSearch, onCategorySelect, onBestDealsFilter }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdmin();
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'header' });
  };

  const handleTelegramClick = () => {
    trackEvent('telegram_click', { source: 'header' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* Categorias */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Categorias</h3>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        onCategorySelect?.(undefined);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Todas
                    </Button>
                    {categories?.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          onCategorySelect?.(category.slug);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Grupos */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Grupos</h3>
                  <div className="flex flex-col gap-1">
                    <a
                      href="https://chat.whatsapp.com/seu-grupo"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsAppClick}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">WhatsApp</div>
                        <p className="text-xs text-muted-foreground">Participe do nosso grupo</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Melhores Ofertas */}
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    onBestDealsFilter?.();
                    setMobileMenuOpen(false);
                  }}
                >
                  Melhores Ofertas
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="TNT Ofertas" className="h-12 w-auto" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent hidden sm:inline">
              TNT Ofertas
            </span>
          </button>
        </div>

        {/* Navigation - Desktop */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium">
                Categorias
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => onCategorySelect?.(undefined)}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                      >
                        <div className="text-sm font-medium leading-none">Todas</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Ver todas as categorias
                        </p>
                      </button>
                    </NavigationMenuLink>
                  </li>
                  {categories?.map((category) => (
                    <li key={category.id}>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => onCategorySelect?.(category.slug)}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                        >
                          <div className="text-sm font-medium leading-none">{category.name}</div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm font-medium">
                Grupos
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href="https://chat.whatsapp.com/seu-grupo"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleWhatsAppClick}
                        className="flex items-center gap-3 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium leading-none">WhatsApp</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                            Participe do nosso grupo
                          </p>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <button
                onClick={onBestDealsFilter}
                className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
              >
                Melhores Ofertas
              </button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar ofertas..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-secondary"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearch?.(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notification Bell */}
          <NotificationBell />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Minha Conta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Minha Conta</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/perfil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/alertas")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Meus Alertas</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Painel Admin</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="hidden md:flex items-center gap-2"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => navigate("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ofertas..."
            className="pl-10 bg-muted/50 border-0"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
        </div>
      </div>
    </header>
  );
};
