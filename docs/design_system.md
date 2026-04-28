## Overview

A presença visual da Films Dutra Audiovisual Co. é um painel de gestão com alma de escola de surf: vintage, terroso e com personalidade. A interface abre em um canvas claro areia-creme, com tipografia display em **CohereText** (headlines monumentais) e corpo/UI em **Unica77 Cohere Web**, com superfícies que remetem à areia, ao mar e à natureza costeira. Seções escuras entram em verde musgo profundo ou carvão, enquanto os elementos de destaque usam terracota e bege dourado para criar calor e identidade.

O que torna o sistema distinto é a combinação de uma UI funcional e sóbria — necessária para um dashboard de gestão — com a identidade visual vintage e orgânica da marca. A interface evita decoração genérica; a cor chega por meio de badges de status, chips de categoria, cards de surf trips e bandas escuras de seção. Cards têm cantos levemente arredondados; a hierarquia tipográfica segue estritamente os tokens abaixo (display tight em CohereText, UI medida em Unica77).

**Características-chave:**

- Headline display em **CohereText** com tracking negativo e peso 400 (hero e product scale).
- Canvas creme interrompido por bandas verde musgo e carvão em seções de destaque.
- Cards arredondados em 8px a 16px, superfícies quentes em bege e branco.
- CTAs pill em verde musgo ou terracota, ações secundárias como links sublinhados.
- Badges de status com semântica visual clara: verde pago, amarelo pendente, vermelho vencido.
- Painéis de dados do aluno usando superfícies escuras, chips de nível e badges de habilidade.
- Módulos de agenda, evolução e financeiro com separadores finos, listas e campos de busca.

## Colors

### Brand & Accent

- **Sage / Verde Musgo** (`#7A8C6E`): Cor primária — CTAs, headings, botões de ação principal e elementos de destaque.
- **Slate / Azul Ardósia** (`#7B9BAD`): Cor secundária — hover, badges, links e ênfase de ação secundária.
- **Terra / Terracota** (`#A0522D`): Cor de acento — alertas, tags especiais, chips de categoria e marcadores quentes.
- **Tan / Bege Dourado** (`#C8A882`): Cor de suporte — backgrounds sutis, bordas, muted states e detalhes de navegação.

### Surface & Background

- **Cream / Creme** (`#F0E8DE`): Background principal do tema claro — dominante em todas as páginas.
- **White / Branco** (`#FFFFFF`): Superfícies de cards e formulários no tema claro.
- **Sage Light** (`#E8EDE4`): Cards de produto e blocos de suporte em fundo verde suave.
- **Slate Light** (`#E4EBF0`): Superfície CTA em fundo azul suave para seções informativas.
- **Terra Light** (`#F2E5DC`): Background quente para chips de acento e notificações leves.
- **Dark Background** (`#1A1A1A`): Background do tema escuro e rodapé.
- **Dark Card** (`#2A2A2A`): Superfície de cards no tema escuro.

### Text & Rules

- **Black / Preto** (`#1A1A1A`): Texto principal e headlines em fundo claro.
- **Charcoal / Cinza Escuro** (`#555555`): Texto secundário, metadados, labels e bordas.
- **Tan Muted** (`#C8A882`): Links do rodapé, datas, metadados e labels desativados.
- **Hairline** (`#C8A882` em 40% opacidade): Regras de lista e divisores de seção.
- **Border** (`#C8A882`): Borda padrão de cards e inputs no tema claro.
- **Dark Border** (`#555555`): Borda padrão no tema escuro.

### Semantic

- **Status Green** (`#7A8C6E`): Pagamento realizado, aula concluída, aluno ativo.
- **Status Yellow / Tan** (`#C8A882`): Pagamento pendente, aula agendada, estado neutro.
- **Status Red / Terra** (`#A0522D`): Pagamento vencido, aula cancelada, alerta crítico.
- **Ring / Focus** (`#7A8C6E`): Anel de foco de teclado e borda de input ativo.
- **Form Focus** (`#7B9BAD`): Borda de foco para campos de texto e selects.

### Gradient System

A Films Dutra não usa gradientes genéricos como preenchimento de UI. Gradientes e campos de cor são conduzidos por mídia: imagens de surf em capa de trip, backgrounds de hero com textura de areia e overlays suaves em cards de foto. Mantenha superfícies de UI planas; reserve riqueza de gradiente para painéis de mídia grandes e bandas de imagem CTA.

## Typography

### Font Family

