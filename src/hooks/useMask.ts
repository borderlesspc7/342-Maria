import { useState, useCallback } from 'react';

/**
 * Hook customizado para aplicar máscaras em inputs
 * Facilita o uso de máscaras em componentes React
 */

type MaskFunction = (value: string) => string;

interface UseMaskReturn {
  value: string;
  displayValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string) => void;
  clear: () => void;
}

export const useMask = (
  initialValue: string = '',
  maskFn: MaskFunction
): UseMaskReturn => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = maskFn(inputValue);
      setValue(maskedValue);
    },
    [maskFn]
  );

  const clear = useCallback(() => {
    setValue('');
  }, []);

  const setValueManually = useCallback(
    (newValue: string) => {
      const maskedValue = maskFn(newValue);
      setValue(maskedValue);
    },
    [maskFn]
  );

  return {
    value,
    displayValue: value,
    onChange: handleChange,
    setValue: setValueManually,
    clear,
  };
};

/**
 * Hook para máscara de moeda com controle de número
 */
export const useCurrencyMask = (initialValue: number = 0) => {
  const [rawValue, setRawValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '');
    
    if (!cleaned) {
      setRawValue(0);
      return;
    }
    
    // Converte para número
    const number = parseFloat(cleaned) / 100;
    setRawValue(number);
  }, []);

  const displayValue = rawValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const setValue = useCallback((newValue: number) => {
    setRawValue(newValue);
  }, []);

  const clear = useCallback(() => {
    setRawValue(0);
  }, []);

  return {
    value: rawValue,
    displayValue,
    onChange: handleChange,
    setValue,
    clear,
  };
};

