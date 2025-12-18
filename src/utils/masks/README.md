# Sistema de Máscaras de Formatação

Este diretório contém todas as funções de máscara e formatação utilizadas no sistema.

## 📋 Índice

- [Máscaras Disponíveis](#máscaras-disponíveis)
- [Como Usar](#como-usar)
- [Onde Foram Aplicadas](#onde-foram-aplicadas)
- [Hooks Customizados](#hooks-customizados)
- [Componentes Auxiliares](#componentes-auxiliares)

## 🎭 Máscaras Disponíveis

### Documentos Pessoais

#### `maskCPF(value: string): string`
Formata CPF: `000.000.000-00`
```typescript
maskCPF("12345678900") // "123.456.789-00"
```

#### `maskCNPJ(value: string): string`
Formata CNPJ: `00.000.000/0000-00`
```typescript
maskCNPJ("12345678000190") // "12.345.678/0001-90"
```

#### `maskRG(value: string): string`
Formata RG: `00.000.000-0`
```typescript
maskRG("123456789") // "12.345.678-9"
```

#### `maskCTPS(value: string): string`
Formata Carteira de Trabalho: `0000000/000-0`
```typescript
maskCTPS("12345678901") // "1234567/890-1"
```

#### `maskCNH(value: string): string`
Formata CNH: `00000000000` (apenas números, 11 dígitos)
```typescript
maskCNH("12345678901") // "12345678901"
```

### Contatos

#### `maskPhone(value: string): string`
Formata telefone: `(00) 0000-0000` ou `(00) 00000-0000`
```typescript
maskPhone("11987654321") // "(11) 98765-4321"
maskPhone("1134567890") // "(11) 3456-7890"
```

#### `maskCEP(value: string): string`
Formata CEP: `00000-000`
```typescript
maskCEP("01310100") // "01310-100"
```

### Valores Monetários

#### `maskCurrency(value: string): string`
Formata como moeda brasileira com símbolo: `R$ 0.000,00`
```typescript
maskCurrency("1234567") // "R$ 12.345,67"
```

#### `maskCurrencyInput(value: string): string`
Formata valor para input (sem símbolo): `0.000,00`
```typescript
maskCurrencyInput("1234567") // "12.345,67"
```

### Data

#### `maskDate(value: string): string`
Formata data: `DD/MM/AAAA`
```typescript
maskDate("25122024") // "25/12/2024"
```

## 🔧 Funções de Remoção de Máscara

Todas as máscaras possuem funções `unmask` correspondentes:

- `unmaskCPF(value: string): string`
- `unmaskCNPJ(value: string): string`
- `unmaskPhone(value: string): string`
- `unmaskCEP(value: string): string`
- `unmaskCurrency(value: string): number`

Exemplo:
```typescript
const cpfFormatado = "123.456.789-00";
const cpfLimpo = unmaskCPF(cpfFormatado); // "12345678900"
```

## ✅ Funções de Validação

#### `validateCPF(cpf: string): boolean`
Valida CPF (aceita com ou sem máscara)
```typescript
validateCPF("123.456.789-00") // true ou false
```

#### `validateCNPJ(cnpj: string): boolean`
Valida CNPJ (aceita com ou sem máscara)
```typescript
validateCNPJ("12.345.678/0001-90") // true ou false
```

## 🎨 Funções de Formatação para Exibição

#### `formatCurrency(value: number): string`
Formata número como moeda
```typescript
formatCurrency(1234.56) // "R$ 1.234,56"
```

#### `formatDate(date: Date | string): string`
Formata data para exibição
```typescript
formatDate(new Date()) // "25/12/2024"
```

#### `formatDateTime(date: Date | string): string`
Formata data e hora para exibição
```typescript
formatDateTime(new Date()) // "25/12/2024 14:30"
```

## 📍 Onde Foram Aplicadas

### 1. **PremiosProdutividade** (`src/pages/PremiosProdutividade/`)
- ✅ **CPF**: Campo de CPF do colaborador com máscara `000.000.000-00`
- ✅ **Valor**: Campo de valor do prêmio com formatação monetária `0.000,00`

### 2. **CadernoVirtual** (`src/pages/CadernoVirtual/`)
- ✅ **Valor**: Campo de valor da movimentação com formatação monetária `0.000,00`
- ✅ **Data**: Campos de data já utilizam input type="date" nativo

### 3. **BoletinsMedicao** (`src/pages/BoletinsMedicao/`)
- ✅ **Valor**: Campo de valor do boletim com formatação monetária `0.000,00`
- ✅ **Data**: Campos de emissão e vencimento já utilizam input type="date" nativo

### 4. **Documentacoes** (`src/pages/Documentacoes/`)
- ✅ **CPF**: Campo de CPF com máscara `000.000.000-00`
- ✅ **Número do Documento**: Aplica máscara dinâmica baseada no tipo:
  - CPF: `000.000.000-00`
  - RG: `00.000.000-0`
  - CTPS: `0000000/000-0`
  - CNH: `00000000000`
  - Outros: texto livre

### 5. **Relatorios** (`src/pages/Relatorios/`)
- ✅ **Valores**: Exibição de valores monetários já formatados com `formatCurrency`

## 🪝 Hooks Customizados

### `useMask`
Hook genérico para aplicar qualquer máscara em um input

```typescript
import { useMask } from '../../hooks/useMask';
import { maskCPF } from '../../utils/masks';

const { value, onChange } = useMask('', maskCPF);

<input value={value} onChange={onChange} />
```

### `useCurrencyMask`
Hook específico para valores monetários

```typescript
import { useCurrencyMask } from '../../hooks/useMask';

const { value, displayValue, onChange } = useCurrencyMask(0);

<input value={displayValue} onChange={onChange} />
// value retorna o número sem formatação
```

## 🧩 Componentes Auxiliares

### `MaskedInput`
Componente de input com máscara aplicada

```typescript
import { MaskedInput } from '../../components/ui/MaskedInput';
import { maskCPF } from '../../utils/masks';

<MaskedInput
  mask={maskCPF}
  value={cpf}
  onChange={setCpf}
  placeholder="000.000.000-00"
/>
```

### `CurrencyInput`
Componente específico para valores monetários

```typescript
import { CurrencyInput } from '../../components/ui/MaskedInput';

<CurrencyInput
  value={valor}
  onChange={setValor}
  placeholder="0,00"
/>
```

## 💡 Exemplos de Uso

### Exemplo 1: Input de CPF com Máscara

```typescript
import { useState } from 'react';
import { maskCPF, unmaskCPF, validateCPF } from '../../utils/masks';

const [cpf, setCpf] = useState('');

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const maskedValue = maskCPF(e.target.value);
  setCpf(maskedValue);
};

const handleSubmit = () => {
  const cpfLimpo = unmaskCPF(cpf);
  
  if (validateCPF(cpfLimpo)) {
    // CPF válido, enviar para API
    api.send({ cpf: cpfLimpo });
  } else {
    alert('CPF inválido!');
  }
};

<input
  type="text"
  value={cpf}
  onChange={handleChange}
  placeholder="000.000.000-00"
/>
```

### Exemplo 2: Input de Valor Monetário

```typescript
import { useState } from 'react';

const [valor, setValor] = useState(0);
const [valorDisplay, setValorDisplay] = useState('0,00');

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const cleaned = value.replace(/\D/g, '');
  
  if (!cleaned) {
    setValor(0);
    setValorDisplay('0,00');
    return;
  }
  
  const number = parseFloat(cleaned) / 100;
  setValor(number);
  setValorDisplay(number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }));
};

<input
  type="text"
  value={valorDisplay}
  onChange={handleChange}
  placeholder="0,00"
/>

// No submit, usar o valor sem formatação:
<button onClick={() => api.send({ valor })}>Salvar</button>
```

## 📝 Regras de Uso

1. **Sempre remova a máscara antes de enviar para API**
   - Use as funções `unmask*` correspondentes
   - Valores monetários já são armazenados como `number`

2. **Validação de dados**
   - Use `validateCPF` e `validateCNPJ` antes de submeter
   - Valide no frontend E no backend

3. **Performance**
   - As máscaras são aplicadas em tempo real durante a digitação
   - Não há necessidade de debounce para máscaras simples

4. **Acessibilidade**
   - Sempre inclua placeholders mostrando o formato esperado
   - Use labels descritivas

## 🔄 Fluxo Completo

```
Usuário digita → Máscara aplicada → Exibição formatada
                                              ↓
                                        Validação
                                              ↓
                                     Remove máscara
                                              ↓
                                      Envia para API
```

## 🚀 Melhorias Futuras

- [ ] Adicionar máscara de placa de veículo
- [ ] Adicionar máscara de cartão de crédito
- [ ] Adicionar máscara de código de barras
- [ ] Suporte a múltiplas localizações (internacionalização)
- [ ] Testes unitários para todas as máscaras

## 📚 Referências

- [Intl.NumberFormat - MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Intl.DateTimeFormat - MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Regex para validação de CPF/CNPJ](https://www.macoratti.net/alg_cpf.htm)

