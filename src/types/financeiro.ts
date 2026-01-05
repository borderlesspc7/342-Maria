// Types para o módulo financeiro

export type TipoTransacao =
  | "Adiantamento"
  | "Pagamento"
  | "Reembolso"
  | "Desconto";
export type StatusTransacao =
  | "Pendente"
  | "Aprovado"
  | "Pago"
  | "Rejeitado"
  | "Cancelado";
export type FormaPagamento =
  | "Dinheiro"
  | "PIX"
  | "Transferência"
  | "Cheque"
  | "Cartão";
export type CategoriaFinanceira =
  | "Salário"
  | "Adiantamento Salarial"
  | "Vale Transporte"
  | "Vale Alimentação"
  | "Prêmio"
  | "Reembolso"
  | "Despesa Operacional"
  | "Outro";

export interface Transacao {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  cpf: string;
  cargo: string;
  setor: string;
  tipoTransacao: TipoTransacao;
  categoria: CategoriaFinanceira;
  valor: number;
  descricao: string;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusTransacao;
  formaPagamento?: FormaPagamento;
  numeroComprovante?: string;
  observacoes?: string;
  anexos: AnexoFinanceiro[];
  aprovadoPor?: string;
  aprovadoEm?: Date;
  pagoPor?: string;
  pagoEm?: Date;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface AnexoFinanceiro {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
  uploadEm: Date;
}

export interface TransacaoFormData {
  colaboradorId: string;
  colaboradorNome: string;
  cpf: string;
  cargo: string;
  setor: string;
  tipoTransacao: TipoTransacao;
  categoria: CategoriaFinanceira;
  valor: number;
  descricao: string;
  dataVencimento: Date;
  formaPagamento?: FormaPagamento;
  observacoes?: string;
  anexos?: File[];
}

export interface TransacaoFilters {
  colaboradorNome?: string;
  tipoTransacao?: TipoTransacao;
  status?: StatusTransacao;
  categoria?: CategoriaFinanceira;
  dataInicio?: Date;
  dataFim?: Date;
  valorMin?: number;
  valorMax?: number;
}

export interface FinanceiroStats {
  totalPendente: number;
  totalAprovado: number;
  totalPago: number;
  totalRejeitado: number;
  valorTotalPendente: number;
  valorTotalAprovado: number;
  valorTotalPago: number;
  valorTotalMes: number;
  adiantamentosPendentes: number;
  pagamentosPendentes: number;
}

export interface ResumoFinanceiro {
  mes: number;
  ano: number;
  totalAdiantamentos: number;
  totalPagamentos: number;
  totalReembolsos: number;
  totalDescontos: number;
  valorTotalAdiantamentos: number;
  valorTotalPagamentos: number;
  valorTotalReembolsos: number;
  valorTotalDescontos: number;
  transacoesPorStatus: {
    pendente: number;
    aprovado: number;
    pago: number;
    rejeitado: number;
  };
  transacoesPorCategoria: {
    categoria: CategoriaFinanceira;
    quantidade: number;
    valor: number;
  }[];
}

export interface FluxoCaixa {
  data: Date;
  entradas: number;
  saidas: number;
  saldo: number;
  descricao: string;
}
