# Sistema de Notificações

Sistema completo de notificações automáticas para o Sistema de Gestão RH.

## 📋 Funcionalidades Implementadas

### ✅ 1. Notificações Automáticas

O sistema verifica automaticamente e gera notificações para:

- **Documentos Vencendo**: Alerta quando documentos estão próximos do vencimento (configurável)
- **Documentos Vencidos**: Alerta urgente quando documentos já venceram
- **Prêmios Lançados**: Notifica quando novos prêmios de produtividade são registrados
- **Boletins Pendentes**: Alerta sobre boletins de medição pendentes
- **Boletins Vencendo**: Alerta quando boletins estão próximos do vencimento

### ✅ 2. Notificações em Tempo Real

- Integração com Firebase Firestore para atualizações em tempo real
- Badge no sino de notificações mostrando quantidade de notificações não lidas
- Dropdown no Header com as 5 notificações mais recentes
- Atualização automática sem necessidade de recarregar a página

### ✅ 3. Histórico de Notificações

Página completa (`/notificacoes`) com:

- Lista de todas as notificações
- Filtros por tipo, prioridade e status (lida/não lida)
- Estatísticas de notificações
- Ações em massa (marcar todas como lidas, deletar lidas)
- Indicadores de prioridade coloridos

### ✅ 4. Configurações de Notificações

Usuários podem configurar:

- Ativar/desativar notificações por e-mail
- Escolher quais tipos de eventos geram notificações por e-mail
- Definir quantos dias de antecedência para alertas de vencimento (padrão: 7 dias)
- Configurar hora da verificação diária

### ✅ 5. Sistema de E-mail (Preparado)

Estrutura pronta para integração de envio de e-mails:

- Flag `emailEnviado` em cada notificação
- Configurações individuais por tipo de notificação
- Metadata com informações para composição de e-mails

**Nota**: A implementação do envio real de e-mails requer:

- Configuração de serviço SMTP ou API de e-mail (SendGrid, AWS SES, etc.)
- Criação de templates de e-mail
- Firebase Cloud Functions para processamento assíncrono

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── types/
│   └── notificacao.ts                    # Tipos TypeScript
├── services/
│   ├── notificacaoService.ts             # CRUD e operações do Firebase
│   └── notificacaoAutomaticaService.ts   # Verificações automáticas
├── hooks/
│   └── useNotifications.ts               # Hook React para notificações
├── contexts/
│   └── NotificationContext.tsx           # Context API
├── components/
│   ├── NotificationInitializer.tsx       # Inicializa verificações
│   └── Layout/
│       ├── Header.tsx                    # Dropdown de notificações
│       └── Header.css
└── pages/
    └── Notificacoes/
        ├── Notificacoes.tsx              # Página principal
        └── Notificacoes.css
```

### Tipos de Notificação

```typescript
type TipoNotificacao =
  | "documento_vencendo"
  | "documento_vencido"
  | "premio_lancado"
  | "boletim_pendente"
  | "boletim_vencendo"
  | "sistema"
  | "outro";

type PrioridadeNotificacao = "baixa" | "media" | "alta" | "urgente";
```

### Coleções no Firebase

1. **notificacoes**: Armazena todas as notificações

   - Campos: userId, tipo, prioridade, titulo, mensagem, lida, link, metadata, etc.

2. **configuracoes_notificacoes**: Configurações por usuário
   - Campos: emailNotificacoes, diasAntesVencimento, horaVerificacao, etc.

## 🚀 Como Usar

### Para Desenvolvedores

#### 1. Criar uma Notificação Manualmente

```typescript
import { notificacaoService } from "./services/notificacaoService";

await notificacaoService.criar({
  userId: "user-id",
  tipo: "sistema",
  prioridade: "media",
  titulo: "Título da Notificação",
  mensagem: "Descrição da notificação",
  link: "/rota-destino",
  metadata: {
    chave: "valor",
  },
});
```

#### 2. Usar o Hook de Notificações

```typescript
import { useNotifications } from "./hooks/useNotifications";

function MeuComponente() {
  const {
    notificacoes,
    naoLidas,
    stats,
    marcarComoLida,
    marcarTodasComoLidas,
    deletar,
  } = useNotifications(userId, filters, true);

  // usar os dados...
}
```

#### 3. Usar o Context

```typescript
import { useNotificationContext } from "./contexts/NotificationContext";

function MeuComponente() {
  const { notificacoes, naoLidas, marcarComoLida } = useNotificationContext();
  // ...
}
```

#### 4. Criar Notificações Específicas

```typescript
// Documento vencendo
await notificacaoService.notificarDocumentoVencendo(
  userId,
  documentoId,
  colaboradorNome,
  tipoDocumento,
  dataVencimento
);

