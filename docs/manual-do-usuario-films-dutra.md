# Manual do usuário — Films Dutra Dashboard

**Versão:** 1.0 · **Maio de 2026**  
**Público:** equipe da escola (administradores) e alunos do portal  
**Objetivo:** explicar como usar cada área do sistema e como orientar os alunos no dia a dia.

---

## Sumário

1. [O que é este sistema](#1-o-que-é-este-sistema)
2. [Antes de começar (URLs e papéis)](#2-antes-de-começar-urls-e-papéis)
3. [Login, senha e saída](#3-login-senha-e-saída)
4. [Manual do administrador](#4-manual-do-administrador)
5. [Manual do aluno (portal)](#5-manual-do-aluno-portal)
6. [Cadastro de novos alunos (onboarding)](#6-cadastro-de-novos-alunos-onboarding)
7. [Política de privacidade e LGPD](#7-política-de-privacidade-e-lgpd)
8. [Perguntas frequentes e solução de problemas](#8-perguntas-frequentes-e-solução-de-problemas)

---

## 1. O que é este sistema

O **Films Dutra Dashboard** é uma aplicação web para a escola gerenciar alunos, agenda de aulas, evolução no surf, financeiro e viagens (surf trips). Os **alunos** acessam um **portal** simplificado para ver aulas, evolução, viagens e dados básicos de perfil.

- **Administradores** usam o endereço da área admin (por exemplo `https://seu-dominio.vercel.app/admin` após o deploy).
- **Alunos** usam o portal (por exemplo `https://seu-dominio.vercel.app/student`), **quando a escola mantiver o portal ligado** nas configurações.

Horários de aulas e datas exibidas na agenda e no portal seguem o fuso **America/São_Paulo** (Brasília), salvo evolução futura do produto.

---

## 2. Antes de começar (URLs e papéis)

### 2.1 Endereços principais

| O quê | Caminho típico | Quem usa |
|--------|----------------|----------|
| Entrada do site | `/` | Todos |
| Login | `/login` | Admin e alunos |
| Área administrativa | `/admin` e subpáginas | Apenas perfil **admin** |
| Portal do aluno | `/student` e subpáginas | Apenas perfil **aluno** |
| Cadastro por convite | `/onboarding/[link enviado pela escola]` | Novo aluno (primeiro acesso) |
| Política de privacidade | `/privacidade` | Público |

Substitua o domínio pelo endereço real fornecido pela equipe técnica (produção).

### 2.2 Papéis (admin e aluno)

- Quem tem papel **administrador** no sistema, ao entrar, é direcionado para **`/admin`**.
- Quem tem papel **aluno** é direcionado para **`/student`**, se o portal estiver ativo e a conta estiver ativa.
- Um usuário **não** deve tentar “trocar de área” manualmente: o sistema redireciona para o painel correto conforme o papel.

O **primeiro administrador** da escola costuma ser configurado pela equipe técnica no banco de dados. Novos alunos podem ser convidados pelo fluxo de **onboarding** (link único) descrito na [secção 6](#6-cadastro-de-novos-alunos-onboarding).

---

## 3. Login, senha e saída

### 3.1 Entrar

1. Abra a página de **Login** (`/login`).
2. Informe **e-mail** e **senha** cadastrados no sistema de autenticação da escola.
3. Envie o formulário. Em caso de sucesso, você será levado automaticamente à área **admin** ou **aluno**.

Na tela de login podem aparecer a **marca** e o **nome da escola** (quando configurados em **Configurações**).

### 3.2 Esqueci a senha

1. Na mesma página de login, use a opção de **recuperação de senha** (texto do tipo “Esqueceu a senha?”).
2. Informe o e-mail. Você receberá um link no e-mail cadastrado.
3. Abra o link, siga as instruções e defina uma **nova senha** na página indicada.

**Importante:** o e-mail de recuperação depende da configuração do provedor de autenticação (Supabase) e da caixa de entrada do usuário (incluindo spam).

### 3.3 Sair do sistema

Use o botão **Sair** no cabeçalho da área em que estiver (admin ou portal do aluno). Isso encerra a sessão de forma segura.

### 3.4 Mensagens de erro comuns no login

| Situação | O que significa | O que fazer |
|----------|-----------------|-------------|
| Conta **inativa** | O administrador desativou o acesso deste aluno em **Alunos**. | Entrar em contato com a escola. |
| **Portal dos alunos** desligado | Em **Configurações**, a escola desativou o acesso ao portal para todos os alunos. | Alunos devem falar com a escola; administradores continuam usando `/admin`. |
| Credenciais inválidas | E-mail ou senha incorretos. | Conferir dados ou usar recuperação de senha. |

---

## 4. Manual do administrador

O menu lateral (**Menu**) contém os atalhos abaixo. Abaixo, o uso de cada um.

### 4.1 Início (`/admin`)

A **home** do administrador concentra uma visão geral:

- **Cards** com números úteis (por exemplo aulas do dia, conforme dados cadastrados).
- **Feed** com próximas aulas, alertas de inadimplência (financeiro) e aniversariantes em janela próxima (quando há data de nascimento cadastrada).
- **Atalhos** para Agenda, Financeiro, Surf trips, lista de Alunos e página de Login (útil para testar ou orientar).

**Convite de onboarding:** na home há fluxo para **gerar link** de cadastro de novo aluno. O link leva à página pública de onboarding (ver [secção 6](#6-cadastro-de-novos-alunos-onboarding)).

### 4.2 Agenda (`/admin/agenda`)

**Finalidade:** planejar e consultar **aulas** no calendário.

- Visualize o **mês** na grade e o **dia** selecionado no painel ao lado.
- **Criar ou editar aula:** use o formulário (diálogo) informando aluno, data e hora, duração, **status** da aula, observações e habilidades anotadas (tags), quando aplicável.
- **Cancelamento:** ao marcar aula como cancelada, informe o **motivo** exigido pelo sistema.
- **Conflitos:** duas aulas **não canceladas** do **mesmo aluno** não podem se sobrepor no tempo; o sistema bloqueia e pede ajuste.

**Dica:** no **perfil do aluno** (`/admin/students/[id]`) existe secção de **aulas** com histórico e atalho para a agenda.

### 4.3 Evolução (`/admin/evolution`)

**Finalidade:** registrar a **evolução** do aluno no surf (texto, data, tags de habilidade).

- Selecione o **aluno** (filtro na página; por URL também é possível `?student=` com o identificador do aluno).
- Veja a **linha do tempo** das entradas, da mais recente para a mais antiga.
- **Criar / editar / excluir** entradas pelo diálogo: data da entrada, texto, tags (mesmo estilo de lista separada por vírgulas usado na agenda, quando aplicável).
- **Vínculo opcional com aula:** é possível associar uma entrada a uma **aula** já existente do mesmo aluno; o sistema valida essa coerência.
- **Gráfico:** barras com frequência das tags cadastradas nas entradas (ajuda a ver eixos de trabalho no período).

No **perfil do aluno** há atalho para abrir a evolução já filtrada para ele.

### 4.4 Financeiro (`/admin/financeiro`)

**Finalidade:** lançamentos **financeiros** por aluno (valores, vencimentos, pagamentos).

- **Cards** no topo: receita no mês de referência, inadimplência, valores a receber, total histórico recebido (conforme regras do sistema).
- **Navegação por mês** (mês anterior / próximo).
- **Filtro por aluno** alinhado à lista de alunos ativos.
- **CRUD** (criar, ler, atualizar, excluir) via diálogo: tipo, valor, vencimento, data de pagamento (quando pago), observações. O **status** é derivado automaticamente conforme preenchimento e datas.
- **Gráfico** de barras: recebidos por mês nos últimos 12 meses (referência ao mês selecionado).

**Nota operacional:** o portal do **aluno não exibe** o módulo financeiro; apenas administradores.

### 4.5 Surf trips (`/admin/surf-trips`)

**Finalidade:** cadastrar **viagens** e gerir **inscrições** dos alunos.

- Filtre por **ano civil**; a lista agrupa viagens por **mês**.
- **Criar / editar / excluir** viagem: título, destino, data, número de **vagas**, descrição, imagem de **capa** (URL ou upload de arquivo de imagem, conforme limite de tamanho aceito na tela).
- **Inscrições:** incluir aluno ativo ainda não inscrito; alterar situação (**interessado**, **confirmado**, **cancelado**); remover inscrição.
- **Vagas ocupadas:** o sistema mantém coerência entre confirmados e vagas totais; não é possível confirmar além do limite de vagas.

Alunos com portal ativo podem manifestar interesse ou confirmar em **`/student/trips`** (ver manual do aluno).

### 4.6 Alunos (`/admin/students`)

**Finalidade:** listar e gerir **cadastro** dos alunos.

- **Busca, filtros, ordenação e paginação** na lista.
- Cada linha pode mostrar resumos como **última aula** e **situação financeira** simplificada (conforme dados existentes).
- Ao abrir um aluno (`/admin/students/[id]`):
  - Edite dados de **perfil** e informações de **surf / saúde** (lado administrativo).
  - Ative ou desative a conta (**conta ativa**): aluno **inativo** não acessa o portal.
  - Acesse blocos de **aulas**, **evolução** e **financeiro** com atalhos para os módulos correspondentes.

**Avatar:** quando disponível na interface, o avatar pode ser definido por **URL** ou **upload** (políticas de armazenamento definidas pela equipe técnica).

### 4.7 Configurações (`/admin/configuracoes`)

**Finalidade:** dados institucionais e comportamento do **portal dos alunos**.

- **Nome da escola**, **e-mail** e **telefone** de contato (aparecem em comunicações e no portal, quando preenchidos).
- **URL do logo** (opcional): personaliza marca na tela de login e contextos que usam branding.
- **Portal dos alunos** (ligar / desligar): quando **desligado**, alunos **não** conseguem usar `/student` (voltam ao login com mensagem adequada). Administradores continuam acessando `/admin`.
- **Conta inativa** é controlada **por aluno** na ficha em **Alunos**, não nesta tela (há referência na própria página de configurações).

### 4.8 Tema (claro / escuro)

No cabeçalho da área admin existe controle de **tema** (claro/escuro). É preferência visual; não altera permissões nem dados.

---

## 5. Manual do aluno (portal)

Este texto pode ser **copiado, adaptado ou impresso** pela escola para entregar aos alunos (e-mail, PDF, grupo de WhatsApp, etc.).

### 5.1 Como o aluno acessa

1. A escola deve informar o **endereço do site** e que o acesso é pela página **Entrar** / **Login**.
2. O aluno usa o **mesmo e-mail** e **senha** definidos no cadastro (ou os dados que a escola orientou após o convite de cadastro).
3. Após o login, o aluno cai no **Início** do portal (`/student`).

**Se não conseguir entrar:** ver secção [8](#8-perguntas-frequentes-e-solução-de-problemas) e mensagens na tela de login (conta inativa ou portal desligado).

### 5.2 Menu do portal (“Portal”)

| Página | O que o aluno vê e faz |
|--------|-------------------------|
| **Início** | Próximas aulas; prévia da evolução; faixa de **comunicados** com texto institucional e, se a escola preencheu, **e-mail** e **telefone** de contato. |
| **Perfil** | Dados do perfil que o sistema libera para o próprio aluno. Para pedir alteração de dados sensíveis ou completos, use **Solicitar atualização** — abre o cliente de e-mail da escola com mensagem modelo (o aluno pode editar o texto antes de enviar). |
| **Aulas** | Lista das **aulas** do aluno: datas, status, observações e habilidades quando registradas pela escola. **Somente leitura.** |
| **Evolução** | **Linha do tempo** das fichas de evolução escritas pela equipe. **Somente leitura** (na versão atual não há envio de mídia pelo aluno). |
| **Surf trips** | Viagens com data **a partir de hoje** (calendário da escola). O aluno pode marcar **interesse**, **confirmar** vaga ou **cancelar** participação, conforme botões exibidos e regras de vagas. |

### 5.3 O que o aluno **não** vê no portal (por desenho do produto)

- **Financeiro** (mensalidades, boletos, extrato) — tratado diretamente com a escola, fora deste portal na versão atual.
- **Ficha técnica completa de saúde / surf** que só o admin edita — o aluno pode solicitar atualização por e-mail a partir do **Perfil**.

### 5.4 Senha e saída

- **Esqueci a senha:** mesmo fluxo da [secção 3.2](#32-esqueci-a-senha), na página de login.
- **Sair:** botão **Sair** no portal encerra a sessão.

### 5.5 Privacidade

O site disponibiliza página de **Política de privacidade** (`/privacidade`). Recomenda-se ler e, em caso de dúvidas, contatar a escola pelo contato indicado na política ou em **Configurações** / **Início** do portal.

---

## 6. Cadastro de novos alunos (onboarding)

### 6.1 Papel da escola

1. Na **home admin**, use a função de **gerar link de convite** (onboarding).
2. Envie o link **privado** ao futuro aluno (e-mail, mensagem segura, etc.).
3. O link é **único** e pode **expirar** ou **invalidar** após uso, conforme regras técnicas — se o link falhar, gere um novo na administração.

### 6.2 Papel do novo aluno

1. Abrir o link recebido (abre o cadastro em `/onboarding/...`).
2. Preencher os dados solicitados no assistente (**wizard**).
3. Aceitar termos / LGPD quando exibidos, conforme texto na tela.
4. Concluir o cadastro. Em seguida, o aluno deve conseguir usar o **login** com o e-mail e senha definidos, **se** a escola mantiver o **portal ligado** e a conta **ativa**.

Se a página disser que o convite é **inválido** ou **expirado**, o aluno deve pedir um **novo link** à escola.

---

## 7. Política de privacidade e LGPD

- A rota **`/privacidade`** exibe um **modelo** de política. A **direção da escola** deve revisar o texto com assessoria jurídica antes de tratar como documento oficial.
- Links para a política costumam aparecer no **rodapé** de páginas públicas (home, login, onboarding), conforme implementação atual.

---

## 8. Perguntas frequentes e solução de problemas

**P: O aluno entra e volta para o login com mensagem de portal.**  
R: Em **Configurações**, ligue o **Portal dos alunos**. Se a intenção é manter o portal fechado temporariamente, informe os alunos por outro canal.

**P: “Conta inativa”.**  
R: Somente um **administrador** pode reativar em **Alunos**, na ficha do aluno.

**P: Admin abre `/student` por engano.**  
R: O sistema redireciona o administrador para **`/admin`**.

**P: Aluno tenta abrir `/admin`.**  
R: O sistema redireciona para **`/student`**.

**P: Horário da aula “não bate” com o relógio do celular.**  
R: Os horários exibidos seguem o **fuso da escola** (Brasília). Quem está em outro fuso deve mentalmente ajustar ou confirmar com a escola.

**P: Recuperação de senha não chega.**  
R: Conferir pasta de **spam**, e-mail digitado, e com a equipe técnica se o serviço de e-mail do provedor de autenticação está correto em produção.

**P: Onde a escola muda o nome que aparece no login?**  
R: **Configurações** — nome da escola (e opcionalmente logo por URL).

---

## Contato técnico

Dúvidas sobre **deploy, domínio, banco de dados ou permissões internas** devem ser encaminhadas à **equipe técnica** que mantém o projeto, não sendo cobertas pelo uso diário descrito neste manual.

---

*Documento gerado para entrega ao cliente. Ajuste nomes de domínio, políticas internas e canais de contato antes da distribuição final.*