- **Display (hero / product)**: `CohereText`, fallback `Space Grotesk`, `Inter`, `ui-sans-serif`, `system-ui`.
- **Body / UI**: `Unica77 Cohere Web`, fallback `Inter`, `Arial`, `ui-sans-serif`, `system-ui`.
- **Labels técnicos / mono**: `CohereMono`, fallback `Arial`, `ui-monospace`, `Courier New`, `monospace`.
- **Ícones**: Phosphor Icons (`@phosphor-icons/react`) — pesos regulares/fill; preview estático em `public/design-system-preview.html` via `@phosphor-icons/web` (CDN).

### Tokens (fonte de verdade)

```yaml
typography:
  hero-display:
    fontFamily: CohereText
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.92px
  product-display:
    fontFamily: CohereText
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.44px
  section-display:
    fontFamily: Unica77 Cohere Web
    fontSize: 60px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.2px
  section-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.48px
  card-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.32px
  feature-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0
  body-large:
    fontFamily: Unica77 Cohere Web
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body:
    fontFamily: Unica77 Cohere Web
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: Unica77 Cohere Web
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.71
    letterSpacing: 0
  caption:
    fontFamily: Unica77 Cohere Web
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  mono-label:
    fontFamily: CohereMono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.28px
  micro:
    fontFamily: Unica77 Cohere Web
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
```

### Hierarchy (referência rápida)

| Role             | Font                   | Size | Weight | Line Height | Letter Spacing | Uso típico no dashboard Films Dutra              |
| ---------------- | ---------------------- | ---: | -----: | ----------: | -------------: | ------------------------------------------------- |
| Hero Display     | CohereText             | 96px |    400 |        1.00 |        -1.92px | Landing / hero institucional (uso raro).          |
| Product Display  | CohereText             | 72px |    400 |        1.00 |        -1.44px | Título principal de página e hero de módulo.      |
| Section Display  | Unica77 Cohere Web     | 60px |    400 |        1.00 |         -1.2px | Headings grandes de página.                       |
| Section Heading  | Unica77 Cohere Web     | 48px |    400 |        1.20 |        -0.48px | Títulos de seção e CTAs de bloco.                 |
| Card Heading     | Unica77 Cohere Web     | 32px |    400 |        1.20 |        -0.32px | Títulos de card e listas.                         |
| Feature Heading  | Unica77 Cohere Web     | 24px |    400 |        1.30 |              0 | Cards de funcionalidade, títulos de artigo.      |
| Body Large       | Unica77 Cohere Web     | 18px |    400 |        1.40 |              0 | Lead e parágrafos de destaque.                    |
| Body             | Unica77 Cohere Web     | 16px |    400 |        1.50 |              0 | Cópia padrão e links.                             |
| Button           | Unica77 Cohere Web     | 14px |    500 |        1.71 |              0 | Labels de CTA e navegação compacta.               |
| Caption          | Unica77 Cohere Web     | 14px |    400 |        1.40 |              0 | Metadados e textos auxiliares.                    |
| Mono Label       | CohereMono             | 14px |    400 |        1.40 |         0.28px | IDs, status em caixa alta, marcadores técnicos.   |
| Micro            | Unica77 Cohere Web     | 12px |    400 |        1.40 |              0 | Rodapé, nav microcopy, links pequenos.            |

### Principles

- Use **CohereText** somente em `hero-display` e `product-display`; todo o resto da interface usa **Unica77 Cohere Web** ou **CohereMono** conforme a tabela.
- Mantenha display tight: peso 400 em todos os níveis; hierarquia vem de tamanho, tracking e superfície, não de bold extra.
- Use **mono-label** para categoria, IDs de aluno e marcadores de sistema (caixa alta quando fizer sentido semântico).
- Páginas de dashboard podem usar chips de terracota e links em slate; a tipografia base permanece Unica77 em tons escuros da paleta.
- Em implementação web sem arquivos proprietários, use os fallbacks documentados acima até os arquivos oficiais estarem licenciados e servidos.


## Layout

### Spacing System

