# 🔐 Sistema de Permissões de Usuários

## 📋 Visão Geral

O sistema possui três níveis de acesso:

### 👑 Administrador (admin)
- **Acesso total** a todas as funcionalidades
- Pode criar, editar e excluir usuários
- Acesso à área de **Administração** (exclusiva)
- Pode editar todos os dados do sistema

### 👔 Gestor (gestor)
- Pode **editar** dados em todas as áreas (exceto Administração)
- Não tem acesso à área de Administração
- Pode criar, editar e excluir colaboradores, prêmios, boletins, etc.

### 👤 Colaborador (colaborador)
- Apenas **visualização** (read-only)
- Não pode criar, editar ou excluir dados
- Pode visualizar todas as informações disponíveis

## 🛠️ Como Usar o Hook de Permissões

### Importar o Hook

```typescript
import { usePermissions } from "../../hooks/usePermissions";
```

### Usar nas Páginas

```typescript
const MinhaPage: React.FC = () => {
  const { canEdit, isAdmin, isGestor, isColaborador } = usePermissions();

  return (
    <Layout>
      <div>
        <h1>Minha Página</h1>
        
        {/* Botão só aparece se puder editar */}
        {canEdit && (
          <button onClick={handleCreate}>
            Criar Novo Item
          </button>
        )}

        {/* Lista de itens */}
        {items.map(item => (
          <div key={item.id}>
            <p>{item.name}</p>
            
            {/* Botões de ação só aparecem se puder editar */}
            {canEdit && (
              <>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id)}>Excluir</button>
              </>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};
```

### Propriedades Disponíveis

- `canEdit`: `true` se o usuário pode editar (admin ou gestor)
- `canAccessAdmin`: `true` apenas para admin
- `isAdmin`: `true` se é administrador
- `isGestor`: `true` se é gestor
- `isColaborador`: `true` se é colaborador
- `userRole`: string com o papel atual ("admin" | "gestor" | "colaborador")

## 📍 Rotas Protegidas

As rotas já estão configuradas com proteção por papel:

- `/administracao` - **Apenas admin**
- `/colaboradores` - Admin e Gestor
- `/premios-produtividade` - Admin e Gestor
- `/boletins-medicao` - Admin e Gestor
- `/documentacoes` - Admin e Gestor
- `/caderno-virtual` - Todos (mas edição controlada por `canEdit`)
- `/financeiro` - **Apenas admin**
- `/relatorios` - Admin e Gestor
- `/documentos-financeiros` - Admin e Gestor

## ✅ Implementação Completa

### 1. Área de Administração ✅
- Criada página `/administracao`
- Apenas admin tem acesso
- Permite criar, editar e excluir usuários
- Define papéis: admin, gestor, colaborador

### 2. Hook de Permissões ✅
- Criado `usePermissions()` hook
- Verifica permissões de edição
- Verifica acesso à área admin

### 3. Rotas Protegidas ✅
- Todas as rotas configuradas com `allowedRoles`
- Redirecionamento automático se não tiver permissão

### 4. Menu Lateral ✅
- Itens do menu filtrados por papel
- Área de Administração só aparece para admin

## 🔄 Próximos Passos (Opcional)

Para aplicar permissões de edição nas outras páginas:

1. Importe `usePermissions` em cada página
2. Use `canEdit` para mostrar/ocultar botões de ação
3. Desabilite campos de formulário se `!canEdit`
4. Mostre mensagem informativa para colaboradores

Exemplo de desabilitar formulário:

```typescript
const { canEdit } = usePermissions();

<input
  type="text"
  value={formData.name}
  onChange={handleChange}
  disabled={!canEdit} // Desabilita se não puder editar
  placeholder={canEdit ? "Digite o nome" : "Apenas visualização"}
/>
```

## 🎯 Resumo das Permissões

| Ação | Admin | Gestor | Colaborador |
|------|-------|--------|-------------|
| Visualizar dados | ✅ | ✅ | ✅ |
| Criar/Editar dados | ✅ | ✅ | ❌ |
| Excluir dados | ✅ | ✅ | ❌ |
| Acessar Administração | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Acessar Financeiro | ✅ | ❌ | ❌ |
