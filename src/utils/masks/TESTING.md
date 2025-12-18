# Guia de Testes - Sistema de Máscaras

Este documento contém instruções detalhadas para testar todas as máscaras implementadas no sistema.

## ✅ Checklist de Testes

### 1. Prêmios de Produtividade

**Localização**: `/premios-produtividade`

#### Teste de CPF
- [ ] Abrir modal "Novo prêmio"
- [ ] Selecionar um colaborador do mock (CPF deve ser preenchido automaticamente formatado)
- [ ] Digitar CPF manualmente: `12345678900`
- [ ] **Resultado esperado**: `123.456.789-00`
- [ ] Tentar digitar letras → **não deve permitir**
- [ ] Tentar digitar mais de 11 números → **deve limitar a 11**

#### Teste de Valor
- [ ] No campo "Valor (R$)", digitar: `1000`
- [ ] **Resultado esperado**: `10,00` (divide por 100)
- [ ] Digitar: `123456`
- [ ] **Resultado esperado**: `1.234,56`
- [ ] Tentar digitar letras → **não deve permitir**
- [ ] Apagar tudo → **deve mostrar** `0,00`
- [ ] Salvar o prêmio e verificar se o valor está correto na listagem

---

### 2. Caderno Virtual / Lançamentos Diários

**Localização**: `/caderno-virtual`

#### Teste de Valor
- [ ] Abrir modal "Novo Lançamento Diário"
- [ ] No campo "Valor (R$)", digitar: `5000`
- [ ] **Resultado esperado**: `50,00`
- [ ] Digitar: `999999`
- [ ] **Resultado esperado**: `9.999,99`
- [ ] Tentar digitar vírgulas ou pontos → **não deve interferir na formatação**
- [ ] Salvar e verificar exibição na tabela com formatação `R$ XX,XX`

#### Teste de Data
- [ ] Campo "Data" deve aceitar seleção de data
- [ ] Verificar se a data selecionada é salva corretamente
- [ ] Verificar formatação na tabela (DD/MM/AAAA)

---

### 3. Boletins de Medição

**Localização**: `/boletins-medicao`

#### Teste de Valor
- [ ] Abrir modal "Novo Boletim de Medição"
- [ ] No campo "Valor (R$)", digitar: `100000`
- [ ] **Resultado esperado**: `1.000,00`
- [ ] Digitar: `12345678`
- [ ] **Resultado esperado**: `123.456,78`
- [ ] Apagar completamente → **deve mostrar** `0,00`
- [ ] Salvar e verificar na tabela se o valor aparece como `R$ XXX.XXX,XX`

#### Teste de Datas
- [ ] Campo "Data de Emissão" deve aceitar seleção
- [ ] Campo "Data de Vencimento" deve aceitar seleção
- [ ] Verificar se as datas são exibidas corretamente na tabela

---

### 4. Documentações e Integrações

**Localização**: `/documentacoes`

#### Teste de CPF do Colaborador
- [ ] Abrir modal "Novo Documento"
- [ ] Selecionar colaborador → **CPF deve vir formatado**
- [ ] Verificar formato: `000.000.000-00`

#### Teste de Número do Documento - CPF
- [ ] Selecionar tipo: "CPF"
- [ ] Digitar no campo "Número do Documento": `11122233344`
- [ ] **Resultado esperado**: `111.222.333-44`

#### Teste de Número do Documento - RG
- [ ] Selecionar tipo: "RG"
- [ ] Digitar: `123456789`
- [ ] **Resultado esperado**: `12.345.678-9`

#### Teste de Número do Documento - CTPS
- [ ] Selecionar tipo: "CTPS"
- [ ] Digitar: `12345678901`
- [ ] **Resultado esperado**: `1234567/890-1`

#### Teste de Número do Documento - CNH
- [ ] Selecionar tipo: "CNH"
- [ ] Digitar: `12345678901`
- [ ] **Resultado esperado**: `12345678901` (apenas números)

#### Teste de Número do Documento - Outros tipos
- [ ] Selecionar tipos: ASO, NR-11, NR-18, etc.
- [ ] Campo deve aceitar texto livre sem máscara

---

### 5. Relatórios

**Localização**: `/relatorios`

#### Teste de Exibição de Valores
- [ ] Gerar um relatório consolidado
- [ ] Verificar se todos os valores monetários estão formatados: `R$ X.XXX,XX`
- [ ] Verificar cards de resumo:
  - Total Prêmios Pagos
  - Total Boletins Emitidos
  - Total Recebimentos
  - Total Geral
- [ ] Todos devem estar com símbolo `R$` e formato brasileiro