O sistema usa base 8px com valores comuns de alinhamento: `2px`, `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `28px`, `32px`, `40px`, `48px`, `56px`, `64px`, `80px` e `96px`.

Seções de dashboard usam respiração vertical generosa. A home do admin posiciona cards de resumo abaixo de um header espaçado. Módulos de lista alternam bandas de filtro, listas com regras e rodapés de paginação apenas quando necessário.

### Grid & Container

- Nav lateral usa layout de sidebar com logo acima, links de módulo centralizados e avatar/toggle na base.
- Header de página usa layout de três zonas: título à esquerda, busca/filtros ao centro, ações primárias à direita.
- Dashboard home usa grid de 4 cards de resumo em desktop, com lista de próximas aulas abaixo.
- Módulos de alunos e trips usam grid de 3 colunas em desktop.
- Perfil de aluno usa tabs com seções de conteúdo em coluna única.
- Formulário de onboarding usa cards centrados em coluna única com barra de progresso no topo.

### Whitespace Philosophy

A Films Dutra usa espaço em branco como sinal de clareza pedagógica. Grandes intervalos separam o cabeçalho da seção, a lista de resultados e o rodapé. Conteúdo denso aparece apenas onde serve à arquitetura de informação: linhas de tabela de alunos, grades de cards de trips e campos de formulário.

## Elevation & Depth

A Films Dutra é predominantemente plana. Profundidade vem de alternância de superfícies, contraste de mídia, cantos arredondados e bordas finas em vez de sombras pesadas.

| Level              | Treatment                                              | Use                                                      |
| ------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| Flat               | Sem sombra, campo claro ou escuro                      | Títulos hero, listas de alunos, superfícies editoriais   |
| Bordered           | 1px `#C8A882` ou regras escuras translúcidas           | Linhas de tabela, formulários, cards pálidos             |
| Card Lifted (neo)  | Sombras duplas `--neo-raised` / `--neo-raised-lg` em superfície `--neo-surface` | Cards de aluno, trip, resumo, swatches, formulário, tabela evolução (preview HTML) |
| Dark Feature Band  | Banda full-width verde musgo ou carvão                 | Seções de hero escuro, rodapé, bandas de módulo          |

### Neumorphism (Soft UI) — variante opcional

Inspirado no padrão **neumorphism** (superfície única + sombras duplas “extruded / inset”), refinado via **MCP 21st.dev** (`21st_magic_component_builder`) e adaptado à paleta Films Dutra (`cream` `#F0E8DE`, sombras derivadas de tan/carvão suave, acento **sage** `#7A8C6E`).

| Token / classe (referência) | Efeito | Uso |
| ----------------------------- | ------ | --- |
| Base neo | Fundo igual ao da superfície do card (`cream` ou card branco em contexto claro) | Área do player, painel de destaque, “ilha” de controles |
| **Raised** (card / botão) | `box-shadow`: sombra escura ↘ + sombra clara ↖ | Cartões principais, botões circulares de mídia |
| **Inset** | `box-shadow: inset …` | Trilha de progresso, poços de slider, campos “embutidos” |

**Implementação no repositório:** componente React `components/ui/neumorphism-player.tsx` (client component: play/pause, seek, volume; ícones **Phosphor** — `Play`, `Pause`, `SkipBack`, `SkipForward`, `SpeakerHigh`; capa padrão Unsplash surf). Dependência: `@phosphor-icons/react`. Caminho `@/components/ui` alinhado ao **shadcn/ui** — ao criar o app Next.js, rode `npx shadcn@latest init` e mantenha `components/ui` para componentes compartilhados e CLI do shadcn.

**Setup:** `npm install @phosphor-icons/react` e import `{ NeumorphicMusicPlayer } from "@/components/ui/neumorphism-player"`. Estilos neo usam `style={{ boxShadow: … }}` com tokens hex/rgba da marca para não depender de `tailwind.config` extra até você externalizar para `@layer utilities`.

**Boas práticas:** use neumorphism com moderação (1 bloco por tela ou módulo de mídia); contraste WCAG do texto sobre `cream` deve permanecer com **ink** `#1A1A1A` ou **charcoal** `#555555`; no **tema escuro** o soft UI perde legibilidade — prefira elevação flat/bordered documentada acima ou redefine sombras com base `#2A2A2A` e teste manual.

## Shapes

### Radius Scale

| Token  |  Value | Role                                                                |
| ------ | -----: | ------------------------------------------------------------------- |
| `xs`   |    4px | Imagens pequenas, campos de busca, thumbnails, elementos utilitários|
| `sm`   |    8px | Chips de status, cards pequenos, dialogs, badges                    |
| `md`   |   12px | Cards de aluno, cards de trip, blocos agrupados                     |
| `lg`   |   16px | Cards de mídia de maior destaque e placeholders                     |
| `xl`   |   24px | Formulários e modais de destaque                                    |
| `pill` |   32px | Botões CTA primários e pills de filtro                              |
| `full` | 9999px | Avatares, indicadores de status e controles totalmente pill         |

