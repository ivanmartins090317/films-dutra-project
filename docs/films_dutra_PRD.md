# Films Dutra Audiovisual Co.
## Product Requirements Document — Dashboard de Gestão de Alunos de Surf

| Campo           | Valor                                                      |
|-----------------|------------------------------------------------------------|
| **Produto**     | Dashboard Gestão de Alunos                                 |
| **Cliente**     | Films Dutra Audiovisual Co.                                |
| **Stack Front** | Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui         |
| **Stack Back**  | Supabase (PostgreSQL · Auth · Storage · Realtime)          |
| **Versão**      | v1.0 — PRD inicial (briefing aprovado)                     |
| **Status**      | ✅ Briefing aprovado · 🔄 Em desenvolvimento               |

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Usuários e Perfis de Acesso](#2-usuários-e-perfis-de-acesso)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Design System — Identidade Visual](#4-design-system--identidade-visual)
5. [Modelagem do Banco de Dados](#5-modelagem-do-banco-de-dados-supabase--postgresql)
6. [Funcionalidades Detalhadas](#6-funcionalidades-detalhadas)
7. [Estrutura de Rotas](#7-estrutura-de-rotas--nextjs-app-router)
8. [Componentes shadcn/ui](#8-componentes-shadcnui-a-utilizar)
9. [Privacidade, Segurança e LGPD](#9-privacidade-segurança-e-lgpd)
10. [Escopo MVP vs. Versões Futuras](#10-escopo--mvp-vs-versões-futuras)
11. [Estrutura de Pastas](#11-estrutura-de-pastas-sugerida--nextjs)
12. [Próximos Passos](#12-próximos-passos)

---

## 1. Visão Geral

A Films Dutra Audiovisual Co. é uma escola de surf que oferece aulas individuais personalizadas. O objetivo deste projeto é substituir o gerenciamento manual por uma plataforma web moderna, com painel administrativo completo para o professor/dono e área pessoal restrita para cada aluno.

O sistema deve ser responsivo, suportar **tema claro e escuro** (toggle visível em todas as telas) e refletir a identidade visual da marca — estilo vintage, cores terrosas e tipografia com personalidade.

### 1.1 Problema

Atualmente não existe um sistema centralizado. Dados de alunos ficam dispersos (papel, WhatsApp, planilhas), dificultando o acompanhamento pedagógico, financeiro e a comunicação com os alunos.

### 1.2 Solução

Uma plataforma web com dois perfis de acesso: **Administrador (professor)** e **Aluno**. O fluxo começa com um formulário de onboarding enviado ao aluno e evolui para um dashboard completo com agenda, evolução, financeiro, surf trips e notificações.

---

## 2. Usuários e Perfis de Acesso

| Perfil    | Quem é                      | Nível de acesso                                      |
|-----------|-----------------------------|------------------------------------------------------|
| **Admin** | Professor / dono da escola  | Total — todos os módulos e todos os alunos           |
| **Aluno** | Aluno matriculado           | Restrito — apenas próprio perfil, agenda e evolução  |

---

## 3. Stack Tecnológica

### 3.1 Front-end

| Tecnologia      | Versão / Config    | Finalidade                                         |
|-----------------|--------------------|----------------------------------------------------|
| Next.js         | 14 (App Router)    | Framework React com SSR/SSG e roteamento           |
| TypeScript      | 5.x strict mode    | Tipagem estática em todo o projeto                 |
| Tailwind CSS    | 3.x                | Utility-first styling, suporte nativo a dark mode  |
| shadcn/ui       | Latest             | Componentes acessíveis e customizáveis             |
| next-themes     | Latest             | Toggle light/dark com persistência em localStorage |
| Lucide React    | Latest             | Ícones consistentes e leves                        |
| React Hook Form | Latest             | Gerenciamento de formulários performático          |
| Zod             | Latest             | Validação de schema no front e back                |
| date-fns        | Latest             | Manipulação e formatação de datas                  |
| Recharts        | Latest             | Gráficos de evolução e financeiro                  |

### 3.2 Back-end — Supabase

| Serviço Supabase   | Uso no projeto                                                    |
|--------------------|-------------------------------------------------------------------|
| PostgreSQL         | Banco de dados principal — perfis, aulas, financeiro, anotações  |
| Supabase Auth      | Autenticação com e-mail/senha e magic link; RLS por perfil       |
| Row Level Security | Alunos só acessam próprios dados; Admin acessa tudo              |
| Supabase Storage   | Upload de fotos/vídeos de evolução e documentos                  |
| Supabase Realtime  | Notificações em tempo real (futuro)                              |
| Edge Functions     | Envio de e-mails / webhooks WhatsApp (futuro)                    |

### 3.3 Infraestrutura & Deploy

- **Deploy:** Vercel (integração nativa com Next.js)
- **Variáveis de ambiente:** `.env.local` + Vercel Environment Variables
- **CI/CD:** GitHub Actions ou Vercel automatic deploys
- **Domínio:** a definir pelo cliente

---

## 4. Design System — Identidade Visual

A paleta é derivada diretamente dos arquivos de logo fornecidos (Ativo_17 a Ativo_24). Todas as variáveis devem ser configuradas em `tailwind.config.ts` e em `globals.css` com CSS Custom Properties para suporte ao tema escuro.

### 4.1 Paleta de Cores

| Token      | HEX       | Nome         | Uso principal                                  |
|------------|-----------|--------------|------------------------------------------------|
| `sage`     | `#7A8C6E` | Verde musgo  | Cor primária — CTAs, headings, destaques       |
| `slate`    | `#7B9BAD` | Azul ardósia | Cor secundária — hover, badges, links          |
| `terra`    | `#A0522D` | Terracota    | Cor de acento — alertas, tags especiais        |
| `tan`      | `#C8A882` | Bege dourado | Cor de suporte — backgrounds sutis             |
| `cream`    | `#F0E8DE` | Creme        | Background tema claro                          |
| `charcoal` | `#555555` | Cinza escuro | Texto secundário, bordas                       |
| `black`    | `#1A1A1A` | Preto        | Texto principal, tipografia                    |
| `white`    | `#FFFFFF` | Branco       | Superfícies claras, cards no light mode        |

### 4.2 Tokens CSS — Tema Claro vs. Escuro

```css
/* globals.css */
:root {
  --background:          #F0E8DE; /* cream */
  --foreground:          #1A1A1A; /* black */
  --card:                #FFFFFF;
  --card-foreground:     #1A1A1A;
  --primary:             #7A8C6E; /* sage */
  --primary-foreground:  #FFFFFF;
  --secondary:           #7B9BAD; /* slate */
  --secondary-foreground:#FFFFFF;
  --accent:              #A0522D; /* terra */
  --accent-foreground:   #FFFFFF;
  --muted:               #C8A882; /* tan */
  --muted-foreground:    #555555;
  --border:              #C8A882;
  --ring:                #7A8C6E;
}

.dark {
  --background:          #1A1A1A;
  --foreground:          #F0E8DE;
  --card:                #2A2A2A;
  --card-foreground:     #F0E8DE;
  --primary:             #7A8C6E;
  --primary-foreground:  #FFFFFF;
  --secondary:           #7B9BAD;
  --secondary-foreground:#FFFFFF;
  --accent:              #C8A882; /* tan no dark — mais suave */
  --accent-foreground:   #1A1A1A;
  --muted:               #555555;
  --muted-foreground:    #C8A882;
  --border:              #555555;
  --ring:                #7A8C6E;
}
```

### 4.3 tailwind.config.ts — Extensão de Cores

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage:     { DEFAULT: "#7A8C6E", light: "#E8EDE4" },
        slate:    { DEFAULT: "#7B9BAD", light: "#E4EBF0" },
        terra:    { DEFAULT: "#A0522D", light: "#F2E5DC" },
        tan:      "#C8A882",
        cream:    "#F0E8DE",
        charcoal: "#555555",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 4.4 Toggle de Tema

Implementar com `next-themes`. O toggle deve aparecer no **Header/Navbar** de todas as telas (admin e aluno). Usar ícones `Sun` / `Moon` do Phosphor Icons. Estado persistido em `localStorage`.

```tsx
// components/shared/ThemeToggle.tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### 4.5 Tipografia

| Elemento       | Font Family                       | Peso / Tamanho   |
|----------------|-----------------------------------|------------------|
| Display / Logo | Playfair Display (serif cursiva)  | 700 / 3xl–4xl    |
| Headings H1–H3 | Inter ou DM Sans                  | 600–700 / xl–3xl |
| Body           | Inter ou DM Sans                  | 400 / sm–base    |
| Labels / UI    | Inter ou DM Sans                  | 500 / xs–sm      |
| Código / IDs   | Fira Code                         | 400 / sm         |

---

## 5. Modelagem do Banco de Dados (Supabase / PostgreSQL)

### 5.1 `profiles`

Extensão de `auth.users` via trigger `on_auth_user_created`.

| Coluna               | Tipo               | Descrição                          |
|----------------------|--------------------|------------------------------------|
| `id`                 | `uuid` PK          | FK → `auth.users.id`               |
| `role`               | `enum`             | `'admin'` \| `'student'`           |
| `full_name`          | `text`             | Nome completo                      |
| `birth_year`         | `int4`             | Ano de nascimento                  |
| `birth_date`         | `date` nullable    | Data completa (opcional)           |
| `phone`              | `text`             | WhatsApp / telefone                |
| `address`            | `text`             | Endereço / bairro / cidade         |
| `sexual_orientation` | `text` nullable    | Opcional — comunicação inclusiva   |
| `height_cm`          | `int2` nullable    | Altura em cm                       |
| `weight_kg`          | `numeric` nullable | Peso em kg                         |
| `avatar_url`         | `text`             | URL do Storage                     |
| `created_at`         | `timestamptz`      | Auto                               |
| `updated_at`         | `timestamptz`      | Auto trigger                       |

### 5.2 `student_details`

Dados de saúde, surf e preferências — tabela separada com RLS admin only.

| Coluna              | Tipo            | Descrição                                          |
|---------------------|-----------------|----------------------------------------------------|
| `id`                | `uuid` PK       |                                                    |
| `student_id`        | `uuid` FK       | → `profiles.id`                                    |
| `surfs_already`     | `boolean`       | Já pratica surf?                                   |
| `surf_level`        | `text`          | `'beginner'` \| `'intermediate'` \| `'advanced'`  |
| `surf_time_years`   | `numeric`       | Há quanto tempo pratica                            |
| `other_sports`      | `text[]`        | Array de esportes praticados                       |
| `health_conditions` | `text`          | Doenças / condições                                |
| `surgeries`         | `text`          | Histórico cirúrgico                                |
| `menstrual_cycle`   | `text` nullable | Opcional — alunas                                  |
| `equipment_has`     | `boolean`       | Possui equipamento?                                |
| `equipment_model`   | `text`          | Qual modelo de prancha                             |
| `surf_goal`         | `text`          | Objetivo no surf                                   |
| `preferred_days`    | `text[]`        | `['seg','ter','qua'...]`                           |
| `weekly_frequency`  | `text`          | `'1x'` \| `'2x'` \| `'3x'` \| `'weekend'`        |
| `suggestions`       | `text`          | Sugestões livres                                   |

### 5.3 `lessons`

| Coluna          | Tipo          | Descrição                                                         |
|-----------------|---------------|-------------------------------------------------------------------|
| `id`            | `uuid` PK     |                                                                   |
| `student_id`    | `uuid` FK     | → `profiles.id`                                                   |
| `scheduled_at`  | `timestamptz` | Data e hora da aula                                               |
| `duration_min`  | `int2`        | Duração em minutos (padrão 60)                                    |
| `status`        | `enum`        | `'scheduled'` \| `'completed'` \| `'cancelled'` \| `'missed'`   |
| `cancel_reason` | `text`        | Motivo cancelamento / clima                                       |
| `notes`         | `text`        | Anotação do professor pós-aula                                    |
| `skills_noted`  | `text[]`      | Habilidades desenvolvidas nessa aula                              |
| `created_at`    | `timestamptz` | Auto                                                              |

### 5.4 `evolution_entries`

| Coluna       | Tipo               | Descrição                       |
|--------------|--------------------|---------------------------------|
| `id`         | `uuid` PK          |                                 |
| `student_id` | `uuid` FK          | → `profiles.id`                 |
| `lesson_id`  | `uuid` FK nullable | → `lessons.id`                  |
| `entry_date` | `date`             | Data do registro                |
| `content`    | `text`             | Anotação livre do professor     |
| `skills`     | `text[]`           | Habilidades registradas         |
| `media_urls` | `text[]`           | Fotos/vídeos no Storage         |
| `created_at` | `timestamptz`      | Auto                            |

### 5.5 `financials`

| Coluna       | Tipo            | Descrição                                    |
|--------------|-----------------|----------------------------------------------|
| `id`         | `uuid` PK       |                                              |
| `student_id` | `uuid` FK       | → `profiles.id`                              |
| `type`       | `enum`          | `'monthly'` \| `'package'` \| `'single'`    |
| `amount`     | `numeric`       | Valor em R$                                  |
| `due_date`   | `date`          | Data de vencimento                           |
| `paid_at`    | `date` nullable | Data de pagamento                            |
| `status`     | `enum`          | `'pending'` \| `'paid'` \| `'overdue'`      |
| `notes`      | `text`          | Observações                                  |
| `created_at` | `timestamptz`   | Auto                                         |

### 5.6 `surf_trips`

| Coluna        | Tipo          | Descrição           |
|---------------|---------------|---------------------|
| `id`          | `uuid` PK     |                     |
| `title`       | `text`        | Nome da surf trip   |
| `destination` | `text`        | Destino             |
| `trip_date`   | `date`        | Data da viagem      |
| `description` | `text`        | Detalhes            |
| `spots_total` | `int2`        | Vagas totais        |
| `spots_taken` | `int2`        | Vagas preenchidas   |
| `cover_url`   | `text`        | Imagem de capa      |
| `created_at`  | `timestamptz` | Auto                |

### 5.7 `trip_registrations`

| Coluna       | Tipo          | Descrição                                        |
|--------------|---------------|--------------------------------------------------|
| `id`         | `uuid` PK     |                                                  |
| `trip_id`    | `uuid` FK     | → `surf_trips.id`                                |
| `student_id` | `uuid` FK     | → `profiles.id`                                  |
| `status`     | `enum`        | `'interested'` \| `'confirmed'` \| `'cancelled'`|
| `created_at` | `timestamptz` | Auto                                             |

---

## 6. Funcionalidades Detalhadas

### 6.1 Autenticação

**Admin**
- Login via e-mail + senha
- Sessão persistida com Supabase Auth
- Senha resetável via magic link por e-mail

**Aluno**
- Primeiro acesso via link único enviado pelo professor (magic link)
- Pode definir senha após primeiro login
- RLS garante que cada aluno só enxerga seus próprios dados

---

### 6.2 Formulário de Onboarding do Aluno

Fluxo em **5 etapas** (multi-step form) com barra de progresso visível. Enviado via link pelo professor, preenchido pelo próprio aluno. Dados salvos diretamente no Supabase.

#### Etapa 1 — Dados Pessoais
- Nome completo `*`
- Data de nascimento (ou somente o ano) `*`
- Endereço / bairro / cidade `*`
- Telefone / WhatsApp `*`
- E-mail `*`
- Altura (cm)
- Peso (kg)
- Orientação sexual *(opcional — com tooltip explicativo)*

#### Etapa 2 — Surf e Esporte
- Já pratica surf? → se sim: nível e tempo de prática
- Pratica outro esporte? → se sim: qual(is)
- Possui equipamento? → se sim: modelo da prancha
- Objetivo no surf (texto livre)

#### Etapa 3 — Saúde
- Possui alguma doença ou condição de saúde?
- Já realizou cirurgias? → se sim: qual e quando
- Ciclo menstrual *(opcional, apenas alunas — com texto de contexto)*

#### Etapa 4 — Disponibilidade
- Melhores dias para aula (checkbox múltiplo: seg a dom)
- Frequência semanal desejada
- Sugestões e observações livres

#### Etapa 5 — Confirmação e Termos
- Resumo dos dados preenchidos
- Aceite da política de privacidade e LGPD `*` (obrigatório)
- Botão de envio

---

### 6.3 Dashboard — Visão do Administrador

#### Home / Painel Principal
- Cards de resumo: total de alunos ativos, aulas hoje, pagamentos pendentes, trips abertas
- Próximas aulas do dia (lista com link para o perfil do aluno)
- Alertas: pagamentos vencidos, aniversariantes do mês
- Atalhos rápidos: `+ Nova Aula` · `+ Novo Aluno` · `+ Nova Trip`

#### Módulo: Alunos
- Lista com busca e filtros (ativo/inativo, frequência, nível)
- Card de aluno com foto, nome, última aula e status de pagamento
- Página de perfil completo com todas as seções
- Edição de qualquer campo diretamente pelo admin
- Botão para gerar e enviar link de formulário de onboarding

#### Módulo: Agenda / Calendário
- Visualização mensal, semanal e diária
- Agendamento de aula: selecionar aluno, data, hora, duração
- Status por aula: agendada, realizada, cancelada, ausência
- Histórico completo de aulas realizadas por aluno
- Anotação pós-aula diretamente no calendário

#### Módulo: Evolução
- Timeline por aluno com todas as entradas
- Campo de texto rico para anotação do professor
- Tags de habilidades (dropdown + criação livre)
- Upload de foto/vídeo — Supabase Storage *(v2)*
- Gráfico de progresso por habilidade ao longo do tempo

#### Módulo: Financeiro
- Registro de mensalidade ou pacote por aluno
- Status visual: 🟢 pago · 🟡 pendente · 🔴 vencido
- Histórico de pagamentos por aluno
- Visão consolidada: receita do mês, inadimplência, total recebido
- Gráfico mensal de receita (Recharts)

#### Módulo: Surf Trips
- Calendário anual de trips planejadas
- Criação de trip: título, destino, data, vagas, descrição, imagem de capa
- Lista de interessados e confirmados por trip
- Botão de ação para inscrição / confirmação do aluno
- Controle de vagas disponíveis em tempo real

#### Módulo: Configurações
- Dados da escola (nome, contato, foto)
- Gerenciamento de usuários/alunos (ativar / desativar acesso)
- Toggle de tema claro/escuro global

---

### 6.4 Dashboard — Visão do Aluno

#### Home
- Próximas aulas agendadas
- Resumo de evolução recente
- Notificações e comunicados

#### Meu Perfil
- Visualização de todos os dados cadastrais
- Solicitação de atualização de dados (sem edição direta)

#### Minhas Aulas
- Histórico de aulas realizadas e futuras
- Visualização de anotações do professor

#### Minha Evolução
- Timeline pessoal de evolução
- Habilidades desenvolvidas ao longo do tempo

#### Surf Trips
- Lista de trips abertas com detalhes e vagas disponíveis
- Botão de manifestar interesse / confirmar presença

---

## 7. Estrutura de Rotas — Next.js App Router

| Rota                   | Perfil  | Descrição                           |
|------------------------|---------|-------------------------------------|
| `/`                    | Público | Landing / redirect para login       |
| `/login`               | Público | Formulário de autenticação          |
| `/onboarding/[token]`  | Público | Formulário multi-step do aluno      |
| `/admin`               | Admin   | Dashboard principal                 |
| `/admin/students`      | Admin   | Lista de alunos                     |
| `/admin/students/[id]` | Admin   | Perfil completo do aluno            |
| `/admin/calendar`      | Admin   | Agenda e calendário                 |
| `/admin/evolution`     | Admin   | Histórico de evolução (todos)       |
| `/admin/financial`     | Admin   | Controle financeiro                 |
| `/admin/trips`         | Admin   | Surf trips — gestão                 |
| `/admin/settings`      | Admin   | Configurações da escola             |
| `/student`             | Aluno   | Home do aluno                       |
| `/student/profile`     | Aluno   | Meu perfil                          |
| `/student/lessons`     | Aluno   | Minhas aulas                        |
| `/student/evolution`   | Aluno   | Minha evolução                      |
| `/student/trips`       | Aluno   | Surf trips disponíveis              |

> Proteção de rotas via **middleware** do Next.js + verificação de `role` no Supabase Auth.

---

## 8. Componentes shadcn/ui a utilizar

| Componente       | Uso no projeto                                      |
|------------------|-----------------------------------------------------|
| `Button`         | CTAs, ações, toggle de tema                         |
| `Card`           | Cards de aluno, resumo, financeiro                  |
| `Table`          | Listagens de alunos, pagamentos, trips              |
| `Calendar`       | Agenda de aulas                                     |
| `Dialog`         | Modais de criação e confirmação                     |
| `Form` + `Input` | Formulário de onboarding e edição                   |
| `Select`         | Filtros, frequência, status                         |
| `Checkbox`       | Dias da semana, multi-select                        |
| `Tabs`           | Seções do perfil do aluno                           |
| `Badge`          | Status de pagamento, nível de surf                  |
| `Avatar`         | Foto do aluno                                       |
| `Separator`      | Divisores visuais                                   |
| `Toast`          | Feedback de ações (salvo, erro)                     |
| `Skeleton`       | Loading states                                      |
| `Switch`         | Toggle light/dark mode                              |
| `Tooltip`        | Campos sensíveis com explicação                     |
| `Progress`       | Barra de progresso do formulário multi-step         |
| `Popover`        | Date picker no calendário                           |

---

## 9. Privacidade, Segurança e LGPD

| Dado sensível       | Medida de proteção                                  |
|---------------------|-----------------------------------------------------|
| Orientação sexual   | Campo opcional + tooltip + RLS admin only           |
| Ciclo menstrual     | Campo opcional + contextualização + RLS admin only  |
| Condições de saúde  | Texto livre + RLS admin only                        |
| Histórico cirúrgico | Texto livre + RLS admin only                        |
| Endereço completo   | RLS — aluno vê apenas o próprio                     |
| Dados financeiros   | RLS admin only — aluno não acessa                   |

**Medidas gerais:**
- Todos os dados sensíveis em tabela separada (`student_details`) com RLS restritivo
- Termo de consentimento obrigatório no formulário de onboarding
- Política de privacidade exibida antes do envio
- Supabase Auth com JWT — sessões com expiração configurável
- HTTPS obrigatório em produção (Vercel garante por padrão)
- Sem coleta de dados além do necessário para operação pedagógica
- Conformidade com a **LGPD** (Lei Geral de Proteção de Dados — Lei nº 13.709/2018)

---

## 10. Escopo — MVP vs. Versões Futuras

| Funcionalidade                       | MVP v1 | v2 | v3+ |
|--------------------------------------|--------|----|-----|
| Formulário de onboarding             | ✅     |    |     |
| Cadastro e perfil do aluno           | ✅     |    |     |
| Dashboard admin — home               | ✅     |    |     |
| Agenda / calendário de aulas         | ✅     |    |     |
| Anotações pós-aula                   | ✅     |    |     |
| Histórico de evolução (texto)        | ✅     |    |     |
| Controle financeiro básico           | ✅     |    |     |
| Surf trips — calendário + inscrição  | ✅     |    |     |
| Toggle light/dark mode               | ✅     |    |     |
| Área do aluno (leitura)              | ✅     |    |     |
| Upload foto/vídeo na evolução        |        | ✅ |     |
| Notificações push / WhatsApp         |        | ✅ |     |
| Lembretes automáticos de aula        |        | ✅ |     |
| App mobile (PWA ou React Native)     |        |    | ✅  |
| Relatórios PDF exportáveis           |        |    | ✅  |
| Integração pagamento online          |        |    | ✅  |

---

## 11. Estrutura de Pastas Sugerida — Next.js

```
films-dutra-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (public)/
│   │   └── onboarding/
│   │       └── [token]/
│   │           └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  ← dashboard home
│   │   ├── students/
│   │   │   ├── page.tsx              ← lista de alunos
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← perfil do aluno
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── evolution/
│   │   │   └── page.tsx
│   │   ├── financial/
│   │   │   └── page.tsx
│   │   ├── trips/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── student/
│       ├── layout.tsx
│       ├── page.tsx                  ← home do aluno
│       ├── profile/
│       │   └── page.tsx
│       ├── lessons/
│       │   └── page.tsx
│       ├── evolution/
│       │   └── page.tsx
│       └── trips/
│           └── page.tsx
│
├── components/
│   ├── ui/                           ← gerados pelo shadcn/ui
│   ├── admin/                        ← componentes exclusivos do admin
│   │   ├── StudentCard.tsx
│   │   ├── LessonCalendar.tsx
│   │   ├── FinancialChart.tsx
│   │   └── TripManager.tsx
│   ├── student/                      ← componentes do aluno
│   │   ├── EvolutionTimeline.tsx
│   │   └── TripCard.tsx
│   └── shared/                       ← componentes globais
│       ├── ThemeToggle.tsx
│       ├── Navbar.tsx
│       └── Sidebar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← createBrowserClient
│   │   ├── server.ts                 ← createServerClient
│   │   └── middleware.ts
│   ├── utils.ts
│   └── validations/
│       ├── onboarding.ts             ← schemas Zod
│       ├── lesson.ts
│       └── financial.ts
│
├── types/
│   └── database.ts                   ← tipos gerados: supabase gen types
│
├── hooks/
│   ├── useStudent.ts
│   ├── useLessons.ts
│   └── useFinancial.ts
│
├── public/
│   └── brand/                        ← logos Films Dutra (Ativo_17–24)
│
├── middleware.ts                     ← proteção de rotas por role
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## 12. Próximos Passos

| #  | Tarefa                                            | Responsável   | Status      |
|----|---------------------------------------------------|---------------|-------------|
| 1  | Setup do projeto Next.js + shadcn + Tailwind      | Dev           | ⏳ Pendente |
| 2  | Criar projeto Supabase + tabelas + RLS            | Dev           | ⏳ Pendente |
| 3  | Configurar `tailwind.config.ts` com paleta Dutra  | Dev           | ⏳ Pendente |
| 4  | Implementar layout base + toggle dark/light       | Dev           | ⏳ Pendente |
| 5  | Tela de login + autenticação Supabase             | Dev           | ⏳ Pendente |
| 6  | Formulário de onboarding multi-step               | Dev           | ⏳ Pendente |
| 7  | Dashboard admin — home e módulo alunos            | Dev           | ⏳ Pendente |
| 8  | Módulo calendário de aulas                        | Dev           | ⏳ Pendente |
| 9  | Módulo evolução + anotações                       | Dev           | ⏳ Pendente |
| 10 | Módulo financeiro                                 | Dev           | ⏳ Pendente |
| 11 | Módulo surf trips                                 | Dev           | ⏳ Pendente |
| 12 | Área do aluno (todas as seções)                   | Dev           | ⏳ Pendente |
| 13 | Testes com professor e primeiros alunos           | Dev + Cliente | ⏳ Pendente |
| 14 | Deploy em produção (Vercel)                       | Dev           | ⏳ Pendente |

---

*Films Dutra Audiovisual Co. · Ride your own wave 🌊*
