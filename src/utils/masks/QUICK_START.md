# 🚀 Quick Start - Máscaras de Formatação

Guia rápido para desenvolvedores que precisam adicionar máscaras em novos campos.

## 📦 Importação

```typescript
import { 
  maskCPF, 
  maskCurrency, 
  unmaskCPF,
  validateCPF 
} from '../../utils/masks';
```

## 💰 Campo de Valor Monetário

### Implementação Completa

```typescript
const [formData, setFormData] = useState({
  valor: 0,
  valorDisplay: '0,00'
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const cleaned = value.replace(/\D/g, '');
  
  if (!cleaned) {
    setFormData(prev => ({
      ...prev,
      valor: 0,
      valorDisplay: '0,00'
    }));
    return;
  }
  
  const number = parseFloat(cleaned) / 100;
  setFormData(prev => ({
    ...prev,
    valor: number,
    valorDisplay: number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }));
};

// No JSX
<input
  type="text"
  name="valor"
  value={formData.valorDisplay}
  onChange={handleChange}
  placeholder="0,00"
/>

// Ao enviar para API
const dataToSave = {
  valor: formData.valor // Envia o número, não o display
};
```

## 📄 Campo de CPF

### Implementação Completa

```typescript
const [cpf, setCpf] = useState('');

const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const maskedValue = maskCPF(e.target.value);
  setCpf(maskedValue);
};

// No JSX
<input
  type="text"
  value={cpf}
  onChange={handleCpfChange}
  placeholder="000.000.000-00"
/>

// Ao enviar para API
const dataToSave = {
  cpf: unmaskCPF(cpf) // Remove a formatação
};

// Validação (opcional)
if (!validateCPF(cpf)) {
  alert('CPF inválido!');
  return;
}
```

## 📞 Campo de Telefone

```typescript
import { maskPhone, unmaskPhone } from '../../utils/masks';

const [telefone, setTelefone] = useState('');

<input
  type="text"
  value={telefone}
  onChange={(e) => setTelefone(maskPhone(e.target.value))}
  placeholder="(00) 00000-0000"
/>

// Ao salvar
const dataToSave = {
  telefone: unmaskPhone(telefone)
};
```

## 📍 Campo de CEP

```typescript
import { maskCEP, unmaskCEP } from '../../utils/masks';

const [cep, setCep] = useState('');

<input
  type="text"
  value={cep}
  onChange={(e) => setCep(maskCEP(e.target.value))}
  placeholder="00000-000"
/>

// Ao salvar
const dataToSave = {
  cep: unmaskCEP(cep)
};
```

## 🆔 Campo com Máscara Dinâmica

Útil quando o tipo de documento muda:

```typescript
import { maskCPF, maskRG, maskCNH } from '../../utils/masks';

const [tipoDoc, setTipoDoc] = useState('CPF');
const [numeroDoc, setNumeroDoc] = useState('');

const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let maskedValue = e.target.value;
  
  switch (tipoDoc) {
    case 'CPF':
      maskedValue = maskCPF(maskedValue);
      break;
    case 'RG':
      maskedValue = maskRG(maskedValue);
      break;
    case 'CNH':
      maskedValue = maskCNH(maskedValue);
      break;
    default:
      // Texto livre, sem máscara
      break;
  }
  
  setNumeroDoc(maskedValue);
};

// JSX
<select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
  <option value="CPF">CPF</option>
  <option value="RG">RG</option>
  <option value="CNH">CNH</option>
</select>

<input
  type="text"
  value={numeroDoc}
  onChange={handleNumeroChange}
  placeholder="Número do documento"
/>
```

## 🎨 Usando o Hook Customizado

### useMask

```typescript
import { useMask } from '../../hooks/useMask';
import { maskCPF } from '../../utils/masks';

const { value, onChange } = useMask('', maskCPF);

<input value={value} onChange={onChange} />
```

### useCurrencyMask

```typescript
import { useCurrencyMask } from '../../hooks/useMask';

const { value, displayValue, onChange } = useCurrencyMask(0);

<input value={displayValue} onChange={onChange} />

// value contém o número sem formatação
// displayValue contém a string formatada
```

## 🧩 Usando Componentes Prontos

### MaskedInput

```typescript
import { MaskedInput } from '../../components/ui/MaskedInput';
import { maskCPF } from '../../utils/masks';

<MaskedInput
  mask={maskCPF}
  value={cpf}
  onChange={setCpf}
  placeholder="000.000.000-00"
  required
/>
```

### CurrencyInput

```typescript
import { CurrencyInput } from '../../components/ui/MaskedInput';

<CurrencyInput
  value={valor}
  onChange={setValor}
  placeholder="0,00"
  required
/>
```

## 📋 Formatação para Exibição

Para exibir valores já salvos (sem input):

```typescript
import { formatCurrency, formatDate, formatDateTime } from '../../utils/masks';

// Moeda
<p>{formatCurrency(1234.56)}</p>
// Resultado: R$ 1.234,56

// Data
<p>{formatDate(new Date())}</p>
// Resultado: 25/12/2024

// Data e Hora
<p>{formatDateTime(new Date())}</p>
// Resultado: 25/12/2024 14:30
```

## ⚠️ Regras Importantes

1. **Sempre remova máscaras antes de salvar:**
   ```typescript
   // ❌ ERRADO
   api.save({ cpf: "123.456.789-00" });
   
   // ✅ CORRETO
   api.save({ cpf: unmaskCPF(cpf) });
   ```

2. **Para valores monetários, use número:**
   ```typescript
   // ❌ ERRADO
   api.save({ valor: "1.234,56" });
   
   // ✅ CORRETO
   api.save({ valor: 1234.56 });
   ```

3. **Aplique máscaras ao carregar dados:**
   ```typescript
   // Ao receber da API
   const [formData, setFormData] = useState({
     cpf: maskCPF(documento?.cpf || ''),
     valor: documento?.valor || 0,
     valorDisplay: (documento?.valor || 0).toLocaleString('pt-BR', {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2
     })
   });
   ```

## 🐛 Troubleshooting

### Máscara não aparece
```typescript
// Verifique se está chamando a função
<input onChange={(e) => setValor(maskCPF(e.target.value))} />
```

### Valor não salva corretamente
```typescript
// Use o valor numérico, não o display
api.save({ valor: formData.valor }); // ✅
api.save({ valor: formData.valorDisplay }); // ❌
```

### CPF salva com formatação
```typescript
// Remova a máscara antes de salvar
api.save({ cpf: unmaskCPF(formData.cpf) }); // ✅
api.save({ cpf: formData.cpf }); // ❌
```

## 📚 Referências

- **Documentação Completa**: `src/utils/masks/README.md`
- **Guia de Testes**: `src/utils/masks/TESTING.md`
- **Relatório de Implementação**: `MASCARAS_IMPLEMENTADAS.md`

## 💡 Exemplos Reais no Código

Veja implementações reais em:
- `src/pages/PremiosProdutividade/PremiosProdutividade.tsx` (CPF + Valor)
- `src/pages/CadernoVirtual/CadernoVirtual.tsx` (Valor)
- `src/pages/BoletinsMedicao/BoletinsMedicao.tsx` (Valor)
- `src/pages/Documentacoes/Documentacoes.tsx` (CPF + Documentos)

