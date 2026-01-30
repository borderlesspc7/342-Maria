# Próximos passos de implementação

Documento gerado com base no que já existe no projeto e nos requisitos dos Sprints 1 a 4.

---

## O que já está pronto

| Sprint | Item | Status |
|--------|------|--------|
| **1** | Layout e menu lateral | ✅ Layout, Sidebar, Header |
| **1** | Login e autenticação | ✅ Firebase Auth, Login, Register, ForgotPassword, AuthContext |
| **1** | Painel inicial com notificações | ✅ Dashboard com contagem e cards (dados mock) |
| **2** | Lançamento de prêmio (valor, data, motivo) | ✅ Modal no Prêmio de Produtividade |
| **2** | Listagem de prêmios com filtros | ✅ Filtros por mês, ano, status, colaborador |
| **2** | Histórico por colaborador | ✅ Painel lateral na tela de prêmios |
| **2** | Exportação Excel (CSV) | ✅ premioProdutividadeService.exportarRelatorioCSV |
| **3** | Cadastro de boletins (cliente, status) | ✅ BoletinsMedicao com modal e filtros |
| **3** | Filtro por cliente e mês | ✅ Filtros na tela de boletins |
| **3** | Dashboard (total emitido/pendente) | ✅ Cards de stats na tela de boletins |
| **3** | Notificações automáticas | ✅ notificacaoAutomaticaService (documentos, boletins, prêmios) |
| **3** | Histórico de notificações | ✅ Página Notificações + NotificationContext |
| **4** | Relatório consolidado mensal | ✅ relatoriosService.gerarRelatorioConsolidado |
| **4** | Exportação Excel no relatório | ✅ CSV no relatório |
| **4** | Filtros por período | ✅ Mês/ano na tela de relatórios |

---

## Lacunas e próximos passos (com horas)

### SPRINT 1 — Ajustes e conclusão

| # | Tarefa | Detalhe | Horas |
|---|--------|---------|-------|
| 1.1 | **Proteger todas as rotas autenticadas** | Hoje só `/dashboard` usa `ProtectedRoutes`. Envolver Premios, Boletins, Notificações, Relatórios, Perfil, Configurações, etc. com `ProtectedRoutes`. | **1h** |
| 1.2 | **Níveis de acesso (Gestor / Administrativo / Colaborador)** | Atual tipo `User` tem `role?: "admin" \| "user"`. Alterar para `"gestor" \| "administrativo" \| "colaborador"`, persistir no Firestore (documento do usuário ou Custom Claims), e usar no login/register. | **2h** |
| 1.3 | **Menu lateral por perfil** | Sidebar: exibir/ocultar itens conforme role (ex.: Relatórios só para Gestor/Administrativo). Criar helper ou mapa path → roles permitidos. | **1,5h** |
| 1.4 | **Base de usuários e permissões no Firestore** | Garantir coleção (ex.: `users`) com `uid`, `email`, `displayName`, `role`, `createdAt`. Atualizar no register e no primeiro login se usar apenas Auth. | **1,5h** |
| 1.5 | **Dashboard com contagem real de notificações** | Trocar mock do Dashboard por integração com `NotificationContext` ou serviço de notificações para contagem de não lidas. | **1h** |

**Subtotal Sprint 1:** **7h**

---

### SPRINT 2 — Prêmio de Produtividade

| # | Tarefa | Detalhe | Horas |
|---|--------|---------|-------|
| 2.1 | **Tela de cadastro de colaborador** | Tela dedicada: nome, CPF, cargo, setor (e opcionalmente email, data admissão). Listagem com busca e edição/exclusão. Serviço (Firestore ou mock) para CRUD de colaboradores. | **4h** |
| 2.2 | **Vincular colaboradores ao prêmio** | No modal de prêmio, buscar colaboradores do novo CRUD (ou Firestore) em vez de usar só `mockColaboradores`. Manter opção “novo colaborador” redirecionando ou abrindo cadastro rápido. | **2h** |
| 2.3 | **Revisão de filtros e listagem** | Garantir que filtros por colaborador e data estejam consistentes com a base real (já existe boa base; só validar após 2.1/2.2). | **0,5h** |

**Subtotal Sprint 2:** **6,5h**

---

### SPRINT 3 — Boletins e Notificações

