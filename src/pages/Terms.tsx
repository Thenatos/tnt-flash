import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarkdownContent } from "@/components/MarkdownContent";

const Terms = () => {
  const navigate = useNavigate();

  const content = `
# TERMOS E CONDIÇÕES DE USO

Bem-vindo ao **TNT Ofertas**, um portal 100% independente voltado à divulgação de ofertas e promoções de produtos e serviços de terceiros (parceiros afiliados). Atuamos como vitrine, atuando no legítimo interesse dos consumidores em geral, com ética e transparência. É um prazer tê-lo conosco!

O TNT Ofertas informa aos seus usuários sobre ofertas de produtos e serviços prestados e divulgados por terceiros, por meio de links de afiliação, viabilizando que muitos de seus usuários realizem seus sonhos por um custo mais acessível.

O intuito do TNT Ofertas, ao publicar quaisquer promoções em seus canais, é o de divulgar ao grande público a existência de produtos ou serviços em condições financeiras mais vantajosas do que as habitualmente praticadas no mercado, permitindo que os usuários possam ter acesso a itens ou serviços que normalmente não teriam.

Os editores e administradores do TNT Ofertas podem editar ou apagar o conteúdo publicado em nosso Portal a qualquer momento e sem a necessidade de qualquer comunicação prévia, caso o conteúdo se torne ilegítimo, expire ou não respeite estes Termos de Uso e as regras do site.

Apenas os administradores têm acesso aos endereços de e-mail cadastrados no TNT Ofertas, os quais, somente serão compartilhados nos termos da nossa Política de Privacidade, a menos que sejamos obrigados por lei a compartilhá-los com as autoridades competentes.

---

## 1. Aceitação dos Termos

Ao acessar e utilizar o TNT Ofertas, você concorda com os presentes Termos e Condições de Uso, com nossa Política de Privacidade, Código de Conduta e todas as leis aplicáveis. **Caso não concorde com todos os termos, você deve interromper o uso imediatamente.**

## 2. Definição de Usuários

O termo "Usuário" refere-se a qualquer pessoa que navega ou interage com o TNT Ofertas, seja como visitante ou como membro cadastrado. Os serviços estão disponíveis para detentores de plena capacidade. Caso o usuário não seja legalmente capaz, o acesso deve ser realizado com supervisão de um responsável legal.

## 3. Conteúdo do Portal

O TNT Ofertas publica ofertas, descontos e cupons provenientes de lojas e plataformas parceiras, por meio de programas de afiliados. O conteúdo:

- É uma representação da oferta do lojista parceiro no momento da publicação
- Não viola direitos de terceiros, incluindo propriedade intelectual
- Não contém informações fraudulentas, falsas, abusivas, ofensivas ou ilegais

O TNT Ofertas se reserva o direito de remover ou editar qualquer conteúdo que considere inadequado.

## 4. Responsabilidade pelas Ofertas e Compras

⚠️ **IMPORTANTE**: O TNT Ofertas **não vende/comercializa diretamente** produtos ou serviços e **não garante** a exatidão, validade ou disponibilidade das ofertas publicadas.

- O Usuário é responsável por verificar condições, preço, prazo de entrega e disponibilidade diretamente com o lojista
- O TNT Ofertas não assegura que qualquer promoção postada esteja ativa quando da sua utilização
- O TNT Ofertas não é responsável pelo cumprimento da oferta e/ou pela qualidade do produto ou serviço
- Todo problema decorrente da compra deverá ser resolvido diretamente com a instituição responsável (o lojista)

## 5. Uso Indevido

O TNT Ofertas poderá suspender ou cancelar o acesso de qualquer Usuário que faça uso inadequado da plataforma, incluindo:

- Distribuição de spam ou conteúdo comercial não solicitado
- Publicação de conteúdo enganoso ou ilegal
- Violação dos direitos de outros Usuários ou terceiros

## 6. Modificação dos Termos

O TNT Ofertas poderá modificar estes Termos a qualquer momento. As alterações serão comunicadas através do Site, e o uso continuado será considerado como aceitação.

## 7. Limitação de Responsabilidade

- O TNT Ofertas não se responsabiliza por danos decorrentes do uso ou incapacidade de uso do portal
- Qualquer compra realizada de um terceiro cria uma relação jurídica diretamente entre o parceiro e o Usuário
- O TNT Ofertas não participará, nem responderá por qualquer reclamação decorrente da relação com o parceiro
- A responsabilidade pelos produtos e serviços (preço, qualidade, prazo, frete) é **única e exclusiva** da instituição responsável

## 8. Propriedade Intelectual

Todo o conteúdo disponível no TNT Ofertas, incluindo logotipos, textos, gráficos, e outros materiais, é de propriedade exclusiva do TNT Ofertas. O uso não autorizado é estritamente proibido.

## 9. Links para Sites de Terceiros e Afiliação

- O TNT Ofertas é um portal de afiliados e contém links para sites de terceiros
- O TNT Ofertas poderá receber uma comissão pela venda de produtos através desses links
- O TNT Ofertas não se responsabiliza pelo conteúdo, produtos ou serviços oferecidos nesses sites
- O Usuário acessará esses links por sua conta e risco

## 10. Foro e Legislação Aplicável

Os presentes Termos serão interpretados de acordo com as leis da República Federativa do Brasil e a competência para o conhecimento, processamento ou julgamento de qualquer feito judicial será o foro da comarca de Belo Horizonte/MG.

---

*Última atualização: ${new Date().toLocaleDateString('pt-BR')}*
  `;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Card className="p-6 md:p-8">
          <MarkdownContent content={content} />
        </Card>
      </div>
    </div>
  );
};

export default Terms;
