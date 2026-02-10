# Próximo passo de implementação

Documento atualizado com base no estado atual do projeto e nas requisições dos Sprints.

---

## O que já está implementado (resumo atualizado)

### Sprint 1 – Estrutura e autenticação ✅ (concluído)
| Item | Status |
|------|--------|
| Layout, Sidebar, Header | ✅ |
| Login/Logout com Firebase Auth | ✅ |
| Cadastro de usuários (admin, gestor, colaborador) | ✅ Register + Administração |
| **Rotas protegidas** (todas as rotas internas) | ✅ `ProtectedRoutes` + `allowedRoles` em AppRoutes |
| **Níveis de acesso** (admin, gestor, colaborador) | ✅ types/user, Firestore, Auth |
| **Menu lateral por perfil** | ✅ Sidebar filtra itens por `roles` |
| Base de usuários no Firestore (users + role) | ✅ |
| Dashboard com métricas reais | ✅ Fase 1 – cards e atividades recentes com dados reais |
| **Notificações no Dashboard** | ⚠️ **Pendente** – seção "Notificações e Alertas do Dia" ainda usa dados mock |

### Sprint 2 – Prêmio e colaboradores
| Item | Status |
|------|--------|
| Tela de Colaboradores (CRUD) | ✅ Página existe; serviço com Firestore + fallback local |
| Listagem de prêmios com filtros | ✅ |
| Modal de prêmio (valor, data, motivo) | ✅ |
| Histórico por colaborador | ✅ |
| Exportação Excel (prêmios) | ✅ |
| **Vincular prêmio à lista real de colaboradores** | ⚠️ Verificar se o modal de prêmio usa `colaboradorService.list()` |

### Sprint 3 – Boletins e notificações
| Item | Status |
|------|--------|
| CRUD Boletins com Firebase | ✅ Fase 1 |
| Filtros (cliente, mês, status) | ✅ |
| Dashboard boletins (total emitido/pendente) | ✅ Stats na página + Dashboard geral |
| Anexos em boletins | ✅ Base64 (opcional depois: Firebase Storage) |
| Notificações automáticas (serviço) | ✅ notificacaoAutomaticaService |
| Página de Notificações | ✅ |
| **Widget “Últimas notificações” no Dashboard** | ⚠️ Hoje é mock; pode usar NotificationContext |

### Sprint 4 – Relatórios e refinamento
| Item | Status |
|------|--------|
| Relatório consolidado mensal | ✅ |
| Filtros por mês/ano | ✅ |
| Exportação Excel (CSV) no relatório | ✅ |
| Formatação dos cards de números nos relatórios | ✅ Ajuste recente |
| **Exportação PDF real** (arquivo .pdf) | ❌ Hoje é HTML/print |
| **Backup manual (CSV)** | ❌ Não implementado |
| Ajustes de usabilidade / testes | Parcial |

---

## Próximo passo recomendado

### Opção A – Fechar Sprint 1 (recomendado)

**Integrar notificações reais no Dashboard**  
**Estimativa: ~1h**

**O que fazer:**
- No Dashboard, a seção **"Notificações e Alertas do Dia"** ainda usa um `useState` com array fixo de notificações.
- Trocar para usar o **NotificationContext** (ou `notificacaoService.listarPorUsuario` / `observarNotificacoesNaoLidas`) para:
  - Exibir notificações reais do usuário logado.
  - Mostrar contagem de não lidas.
  - Permitir marcar como lida e remover, refletindo no contexto/serviço.

**Arquivos principais:**
- `src/pages/Dashboard/Dashboard.tsx` – substituir estado local de `notifications` por dados do contexto/serviço.
- Garantir que `NotificationProvider` envolva a rota do Dashboard (já deve estar no App).

**Benefício:** Dashboard 100% com dados reais; Sprint 1 totalmente concluído.

---

### Opção B – Evoluir Sprint 2

**Garantir vínculo Prêmio ↔ Colaboradores reais**  
**Estimativa: ~1–2h**

**O que fazer:**
- Na tela **Prêmio de Produtividade**, no modal de criar/editar prêmio, verificar se o select de colaborador usa `colaboradorService.list()` (Firestore) em vez de lista mock.
- Se ainda usar mock, trocar para `colaboradorService.list()` e manter consistência com a tela de Colaboradores.

**Arquivos principais:**
- `src/pages/PremiosProdutividade/PremiosProdutividade.tsx` (ou componente do modal).
- `src/services/colaboradorService.ts` (já com Firestore).

**Benefício:** Prêmios sempre vinculados aos colaboradores cadastrados no sistema.

---

### Opção C – Sprint 4 (mais impacto para o usuário)

**Exportação PDF real no relatório**  
**Estimativa: ~3h**

**O que fazer:**
- Instalar lib de PDF (ex.: `jspdf` + `jspdf-autotable` ou `html2pdf.js`).
- No relatório consolidado, trocar o fluxo atual (abrir HTML em nova janela e imprimir) por geração de um arquivo PDF e download com extensão `.pdf`.

**Arquivos principais:**
- `src/services/relatoriosService.ts` (ou novo helper de export PDF).
- `src/pages/Relatorios/Relatorios.tsx` (botão “Exportar PDF”).

**Benefício:** Relatório em PDF real, alinhado às expectativas de “exportar PDF”.

---

## Ordem sugerida (próximas 3 ações)

1. **Integrar notificações reais no Dashboard** (~1h) – fecha Sprint 1.
2. **Prêmio usando lista real de colaboradores** (~1–2h) – fecha Sprint 2.
3. **Exportação PDF real no relatório** (~3h) – avança Sprint 4.

Depois disso:
- **Backup manual CSV** (Configurações ou Relatórios): ~2,5h.
- **Migrar anexos de boletins para Firebase Storage** (opcional): ~3h.
- **Ajustes de usabilidade e testes manuais**: ~3h.

---

## Resumo

- **Requisitos e projeto:** Sprints 1–4 descritos em `PROXIMOS_PASSOS_IMPLEMENTACAO.md`; Fase 1 (Dashboard, Exportação base, Boletins) já implementada.
- **Próximo passo recomendado:** **Integrar notificações reais no Dashboard** (Opção A, ~1h), fechando o Sprint 1 e deixando o painel inicial totalmente baseado em dados reais.

Se quiser, na próxima mensagem podemos implementar direto a **Opção A** (notificações reais no Dashboard) passo a passo no código.