| # | Tarefa | Detalhe | Horas |
|---|--------|---------|-------|
| 3.1 | **Anexo PDF no boletim** | Tipo `BoletimMedicao` já tem `anexos: Anexo[]`. Implementar upload para Storage (Firebase), salvar `url`/`nome` no documento do boletim no Firestore e exibir link/download na listagem e no modal. | **3h** |
| 3.2 | **Dashboard “total emitido / pendente”** | Se o Dashboard geral (home) precisar mostrar totais de boletins: consumir `boletimMedicaoService.getStats` ou equivalente e exibir no painel (hoje os cards do Dashboard são mock). | **1h** |
| 3.3 | **Notificações automáticas (boletins pendentes)** | Já existe `notificacaoAutomaticaService.verificarBoletins`. Garantir que está sendo chamado (ex.: NotificationInitializer ou job agendado) e que gera notificações para boletins pendentes conforme regra de negócio. | **1h** |
| 3.4 | **Histórico de notificações no painel** | Já existe página Notificações. Se “painel” for o Dashboard: adicionar widget “Últimas notificações” no Dashboard usando o mesmo contexto/serviço. | **1h** |

**Subtotal Sprint 3:** **6h**

---

### SPRINT 4 — Relatórios e Refinamento

| # | Tarefa | Detalhe | Horas |
|---|--------|---------|-------|
| 4.1 | **Exportação em PDF real** | Hoje “Exportar PDF” gera HTML. Trocar por geração de PDF (ex.: lib como `jspdf` + `jspdf-autotable` ou `html2pdf.js`) e download com extensão `.pdf`. | **3h** |
| 4.2 | **Listagem do relatório com filtros** | Tela de relatórios já tem período (mês/ano). Se precisar de “listagem” separada (ex.: tabela de prêmios/boletins do período): adicionar seção expansível ou aba “Detalhes” na própria tela de relatório com filtro por colaborador. | **2h** |
| 4.3 | **Backup manual (download CSV)** | Nova funcionalidade: botão “Backup” (ex.: em Configurações ou Relatórios) que gera um ou mais CSVs (usuários, prêmios, boletins) e faz download. Definir escopo (quais entidades) e permissão (ex.: só Gestor). | **2,5h** |
| 4.4 | **Ajustes de usabilidade** | Revisão de labels, mensagens de erro, loading states, feedback de sucesso (toast ou alert), acessibilidade básica e fluxos críticos (login, cadastro de prêmio, cadastro de boletim). | **3h** |
| 4.5 | **Testes gerais** | Testes manuais dos fluxos principais (login, roles, prêmios, boletins, notificações, relatórios, exportações, backup). Ajustes de bugs encontrados. | **3h** |

**Subtotal Sprint 4:** **13,5h**

---

## Resumo por sprint

| Sprint | Horas |
|--------|-------|
| Sprint 1 (estrutura e autenticação) | 7h |
| Sprint 2 (prêmio de produtividade) | 6,5h |
| Sprint 3 (boletins e notificações) | 6h |
| Sprint 4 (relatórios e refinamento) | 13,5h |
| **Total estimado** | **33h** |

---

## Ordem sugerida de execução

1. **Sprint 1** (7h) – Proteção de rotas, níveis de acesso e menu por perfil são a base para o resto.
2. **Sprint 2** (6,5h) – Tela de colaborador e vínculo com prêmios.
3. **Sprint 3** (6h) – Anexo PDF em boletins e ajustes de dashboard/notificações.
4. **Sprint 4** (13,5h) – PDF real, backup CSV, usabilidade e testes.

---

## Observações técnicas

- **Rotas:** Em `AppRoutes.tsx`, todas as rotas internas (exceto login/register/forgotPassword) devem usar `<ProtectedRoutes>`.
- **User role:** Ajustar `src/types/user.ts` e o documento do usuário no Firestore para `gestor` | `administrativo` | `colaborador`.
- **Colaboradores:** Definir se ficam em coleção Firestore `colaboradores` ou apenas em memória/localStorage até ter backend; o serviço de prêmios já está preparado para receber lista de colaboradores.
- **PDF:** Não há dependência de geração de PDF no `package.json` hoje; será necessário adicionar (ex.: `jspdf`, `jspdf-autotable` ou `html2pdf.js`).

Se quiser, posso detalhar a implementação de algum item específico (por exemplo: ProtectedRoutes em todas as rotas, ou tela de cadastro de colaborador) passo a passo no código.
