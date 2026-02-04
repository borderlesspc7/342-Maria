# 🔥 Configuração do Firebase - Guia Rápido

## ⚠️ Erro de Permissões do Firestore

Se você está vendo o erro **"Missing or insufficient permissions"**, significa que as regras de segurança do Firestore precisam ser configuradas.

## 📋 Passo a Passo para Configurar

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto: **maria-44e49**

### 2. Configure as Regras do Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique na aba **Rules** (Regras)
3. Substitua o conteúdo atual por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção 'users'
    match /users/{userId} {
      // Permite leitura se o usuário está autenticado
      allow read: if request.auth != null;
      
      // Permite criar se o usuário está autenticado
      allow create: if request.auth != null;
      
      // Permite atualizar se o usuário está autenticado
      allow update: if request.auth != null;
      
      // Permite deletar apenas para admins (ou remova esta linha temporariamente)
      allow delete: if request.auth != null;
    }
    
    // Regras para outras coleções
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Clique em **Publish** (Publicar)

### 3. Configuração Temporária para Setup (Mais Permissiva)

**⚠️ ATENÇÃO: Use apenas durante o desenvolvimento/setup inicial!**

Se ainda tiver problemas, use estas regras temporárias (menos seguras, mas funcionam):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Depois de criar o admin, volte para as regras mais restritivas acima!**

### 4. Criar o Usuário Admin Manualmente (Alternativa)

Se preferir criar manualmente no Firebase Console:

1. Vá para **Authentication** → **Users**
2. Clique em **Add user**
3. Preencha:
   - Email: `admin@gmail.com`
   - Password: `123456`
4. Clique em **Add user**
5. Copie o **User UID** gerado
6. Vá para **Firestore Database** → **Data**
7. Clique em **Start collection**
8. Collection ID: `users`
9. Document ID: cole o **User UID** copiado
10. Adicione os campos:
    - `name` (string): `Administrador`
    - `email` (string): `admin@gmail.com`
    - `role` (string): `admin`
    - `createdAt` (timestamp): data atual
    - `updatedAt` (timestamp): data atual
11. Clique em **Save**

### 5. Verificar Configuração

Após configurar as regras:

1. Volte para a página `/setup-admin`
2. Clique novamente em **Criar Usuário Admin**
3. Deve funcionar agora!

## 🔒 Regras de Segurança Recomendadas (Produção)

Para produção, use regras mais restritivas. Veja o arquivo `firestore.rules` para um exemplo completo.

## 📝 Variáveis de Ambiente

Certifique-se de que o arquivo `.env` está configurado:

```env
VITE_FIREBASE_API_KEY=AIzaSyBMb7teTg5n_L7ERpWx1LalYqSf3t0BDws
VITE_FIREBASE_AUTH_DOMAIN=maria-44e49.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=maria-44e49
VITE_FIREBASE_STORAGE_BUCKET=maria-44e49.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=744713430025
VITE_FIREBASE_APP_ID=1:744713430025:web:ece2323d005b100aa004d8
```

## ✅ Após Configurar

1. Acesse `/setup-admin` novamente
2. Clique em **Criar Usuário Admin**
3. Faça login com:
   - Email: `admin@gmail.com`
   - Senha: `123456`
