import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarkdownContent } from "@/components/MarkdownContent";

const Conduct = () => {
  const navigate = useNavigate();

  const content = `
# CÓDIGO DE CONDUTA

Esperamos que todos os usuários e visitantes do TNT Ofertas respeitem nossas regras. Ao utilizar, interagir (incluindo comentários, cadastro ou envio de mensagens) com o nosso portal, você concorda em seguir o presente Código de Conduta.

O TNT Ofertas preza por um **ambiente respeitoso e inclusivo**. Este código se aplica a todos os usuários, independentemente de idade, religião, etnia, orientação sexual ou sexo.

⚠️ Para a proteção de todos, **imagens de crianças ou menores serão excluídas**, caso sejam postadas em qualquer área do TNT Ofertas.

**Atenção**: Mensagens Privadas são privadas e só poderão ser postadas ou divulgadas com o consentimento expresso de quem as enviou.

## Declaração de Responsabilidade do Usuário

Você é **completamente responsável** pelo conteúdo que publica (como comentários). Se você mudar de ideia sobre uma postagem, você poderá editá-la ou excluí-la, se a funcionalidade estiver disponível.

---

## I. Nomes de Usuário e Avatares

Atrás de cada nome de usuário existe uma pessoa real; **respeite-a** independente de qualquer coisa.

### Proibição de Ofensa
É expressamente proibido o uso de nomes de usuário ou avatares que sejam ofensivos, difamatórios, ilegais ou inadequados. Se o seu Nome de Usuário ou Avatar for ofensivo, sua conta poderá ser **banida sem aviso prévio**.

### Falsidade Ideológica
Usuários que se passarem por outro membro, por administradores ou por figuras públicas, de forma a enganar a comunidade, serão **banidos permanentemente sem aviso prévio**.

### Privacidade
Nunca envie informações pessoais de terceiros (incluindo e-mails, endereços, números de telefone) sem o consentimento expresso dos mesmos.

### Múltiplas Contas
Membros que criarem usuários múltiplos para fins de burla ou uso indevido da plataforma serão permanentemente banidos do TNT Ofertas.

---

## II. Interações e Comentários

O usuário poderá interagir com o conteúdo do portal por meio dos espaços de comentários ou outros canais de comunicação disponibilizados pelo TNT Ofertas.

**Bloqueio e Denúncia**: O usuário terá a possibilidade de bloquear e denunciar outros usuários. Ao denunciar, o usuário notifica o sistema de que o comportamento é inadequado ou viola as diretrizes, e os administradores tomarão as medidas cabíveis.

---

## III. Spam e Autopromoção

O TNT Ofertas **não tolerará Spam**. Qualquer publicação considerada Spam será removida imediatamente e o spammer será punido.

### Conteúdo Inválido
Mensagens vazias, sem nexo ou repetição excessiva será considerado Spam.

### Conteúdo Ilegal/Impróprio
Pornografia, imagens apelativas, conteúdo que ensine a burlar sistemas ou que seja ilegal serão considerados Spam.

### Proibição de Autopromoção
Autopromoção de negócios, redes de afiliados não parceiras, assessoria de imprensa, agências de marketing, SEO, links para sites pessoais, links de terceiros, e divulgação para ganho pessoal são considerados **Spam**.

### Comportamento Ofensivo
Ser ofensivo ou qualquer outro tipo de conduta desleal será considerado Spam e pode levar ao Banimento.

---

## IV. Conduta "Troll"

"Troll" é o comportamento de usuários que, sem razão construtiva, atrapalham discussões enviando conteúdo sem sentido ou lógica, ou que tentam enganar outros usuários. Esse tipo de conduta será **punido pela Administração**.

---

## V. Racismo, Religião e Sexualidade

⛔ Atacar a Raça, Fé, Religiosidade, Sexualidade ou ser ofensivo **não será tolerado**, e o membro será excluído do TNT Ofertas.

### Respeito Universal
Todas as pessoas devem ser respeitadas, independentemente de sua raça, suas crenças e orientação.

### Discussões Respeitosas
Todas as discussões e comentários devem ser construtivas e respeitosas. Não devemos insultar ninguém.

---

## VI. Administração e Moderação

Todas as regras acima serão fielmente seguidas pela nossa equipe de Administração. Nossos Administradores estão aqui para ajudar o TNT Ofertas a manter um ambiente funcional e respeitoso.

Sempre que algo o incomodar, entre em contato conosco por meio do canal de suporte.

---

## VII. Infrações, Suspensões e Bans

Nossos administradores irão monitorar o ambiente para evitar todo tipo de infração.

### Acúmulo de Pontos
Inicialmente, iremos avisar o membro sobre a infração. Depois, cada vez que o membro infringir alguma regra, receberá pontos de infração.

### Vigência
Todas as infrações estão ativas por **30 dias**. Se você receber novos pontos antes dos anteriores expirarem, eles se acumularão.

### Banimento
Se você infringir regras que dão Ban direto (como Racismo, Spam agressivo, Falsidade Ideológica), você será avisado por e-mail e banido logo em seguida.

### Recurso
Se você não concordar com a infração, entre em contato através do canal de suporte.

### Tabela de Pontos de Infração

| Pontos | Consequência |
|--------|--------------|
| 2 pontos | 1 dia de suspensão |
| 4 pontos | 3 dias de suspensão |
| 6 pontos | 5 dias de suspensão |
| 8 pontos | 14 dias de suspensão |
| 10 pontos | 1 mês de suspensão |
| 12 pontos | Banimento ou suspensão maior que 30 dias |

---

**O Código de Conduta do TNT Ofertas pode ser alterado ou atualizado a qualquer momento.** Ao continuar usando o TNT Ofertas, você concorda com nossas políticas e código de conduta.

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

export default Conduct;
