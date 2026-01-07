# 🚀 Guia de Início Rápido - Sistema de Notificações

## ✅ O que foi implementado

Sistema completo de notificações com:

- ✅ Notificações automáticas para documentos vencendo/vencidos
- ✅ Notificações para boletins pendentes/vencendo
- ✅ Notificações para prêmios lançados
- ✅ Interface visual no Header (sino com badge)
- ✅ Página completa de histórico de notificações
- ✅ Configurações personalizáveis por usuário
- ✅ Atualizações em tempo real com Firebase
- ✅ Sistema de verificação automática periódica
- ✅ Filtros por tipo, prioridade e status
- ✅ Indicadores de prioridade (urgente, alta, média, baixa)

## 📦 Arquivos Criados

```
src/
├── types/notificacao.ts                          # Tipos TypeScript
├── services/
│   ├── notificacaoService.ts                     # CRUD Firebase
│   ├── notificacaoAutomaticaService.ts           # Verificações
│   └── EXEMPLO_INTEGRACAO_NOTIFICACOES.ts        # Exemplos
├── hooks/useNotifications.ts                     # Hook React
├── contexts/NotificationContext.tsx              # Context API
├── components/
│   ├── NotificationInitializer.tsx               # Inicialização
│   └── Layout/
│       ├── Header.tsx                            # ✏️ Atualizado
│       ├── Header.css                            # ✏️ Atualizado
│       ├── Sidebar.tsx                           # ✏️ Atualizado
│       └── Layout.tsx                            # ✏️ Atualizado
├── pages/Notificacoes/
│   ├── Notificacoes.tsx                          # Página principal
│   └── Notificacoes.css                          # Estilos
└── routes/
    ├── AppRoutes.tsx                             # ✏️ Atualizado
    └── paths.ts                                  # ✏️ Atualizado

Raiz do projeto/
├── NOTIFICACOES_README.md                        # Documentação completa
├── QUICK_START_NOTIFICACOES.md                   # Este arquivo
└── firestore.rules.example                       # Regras do Firebase
```

## 🔧 Configuração Inicial

### 1. Configurar Firebase (OBRIGATÓRIO)

Aplique as regras de segurança do Firestore:

```bash
# Copie as regras do arquivo
cat firestore.rules.example

# Aplique no Firebase Console:
# 1. Acesse https://console.firebase.google.com
# 2. Selecione seu projeto
# 3. Vá em Firestore Database > Regras
# 4. Cole as regras e publique
```

### 2. Verificar Dependências

Todas as dependências já estão instaladas no `package.json`:

- ✅ Firebase
- ✅ React Router Dom
- ✅ React Icons

### 3. Testar o Sistema

1. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

2. **Faça login no sistema**

3. **Acesse a página de notificações:**

   - Via menu lateral: clique em "Notificações"
   - Via URL: `http://localhost:5173/notificacoes`

4. **Configure suas preferências:**
   - Na página de notificações, clique em "Configurações"
   - Ajuste os dias de antecedência para alertas
   - Configure notificações por e-mail (quando implementado)

## 🎯 Teste Rápido

### Criar uma Notificação de Teste

Abra o console do navegador (F12) e execute:

```javascript
// Obter o ID do usuário atual
const user = JSON.parse(localStorage.getItem("user"));

// Criar notificação de teste
await fetch("https://seu-projeto.firebaseapp.com/notificacoes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: user.uid,
    tipo: "sistema",
    prioridade: "media",
    titulo: "Teste de Notificação",
    mensagem: "Esta é uma notificação de teste!",
    lida: false,
    emailEnviado: false,
    criadoEm: new Date(),
  }),
});
```

Ou use diretamente o serviço no código:

```typescript
import { notificacaoService } from "./services/notificacaoService";
import { useAuth } from "./hooks/useAuth";

const { user } = useAuth();

await notificacaoService.criar({
  userId: user.uid,
  tipo: "sistema",
  prioridade: "alta",
  titulo: "🎉 Bem-vindo ao Sistema de Notificações!",
  mensagem: "Você receberá alertas importantes aqui.",
  link: "/notificacoes",
});
```

## 📱 Como Usar

### Para Usuários Finais

1. **Ver Notificações:**

   - Clique no sino (🔔) no Header
   - Veja as 5 notificações mais recentes
   - Badge mostra quantidade de não lidas

2. **Marcar como Lida:**

   - Clique na notificação
   - Será redirecionado automaticamente (se tiver link)

3. **Ver Histórico Completo:**

   - Clique em "Ver todas as notificações"
   - Ou acesse Menu > Notificações

4. **Filtrar Notificações:**

   - Na página de notificações
   - Clique em "Filtros"
   - Escolha tipo, prioridade e status

5. **Configurar:**
   - Na página de notificações
   - Clique em "Configurações"
   - Ajuste suas preferências

### Para Desenvolvedores

#### Criar Notificação Simples

```typescript
import { notificacaoService } from "@/services/notificacaoService";

await notificacaoService.criar({
  userId: "user-id",
  tipo: "sistema",
  prioridade: "media",
  titulo: "Título",
  mensagem: "Mensagem",
  link: "/rota-destino",
});
```

