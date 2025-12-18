import React from 'react';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: (value: string) => string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Componente de Input com máscara
 * Aplica automaticamente a máscara conforme o usuário digita
 */
export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = mask(e.target.value);
    onChange(maskedValue);
  };

  return (
    <input
      {...props}
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
};

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
}

/**
 * Componente de Input específico para valores monetários
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const displayValue = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleaned = inputValue.replace(/\D/g, '');
    
    if (!cleaned) {
      onChange(0);
      return;
    }
    
    const number = parseFloat(cleaned) / 100;
    onChange(number);
  };

  return (
    <input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={props.placeholder || '0,00'}
    />
  );
};

