# Componentes de Layout

Sistema de layout completo com Sidebar, Header e Layout wrapper para o sistema de gestão RH.

## Componentes

### Layout

Componente principal que envolve todo o conteúdo das páginas do sistema. Combina Sidebar e Header em uma estrutura responsiva.

#### Uso

```tsx
import { Layout } from '../../components/Layout';

const MinhaPage: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1>Conteúdo da página</h1>
        <p>Seu conteúdo aqui...</p>
      </div>
    </Layout>
  );
};
```

#### Props

- `children`: React.ReactNode - Conteúdo a ser renderizado dentro do layout

### Sidebar

Barra lateral de navegação com os seguintes itens:
- Dashboard
- Prêmio de Produtividade
- Boletins de Medição
- Documentações e Integrações
- Caderno Virtual
- Lançamentos Diários
- Relatórios

#### Características

- Colapsa para versão compacta
- Responsivo para mobile
- Animações suaves
- Highlight da rota ativa
- Ícones do react-icons

### Header

Cabeçalho do sistema com:
- Botão de menu (mobile)
- Nome do sistema
- Notificações (com badge)
- Menu do usuário
  - Informações do usuário
  - Link para perfil
  - Link para configurações
  - Botão de logout

#### Características

- Usa o hook `useAuth` para dados do usuário
- Dropdowns animados
- Badge de notificações
- Avatar com gradiente

## Estrutura de Arquivos

```
src/components/Layout/
├── Layout.tsx         # Componente principal
├── Layout.css         # Estilos do layout
├── Sidebar.tsx        # Componente da sidebar
├── Sidebar.css        # Estilos da sidebar
├── Header.tsx         # Componente do header
├── Header.css         # Estilos do header
├── index.ts           # Exports centralizados
└── README.md          # Documentação
```

## Rotas Configuradas

Todas as páginas já estão configuradas em `src/routes/AppRoutes.tsx`:

- `/dashboard` - Dashboard
- `/premios-produtividade` - Prêmio de Produtividade
- `/boletins-medicao` - Boletins de Medição
- `/documentacoes` - Documentações e Integrações
- `/caderno-virtual` - Caderno Virtual
- `/lancamentos-diarios` - Lançamentos Diários
- `/relatorios` - Relatórios

## Responsividade

- Desktop (> 768px): Sidebar expandida por padrão
- Mobile (≤ 768px): Sidebar colapsada por padrão
- Botão de toggle sempre visível
- Layout se adapta automaticamente

## Personalização

### Cores do Gradiente

As cores podem ser alteradas nos arquivos CSS:

```css
/* Sidebar */
background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);

/* Header - Avatar e Logo */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Largura da Sidebar

```css
/* Expandida */
width: 280px;

/* Colapsada */
width: 80px;
```

## Integração com useAuth

O Header usa o hook `useAuth` para:
- Exibir nome do usuário
- Exibir role (admin/colaborador)
- Fazer logout
- Verificar autenticação

Certifique-se de que o `AuthProvider` envolve toda a aplicação.

