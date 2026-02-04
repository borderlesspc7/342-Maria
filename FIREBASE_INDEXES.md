# 🔥 Índices do Firestore - Prêmios de Produtividade

## ⚠️ Problema

Se você está vendo erros como "failed-precondition" ou "index", significa que o Firestore precisa de índices compostos para as queries complexas.

## ✅ Solução Automática

O código agora tem **fallback automático** que funciona mesmo sem índices criados. Ele busca todos os dados e filtra em memória quando necessário.

## 📋 Criar Índices Manualmente (Opcional - Para Melhor Performance)

Se quiser melhorar a performance, você pode criar os índices manualmente:

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto: **maria-44e49**
3. Vá para **Firestore Database** → **Indexes**

### 2. Índices Necessários

O Firestore geralmente cria índices automaticamente quando você executa uma query pela primeira vez. Se aparecer um link de erro, clique nele para criar automaticamente.

**Índices recomendados:**

1. **Collection:** `premiosProdutividade`
   - Fields: `anoReferencia` (Ascending), `mesReferencia` (Ascending), `dataPremio` (Descending)

2. **Collection:** `premiosProdutividade`
   - Fields: `anoReferencia` (Ascending), `mesReferencia` (Ascending), `status` (Ascending), `dataPremio` (Descending)

3. **Collection:** `premiosProdutividade`
   - Fields: `colaboradorId` (Ascending), `dataPremio` (Descending)

### 3. Criar via Link de Erro (Mais Fácil)

Quando você executar uma query que precisa de índice, o Firebase mostrará um erro com um link. Clique no link e ele criará o índice automaticamente.

## 🔧 Verificar Regras de Segurança

Certifique-se de que as regras do Firestore permitem leitura/escrita:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /premiosProdutividade/{premioId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## ✅ Teste

Após configurar, teste:

1. Acesse a página de Prêmios de Produtividade
2. Tente criar um novo prêmio
3. Verifique se os prêmios aparecem na lista

O sistema agora funciona mesmo sem índices criados, mas pode ser mais lento com muitos dados.