### Image Treatment

Imagens não são fundos decorativos para texto, exceto em bandas CTA. A maioria das imagens fica como cards arredondados com bordas visíveis: fotos de surf trip, fotos de perfil de aluno, thumbnails de evolução e covers de trip. Os raios dominantes são 8px e 16px.

## Components

### **`button-primary`**

CTA pill em verde musgo (`#7A8C6E`) com texto branco. Usa token **button** (Unica77 14px / 500), padding 12px 24px e raio pill de 32px. Estilo de ação primária para "Salvar", "Criar Aula", "Confirmar" e CTAs principais.

### **`button-secondary`**

CTA pill em terracota (`#A0522D`) com texto branco. Alternativa quente para ações de destaque como "Nova Trip", "Enviar Formulário" e confirmações de status.

### **`button-ghost`**

Ação só de texto, normalmente sublinhada ou alinhada a uma régua, sem background preenchido. Usado para "Ver Perfil Completo", "Cancelar", ações secundárias de hero e links de rodapé.

### **`button-pill-outline`**

Pill com preenchimento transparente, borda 1px verde musgo ou terracota, raio 32px. Usado para filtros de módulo, tags de habilidade e controles leves de taxonomia.

### **`neumorphism-player`**

Player de mídia em **soft UI** (sombras duplas, trilha inset, botões circulares em relevo) sobre fundo **cream**, acento **sage**. Implementação: `components/ui/neumorphism-player.tsx` — props opcionais `track` (título, artista, duração em segundos, `coverUrl`), `autoPlay`, `className`. Ícones **Phosphor** (`Play`, `Pause`, `SkipBack`, `SkipForward`, `SpeakerHigh`). Capa padrão: imagem Unsplash de surf.

### **`announcement-bar`**

Faixa full-width em carvão acima do nav, 36px de altura, microcopy centrado com link sublinhado e controle de fechar à direita.

### **`student-card`**

Card de aluno com avatar circular, nome, data da última aula e badge de status de pagamento. Raio 12px, superfície branca no light e `#2A2A2A` no dark, com borda tan sutil. Usado em listas do módulo Alunos.

### **`summary-card`**

Card de dashboard com ícone Phosphor, número grande em **product-display** ou **section-display** (CohereText / Unica77 conforme hierarquia da tela), label em **caption** (14px) e indicador de tendência. Quatro por linha em desktop. Superfície branca com borda `#C8A882`.

### **`agent-console-card` / `lesson-panel`**

Painel de aula escuro mostrando nome do aluno, horário, status chip, nível de surf e campo de anotação. Background carvão, texto branco ou muted, chips de acento com cores de status.

### **`trust-logo-strip`**

Equivalente ao strip de conquistas/stats: alinhamento horizontal de métricas-chave (alunos ativos, aulas realizadas, trips). Intencionalmente simples: sem cards, sem bordas, apenas espaçamento e tipografia **section-heading** ou **card-heading** conforme ênfase.

### **`capability-card`**

Bloco de conteúdo com ícone Phosphor de linha fina, heading em **feature-heading** (24px), texto em **body** e link de texto. Em fundos claros, cards têm apenas bordas top ou uma relação sutil imagem/card.

### **`dark-feature-band`**

Seção full-width verde musgo (`#7A8C6E` escuro) ou carvão para capacidades de módulo, claims de segurança e resumos de funcionalidade. Texto vira branco; cards usam superfícies translúcidas mais escuras e bordas pálidas.

### **`trip-card`**

Card de surf trip com imagem de capa (raio 12px), título em **card-heading** ou **feature-heading**, destino e data em **caption** / **body**, vagas e botão com token **button**. Grade de 3 colunas em desktop.

### **`status-chip`**

Chip grande de status de pagamento ou aula na listagem. Chip ativo inverte para verde/terracota fill com texto escuro; chips inativos usam outline tan e fill pálido. Tipografia em **button** ou **caption** conforme densidade, mantendo o status legível em touch.

### **`evolution-table`**

Lista de entradas de evolução separada por réguas, com data à esquerda, conteúdo central e chips de habilidade à direita. Linhas altas, brancas e conduzidas por bordas; filtros acima usam pills outlined compactos.

### **`contact-form-card`**

Painel de formulário arredondado (raio 16px-24px) branco sobre seções verde musgo ou creme. Inputs retangulares com bordas tan finas, padding 12px-16px e labels/placeholders compactos. Submit usa o mesmo estilo pill verde musgo dos CTAs primários.