#### Criar Notificação de Documento Vencendo

```typescript
await notificacaoService.notificarDocumentoVencendo(
  userId,
  documentoId,
  "João Silva",
  "ASO",
  new Date("2024-01-15")
);
```

#### Usar no Componente

```tsx
import { useNotificationContext } from "@/contexts/NotificationContext";

function MeuComponente() {
  const { notificacoes, naoLidas, marcarComoLida } = useNotificationContext();

  return (
    <div>
      <p>Você tem {naoLidas} notificações</p>
      {notificacoes.map((n) => (
        <div key={n.id} onClick={() => marcarComoLida(n.id)}>
          {n.titulo}
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Verificação Automática

O sistema verifica automaticamente:

- ⏰ **A cada 60 minutos**: Documentos, boletins e prêmios
- 🗑️ **Semanalmente**: Remove notificações antigas (>30 dias)

### Ajustar Frequência de Verificação

Em `src/components/NotificationInitializer.tsx`:

```typescript
// Mudar de 60 para outro valor (em minutos)
const cancelar = notificacaoAutomaticaService.iniciarVerificacaoPeriodica(
  user.uid,
  30 // ← Alterar aqui (ex: 30 minutos)
);
```

## 🐛 Solução de Problemas

### Notificações não aparecem?

1. ✅ Verifique se está logado
2. ✅ Verifique o console do navegador
3. ✅ Confirme regras do Firebase
4. ✅ Limpe cache e recarregue

### Verificação automática não funciona?

1. ✅ Verifique se `NotificationInitializer` está no Layout
2. ✅ Confirme que há documentos/boletins para verificar
3. ✅ Veja logs no console

### Badge não atualiza?

1. ✅ Sistema usa tempo real, deve atualizar automaticamente
2. ✅ Verifique conexão com Firebase
3. ✅ Recarregue a página

## 📊 Estrutura de Dados no Firebase

### Coleção: `notificacoes`

```javascript
{
  id: "auto-generated",
  userId: "user-id",
  tipo: "documento_vencendo",
  prioridade: "alta",
  titulo: "Documento vencendo",
  mensagem: "ASO de João Silva vence em 3 dias",
  lida: false,
  emailEnviado: false,
  link: "/documentacoes",
  metadata: {
    documentoId: "doc-id",
    colaboradorNome: "João Silva",
    dataVencimento: Timestamp
  },
  criadoEm: Timestamp,
  lidoEm: Timestamp | null
}
```

### Coleção: `configuracoes_notificacoes`

```javascript
{
  userId: "user-id",
  emailNotificacoes: true,
  emailDocumentoVencendo: true,
  emailDocumentoVencido: true,
  emailPremioLancado: true,
  emailBoletimPendente: true,
  diasAntesVencimento: 7,
  horaVerificacao: "09:00",
  atualizadoEm: Timestamp
}
```

## 🎨 Personalização

### Cores de Prioridade

Em `src/pages/Notificacoes/Notificacoes.css`:

```css
.priority-urgent {
  border-left-color: #ef4444;
} /* Vermelho */
.priority-high {
  border-left-color: #f59e0b;
} /* Laranja */
.priority-medium {
  border-left-color: #3b82f6;
} /* Azul */
.priority-low {
  border-left-color: #10b981;
} /* Verde */
```

### Ícones de Tipo

Em `src/pages/Notificacoes/Notificacoes.tsx`:

```typescript
const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case "documento_vencido":
      return "📄";
    case "premio_lancado":
      return "🏆";
    // Adicione mais...
  }
};
```

## 📚 Próximos Passos

1. ✅ **Sistema básico** - CONCLUÍDO
2. ⏳ **Implementar envio de e-mails**
   - Configure SMTP ou API de e-mail
   - Veja `NOTIFICACOES_README.md` seção "Integração de E-mail"
3. ⏳ **Notificações Push (PWA)**
4. ⏳ **Agrupamento de notificações similares**
5. ⏳ **Templates personalizáveis**

## 📖 Documentação Completa

Para documentação detalhada, veja:

- `NOTIFICACOES_README.md` - Documentação completa
- `src/services/EXEMPLO_INTEGRACAO_NOTIFICACOES.ts` - Exemplos de código

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs do Firebase
3. Confirme que as regras do Firestore estão corretas
4. Verifique se todas as coleções existem no Firestore

## ✨ Recursos Implementados

- ✅ Notificações em tempo real
- ✅ Badge com contador no Header
- ✅ Dropdown com notificações recentes
- ✅ Página completa de histórico
- ✅ Filtros avançados
- ✅ Estatísticas
- ✅ Configurações personalizáveis
- ✅ Prioridades coloridas
- ✅ Links para navegação
- ✅ Verificação automática
- ✅ Limpeza de notificações antigas
- ✅ Metadata para contexto
- ✅ Marcadores de lida/não lida
- ✅ Deleção individual e em massa

---

**Pronto para usar! 🎉**

O sistema está totalmente funcional e integrado. Comece a usar e adicione notificações onde precisar!