// Prêmio lançado
await notificacaoService.notificarPremioLancado(
  userId,
  premioId,
  colaboradorNome,
  valor,
  motivo
);
```

### Para Usuários Finais

#### 1. Ver Notificações

- **No Header**: Clique no sino (🔔) para ver as notificações recentes
- **Página Completa**: Acesse Menu → Notificações ou `/notificacoes`

#### 2. Gerenciar Notificações

- **Marcar como lida**: Clique na notificação
- **Deletar**: Clique no X ao lado da notificação
- **Marcar todas como lidas**: Botão no dropdown ou na página

#### 3. Configurar Notificações

1. Acesse a página de Notificações
2. Clique em "Configurações"
3. Ajuste as preferências:
   - Ativar/desativar e-mails
   - Escolher tipos de alertas
   - Definir dias de antecedência
   - Configurar hora de verificação

## 🔄 Verificação Automática

### Como Funciona

1. **Inicialização**: O `NotificationInitializer` é montado no Layout
2. **Verificação Periódica**: A cada 60 minutos, o sistema verifica:
   - Documentos vencidos ou vencendo
   - Boletins pendentes ou vencendo
   - Novos prêmios lançados
3. **Limpeza**: Semanalmente remove notificações antigas (>30 dias e lidas)

### Configurar Intervalo de Verificação

```typescript
// No NotificationInitializer.tsx
const cancelarVerificacao =
  notificacaoAutomaticaService.iniciarVerificacaoPeriodica(
    userId,
    60 // minutos (altere conforme necessário)
  );
```

### Verificação Manual

```typescript
// Executar verificação completa
await notificacaoAutomaticaService.executarVerificacaoCompleta(userId);

// Verificar apenas documentos
await notificacaoAutomaticaService.verificarDocumentos(userId);

// Verificar apenas boletins
await notificacaoAutomaticaService.verificarBoletins(userId);

// Verificar apenas prêmios
await notificacaoAutomaticaService.verificarPremios(userId);
```

## 📧 Integração de E-mail (A Fazer)

Para implementar o envio real de e-mails:

### Opção 1: Firebase Cloud Functions + SendGrid

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const enviarEmailNotificacao = functions.firestore
  .document("notificacoes/{notificacaoId}")
  .onCreate(async (snap, context) => {
    const notificacao = snap.data();
    const userId = notificacao.userId;

    // Buscar configurações do usuário
    const configDoc = await admin
      .firestore()
      .doc(`configuracoes_notificacoes/${userId}`)
      .get();
    const config = configDoc.data();

    // Verificar se deve enviar e-mail
    if (!config?.emailNotificacoes) return;

    // Buscar dados do usuário
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const user = userDoc.data();

    // Enviar e-mail
    const msg = {
      to: user.email,
      from: "noreply@seudominio.com",
      subject: notificacao.titulo,
      html: `<p>${notificacao.mensagem}</p>`,
    };

    await sgMail.send(msg);

    // Marcar como enviado
    await snap.ref.update({
      emailEnviado: true,
      dataEmailEnviado: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

### Opção 2: Nodemailer (Backend Node.js)

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function enviarEmail(notificacao, userEmail) {
  await transporter.sendMail({
    from: '"Sistema RH" <noreply@empresa.com>',
    to: userEmail,
    subject: notificacao.titulo,
    html: `<p>${notificacao.mensagem}</p>`,
  });
}
```

## 🎨 Personalização

### Cores de Prioridade

No CSS (`Notificacoes.css` e `Header.css`):

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

### Ícones de Notificação

Em `Header.tsx` e `Notificacoes.tsx`:

```typescript
const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case "documento_vencido":
    case "documento_vencendo":
      return "📄";
    case "premio_lancado":
      return "🏆";
    // adicione mais...
  }
};
```

## 🐛 Troubleshooting

### Notificações não aparecem

1. Verifique se o `NotificationProvider` está envolvendo o app
2. Verifique se o `NotificationInitializer` está no Layout
3. Confirme se o usuário está autenticado
4. Verifique o console do navegador para erros

### Verificação automática não funciona

1. Verifique se há dados nos serviços (documentos, boletins, prêmios)
2. Confirme que as datas estão corretas
3. Verifique permissões do Firebase
4. Veja logs no console

### Notificações duplicadas

O sistema previne duplicatas verificando:

- `alertaEnviado` e `dataAlerta` nos documentos
- Notificações existentes antes de criar novas

## 📊 Estatísticas e Relatórios

```typescript
// Obter estatísticas
const stats = await notificacaoService.obterEstatisticas(userId);
// Retorna: { total, naoLidas, porTipo, porPrioridade }

// Gerar relatório completo
const relatorio = await notificacaoAutomaticaService.gerarRelatorio(userId);
```

## 🔐 Segurança

### Regras do Firebase Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notificações
    match /notificacoes/{notifId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              resource.data.userId == request.auth.uid;
    }

    // Configurações
    match /configuracoes_notificacoes/{userId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == userId;
    }
  }
}
```

## 🚀 Próximos Passos

1. ✅ Sistema básico de notificações - **CONCLUÍDO**
2. ✅ Verificação automática - **CONCLUÍDO**
3. ✅ Interface de usuário - **CONCLUÍDO**
4. ✅ Configurações - **CONCLUÍDO**
5. ⏳ Implementar envio de e-mails
6. ⏳ Notificações push (PWA)
7. ⏳ Filtros avançados e busca
8. ⏳ Agrupamento de notificações similares
9. ⏳ Templates personalizáveis

## 📝 Licença

Este sistema faz parte do Sistema de Gestão RH.