### **`footer-newsletter`**

Rodapé escuro com marca em **card-heading** ou **feature-heading** (Unica77), headline em **section-heading** quando aplicável, microcopy legal em **micro** / **caption**, campo de e-mail de linha única e botão de envio em seta. Colunas do rodapé usam labels brancos de seção e links muted.

## Do's and Don'ts

### Do

- Use canvas creme como superfície padrão; introduza verde musgo ou carvão como bandas full-width de módulo.
- Mantenha CTAs primários em pill verde musgo em superfícies claras.
- Use raio 16px em cards de mídia maiores e placeholders.
- Use terracota para taxonomia editorial e pequenos acentos quentes, não como sistema principal de CTA.
- Reserve **CohereText** apenas para `hero-display` e `product-display`; use **Unica77 Cohere Web** para todo o restante da UI.
- Permita que fotos de surf trips e avatares de alunos carreguem a cor, enquanto a shell de UI permanece contida.
- Use semântica de cores consistente: verde = sucesso/pago, tan/amarelo = pendente, terracota = erro/vencido.

### Don't

- Não transforme terracota ou slate em cores decorativas de superfície ampla.
- Não adicione sombras pesadas em cards.
- Não torne cada seção baseada em cards; módulos de lista frequentemente usam linhas sem moldura, réguas e espaço aberto.
- Não use cards arredondados abaixo de 8px para mídia principal.
- Não substitua o split CohereText / Unica77 por uma única família genérica; os tokens acima são a fonte de verdade.
- Não renderize variantes de interação não documentadas em documentação ou previews.
- Não use gradientes saturados como backgrounds normais de UI; mantenha gradientes conduzidos por mídia.

## Responsive Behavior

### Breakpoints

| Name          |       Width | Key Changes                                                              |
| ------------- | ----------: | ------------------------------------------------------------------------ |
| Small Mobile  |      <425px | Coluna única, nav compacta, escala de headline reduzida                  |
| Mobile        |   425-640px | Mídia de hero empilhada, grades de card viram uma coluna, linhas de form empilhadas |
| Large Mobile  |   640-768px | Layouts de coluna única mais largos com cards de mídia maiores           |
| Tablet        |  768-1024px | Cards de 2 colunas começam, sidebar colapsa para icons-only             |
| Desktop       | 1024-1440px | Sidebar completa, grades de 3 colunas, composições de hero divididas    |
| Large Desktop | 1440-2560px | Containers largos e grandes intervalos verticais vazios                  |

### Touch Targets

CTAs primários e pills atendem ao tamanho de toque confortável com padding de 12px-24px e raios pill. Chips de filtro e chips de status de aluno são maiores que tags padrão, tornando superfícies densas de taxonomia utilizáveis em dispositivos touch.

### Collapsing Strategy

- Nav sidebar colapsa de links horizontais completos para icons-only em tablet e menu móvel hambúrguer em mobile.
- Mídia de hero move de cards divididos para cards empilhados.
- Grades de aluno e trip colapsam de 3 colunas para 2 e depois 1.
- Campos de formulário colapsam de linhas pareadas para coluna única.
- Linhas de tabela preservam a estrutura separada por réguas, mas empilham metadados abaixo dos títulos em larguras menores.

## Iteration Guide

1. Comece de um canvas creme ou de uma banda full-width verde musgo/carvão; evite backgrounds de página em tom médio, a menos que a tela mostre uma seção específica de CTA/formulário.
2. Use `button-primary` para a única ação de mais alta prioridade e `button-ghost` para a ação complementar.
3. Use `trip-card` ou `lesson-panel` quando uma página precisar de energia visual; evite dados de dashboard inventados.
4. Para páginas de listagem, combine `status-chip`, `button-pill-outline` e `evolution-table` em vez de cards de marketing genéricos.
5. Mantenha os exemplos de componentes estruturalmente honestos: frames de produto placeholder são melhores do que conteúdo de produto inventado.

## Known Gaps

- Arquivos proprietários **CohereText**, **Unica77 Cohere Web** e **CohereMono** não vêm no bundle público; use os fallbacks documentados até licenciar e servir as fontes oficiais.
- Screenshots mobile não foram gerados nesta versão inicial; comportamento mobile é documentado a partir do sistema desktop e padrões responsivos existentes.
- Alguns módulos carregam blocos de conteúdo de forma lazy; placeholders de cards de aluno em branco são documentados como superfícies skeleton placeholder, não como cards preenchidos.
