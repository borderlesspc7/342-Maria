// src/types/documentosFinanceiros.ts

export interface NotaFiscal {
  id: string;
  numero: string;
  serie?: string;
  fornecedor: string;
  cnpjFornecedor?: string;
  valor: number;
  dataEmissao: Date;
  dataVencimento?: Date;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao?: string;
  arquivo: {
    id: string;
    nome: string;
    url: string;
    tamanho: number;
    tipo: string;
    dataUpload: Date;
  };
  status: "pendente" | "aprovado" | "rejeitado";
  observacoes?: string;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ComprovanteBancario {
  id: string;
  tipo: "deposito" | "saque" | "transferencia" | "pagamento" | "recebimento";
  banco: string;
  agencia?: string;
  conta?: string;
  valor: number;
  dataTransacao: Date;
  beneficiario: string;
  cpfCnpjBeneficiario?: string;
  descricao: string;
  numeroDocumento?: string;
  arquivo: {
    id: string;
    nome: string;
    url: string;
    tamanho: number;
    tipo: string;
    dataUpload: Date;
  };
  status: "pendente" | "aprovado" | "rejeitado";
  observacoes?: string;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface NotaFiscalFormData {
  numero: string;
  serie?: string;
  fornecedor: string;
  cnpjFornecedor?: string;
  valor: number;
  dataEmissao: Date;
  dataVencimento?: Date;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao?: string;
  arquivo: File;
}

export interface ComprovanteBancarioFormData {
  tipo: "deposito" | "saque" | "transferencia" | "pagamento" | "recebimento";
  banco: string;
  agencia?: string;
  conta?: string;
  valor: number;
  dataTransacao: Date;
  beneficiario: string;
  cpfCnpjBeneficiario?: string;
  descricao: string;
  numeroDocumento?: string;
  arquivo: File;
}

export interface DocumentoFinanceiroFilters {
  tipo?: "nota_fiscal" | "comprovante";
  status?: "pendente" | "aprovado" | "rejeitado";
  dataInicio?: Date;
  dataFim?: Date;
  valorMin?: number;
  valorMax?: number;
  busca?: string;
}
