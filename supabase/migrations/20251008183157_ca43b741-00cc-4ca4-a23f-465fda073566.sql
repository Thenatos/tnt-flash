-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lojas parceiras
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos/ofertas
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC(10, 2) NOT NULL,
  promotional_price NUMERIC(10, 2) NOT NULL,
  discount_percentage INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  coupon_code TEXT,
  installment_info TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  is_hot BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de comentários
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de roles de usuário (para admin)
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Criar índices para melhor performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_comments_product ON public.comments(product_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies para categorias (público pode ler, admin pode tudo)
CREATE POLICY "Todos podem ver categorias" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin pode inserir categorias" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode atualizar categorias" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode deletar categorias" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para lojas (público pode ler, admin pode tudo)
CREATE POLICY "Todos podem ver lojas" ON public.stores
  FOR SELECT USING (true);

CREATE POLICY "Admin pode inserir lojas" ON public.stores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode atualizar lojas" ON public.stores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode deletar lojas" ON public.stores
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para produtos (público pode ler, admin pode tudo)
CREATE POLICY "Todos podem ver produtos" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admin pode inserir produtos" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode atualizar produtos" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode deletar produtos" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para perfis (usuários podem ver todos, mas só editar o próprio)
CREATE POLICY "Todos podem ver perfis" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para comentários (usuários autenticados podem comentar)
CREATE POLICY "Todos podem ver comentários" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar comentários" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios comentários" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios comentários" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin pode deletar qualquer comentário" ON public.comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Policies para user_roles (só admin pode gerenciar)
CREATE POLICY "Admin pode ver todas as roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode inserir roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode deletar roles" ON public.user_roles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir categorias padrão
INSERT INTO public.categories (name, slug) VALUES
  ('Celulares e Smartphones', 'celulares'),
  ('Eletrônicos', 'eletronicos'),
  ('Moda e Acessórios', 'moda'),
  ('Casa e Decoração', 'casa'),
  ('Esportes e Fitness', 'esportes'),
  ('Bebês e Crianças', 'bebes'),
  ('Livros e Games', 'livros-games'),
  ('Informática', 'informatica');

-- Inserir lojas padrão
INSERT INTO public.stores (name, slug, website_url) VALUES
  ('Amazon', 'amazon', 'https://amazon.com.br'),
  ('Magazine Luiza', 'magazineluiza', 'https://magazineluiza.com.br'),
  ('Americanas', 'americanas', 'https://americanas.com.br'),
  ('Kabum', 'kabum', 'https://kabum.com.br'),
  ('Casas Bahia', 'casasbahia', 'https://casasbahia.com.br'),
  ('Extra', 'extra', 'https://extra.com.br'),
  ('Netshoes', 'netshoes', 'https://netshoes.com.br'),
  ('Mercado Livre', 'mercadolivre', 'https://mercadolivre.com.br');