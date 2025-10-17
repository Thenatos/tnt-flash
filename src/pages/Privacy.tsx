import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarkdownContent } from "@/components/MarkdownContent";

const Privacy = () => {
  const navigate = useNavigate();

  const content = `
# POLÍTICA DE PRIVACIDADE - TNT OFERTAS

A Política de Privacidade do TNT Ofertas foi criada para reafirmar o nosso compromisso com a segurança, privacidade e a transparência no tratamento das suas informações.

Através dela, vamos descrever quais dados pessoais coletamos, como eles são tratados, armazenados e compartilhados, quais são os seus direitos em relação a eles e outras informações. Por isso, recomendamos que leia atentamente este documento.

## O que é Tratamento de Dados Pessoais?

Segundo a Lei nº 13.709 ou Lei Geral de Proteção de Dados (LGPD), tratamento de dados é toda operação realizada com dados pessoais, como as que se referem a coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.

## A quem se aplica a Política de Privacidade?

Esta Política de Privacidade se aplica a todas as pessoas que acessarem e/ou se cadastrarem em nossa plataforma pelo site www.tntofertas.com.br, ou que de qualquer outra forma utilizarem os produtos e serviços do TNT Ofertas.

As práticas descritas nesta Política de Privacidade só se aplicam ao tratamento dos seus dados pessoais no Brasil e estão sujeitas às leis locais aplicáveis, com destaque para a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais, ou "LGPD").

## Quais dados pessoais nós coletamos?

Ao acessar o TNT Ofertas ou criar uma conta nele, você nos fornece, e nós coletamos automaticamente, alguns dados pessoais relacionados a você. Desse modo, para uma melhor experiência, buscamos entender melhor suas preferências, para que possamos sugerir materiais e produtos afiliados.

### Dados Pessoais Informados pelo Titular

- Dados cadastrais: nome, sobrenome, nome de usuário, e-mail e senha
- Dados de contato: e-mail e telefone (quando aplicável)
- Dados de redes sociais: e-mail de cadastro, nome, sobrenome e ID da conta (Gmail, Facebook ou Apple)
- Dados de pesquisa e interesses

### Dados de Navegação e do Dispositivo

- Cookies
- Atributos do dispositivo: ID do dispositivo, ID de publicidade, modelo, sistema operacional, navegador, localização geográfica aproximada e idioma
- Dados comportamentais: páginas visualizadas, tempo no site, cliques em ofertas, interações com o TNT Ofertas e histórico de buscas

### Dados Pessoais que Coletamos de Terceiros

- Dados transacionais de pedidos (para fins de comissionamento e validação de tráfego)
- Dados de atendimento e suporte
- Dados sobre clicks em promoções para sites externos de lojistas (links de afiliação)

### Dados Públicos

- Informações disponíveis publicamente ou tornadas públicas por você
- Menções ou interações com o TNT Ofertas em redes sociais

## Por que coletamos os seus dados pessoais e como utilizamos eles?

Nós utilizamos os seus dados pessoais para prover, manter, melhorar e personalizar nossos produtos e serviços:

- **Cumprimento de Contrato**: Para inscrição e login em nossa plataforma
- **Interesse Legítimo**: Envio de notícias, informações sobre novidades e campanhas
- **Cumprimento Legal**: Prevenir fraudes e melhorar a segurança
- **Consentimento**: Geração de estatísticas e estudos (analytics)
- **Melhorias**: Personalização e criação de novos produtos

## Por quanto tempo manteremos seus dados pessoais salvos?

Os dados são armazenados em serviços de nuvem confiáveis durante o período necessário para as finalidades apresentadas. Mesmo após a exclusão da conta, poderemos armazenar os seus dados pessoais anonimamente, por períodos adicionais de tempo, para o exercício regular de direitos do TNT Ofertas.

## Com quem compartilhamos seus dados pessoais?

**Reforçamos que, em nenhuma circunstância, nós vendemos seus dados pessoais a terceiros.** Entretanto, compartilhamos com:

- **Parceiros de Tecnologia**: Google Analytics, Google Ads, plataformas de mídia social, plataformas de e-mail marketing
- **Plataformas de Login**: Google, Facebook ou Apple
- **Autoridades Governamentais/Judiciais**: Para cumprir ordens judiciais ou exigências legais

## Como protegemos os seus dados?

O TNT Ofertas adota medidas de segurança, técnicas e administrativas para proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito.

## Como utilizamos cookies e outras tecnologias?

Utilizamos Cookies, Web beacon e Ferramentas de analytics para registrar suas atividades em nosso site.

## Transferência internacional de dados

Seus dados pessoais podem ser transferidos para Estados Unidos ou Europa. Observamos todos os requerimentos estabelecidos pela legislação vigente e adotamos as melhores práticas de segurança.

## Quais são os seus direitos e como exercê-los?

Como titular dos seus dados, você pode:

- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos, inexatos ou desatualizados
- Anonimização, bloqueio ou eliminação de dados desnecessários
- Portabilidade dos dados
- Eliminação dos dados pessoais tratados com o consentimento
- Informação das entidades com as quais realizamos uso compartilhado
- Revogação do consentimento

## Fale Conosco

Caso tenha ficado com alguma dúvida, você pode entrar em contato conosco através dos canais de suporte disponíveis no site.

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

export default Privacy;