---

## 🧪 Testes de Validação

### Validação de CPF

Testar com CPFs válidos:
- [ ] `123.456.789-09` → deve aceitar (CPF válido)
- [ ] `111.111.111-11` → pode rejeitar (CPF inválido - todos dígitos iguais)

### Validação de Campos Obrigatórios
- [ ] Tentar salvar formulários vazios
- [ ] Verificar se mensagens de erro aparecem
- [ ] Verificar se campos com `*` são realmente obrigatórios

---

## 🔍 Testes de Edge Cases

### Comportamento ao Apagar
- [ ] Digitar um valor e apagar completamente
- [ ] **Resultado esperado para valor**: `0,00`
- [ ] **Resultado esperado para CPF**: campo vazio

### Copiar e Colar
- [ ] Copiar um CPF formatado: `123.456.789-00`
- [ ] Colar no campo → **deve manter a formatação**
- [ ] Copiar um CPF sem formatação: `12345678900`
- [ ] Colar no campo → **deve formatar automaticamente**

### Teclado Numérico
- [ ] Usar teclado numérico para digitar valores
- [ ] Verificar se aceita entrada normal

### Navegação por Tab
- [ ] Usar Tab para navegar entre campos
- [ ] Verificar se formatação é mantida ao perder foco

---

## 📱 Testes de Responsividade

- [ ] Testar em tela desktop (1920x1080)
- [ ] Testar em tablet (768px)
- [ ] Testar em mobile (375px)
- [ ] Verificar se inputs com máscaras funcionam em touch devices

---

## ⚡ Testes de Performance

### Digitação Rápida
- [ ] Digitar rapidamente nos campos de valor
- [ ] Verificar se não há lag ou travamentos
- [ ] Verificar se todos os caracteres são capturados

### Múltiplas Edições
- [ ] Abrir e fechar modal várias vezes
- [ ] Editar um registro já existente
- [ ] Verificar se máscaras são aplicadas corretamente em edição

---

## 🐛 Testes de Bugs Comuns

### Máscaras não Removidas
- [ ] Criar um registro com CPF: `123.456.789-00`
- [ ] Abrir banco de dados / console
- [ ] Verificar se foi salvo sem máscara: `12345678900`

### Valores Zerados
- [ ] Criar lançamento com valor `0,00`
- [ ] Verificar se salva corretamente
- [ ] Editar e colocar valor real

### Máscaras Quebradas
- [ ] Digitar caracteres especiais: `@#$%`
- [ ] Verificar se são ignorados
- [ ] Verificar se a máscara continua funcionando

---

## 📊 Resultados Esperados

### Formato de Saída (API)

Ao salvar dados, verificar estrutura JSON:

```json
{
  "cpf": "12345678900",           // ✅ SEM formatação
  "valor": 1234.56,                // ✅ Como número
  "numeroDocumento": "123456789",  // ✅ SEM formatação
  "dataPremio": "2024-12-25"       // ✅ ISO format
}
```

### Formato de Exibição (UI)

```
CPF: 123.456.789-00              ✅ COM formatação
Valor: 1.234,56                  ✅ COM separadores
Valor (card): R$ 1.234,56        ✅ COM símbolo
Data: 25/12/2024                 ✅ Formato brasileiro
```

---

## 🚨 Problemas Conhecidos e Soluções

| Problema | Solução |
|----------|---------|
| Máscara não aparece ao editar | Verificar se `maskCPF()` está sendo chamado no `useState` inicial |
| Valor não salva corretamente | Garantir que está enviando `formData.valor` (number) e não `formData.valorDisplay` |
| CPF salva com pontos e traços | Usar `unmaskCPF()` antes de enviar para API |
| Campo aceita letras | Adicionar `replace(/\D/g, '')` na função de máscara |

---

## ✨ Checklist Final

Após completar todos os testes acima:

- [ ] Todas as máscaras estão funcionando corretamente
- [ ] Valores são salvos sem formatação
- [ ] Valores são exibidos com formatação
- [ ] Validações estão funcionando
- [ ] Não há erros no console
- [ ] Performance está adequada
- [ ] Funciona em diferentes navegadores
- [ ] Funciona em diferentes dispositivos
- [ ] Documentação está atualizada

---

## 🎯 Próximos Passos

Se todos os testes passaram:
1. ✅ Marcar task como completa
2. 📝 Documentar quaisquer issues encontradas
3. 🚀 Deploy para staging/produção
4. 👥 Solicitar review do time

Se houver falhas:
1. 🐛 Documentar o bug
2. 🔧 Corrigir o problema
3. ♻️ Repetir os testes

