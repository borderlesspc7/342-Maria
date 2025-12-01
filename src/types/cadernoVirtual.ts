export type LancamentoStatus = "Recebido" | "Pendente";

export type TipoMovimentacao =
  | "Serviço"
  | "Pagamento"
  | "Recebimento"
  | "Outro";

export interface AnexoLancamento {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  tamanho: number;
  dataUpload: Date;
}

export interface LancamentoDiario {
  id: string;
  tipoMovimentacao: TipoMovimentacao;
  descricao: string;
  valor: number;
  dataLancamento: Date;
  status: LancamentoStatus;
  colaboradorId: string;
  colaboradorNome: string;
  observacoes?: string;
  anexos: AnexoLancamento[];
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface LancamentoFormData {
  tipoMovimentacao: TipoMovimentacao;
  descricao: string;
  valor: number;
  dataLancamento: Date;
  status: LancamentoStatus;
  colaboradorId: string;
  colaboradorNome: string;
  observacoes?: string;
  anexos: File[];
}

export interface LancamentoFilters {
  dataInicio?: Date;
  dataFim?: Date;
  colaboradorId?: string;
  colaboradorNome?: string;
  tipoMovimentacao?: TipoMovimentacao;
  status?: LancamentoStatus;
}

export interface LancamentoStats {
  totalRecebido: number;
  totalPendente: number;
  totalLancamentos: number;
  totalPorTipo: Record<TipoMovimentacao, number>;
}
