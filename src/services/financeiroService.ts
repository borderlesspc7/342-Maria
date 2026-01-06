import { db } from "../lib/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import type {
  Transacao,
  TransacaoFormData,
  TransacaoFilters,
  FinanceiroStats,
  ResumoFinanceiro,
  StatusTransacao,
  FormaPagamento,
  CategoriaFinanceira,
} from "../types/financeiro";
import { mockColaboradores } from "../types/premioProdutividade";

const COLLECTION_NAME = "transacoes_financeiras";

// Helper para converter Date para Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Helper para converter Timestamp para Date
const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Função para gerar ID temporário
const generateTempId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Dados mockados como fallback
const getMockTransacoes = (): Transacao[] => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const colaborador = mockColaboradores[0];

  return [
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Adiantamento",
      categoria: "Adiantamento Salarial",
      valor: 1500.0,
      descricao: "Adiantamento salarial do mês corrente",
      dataVencimento: new Date(anoAtual, mesAtual, 5),
      status: "Pendente",
      observacoes: "Solicitação de adiantamento para despesas pessoais",
      anexos: [],
      criadoPor: "system",
      criadoEm: new Date(anoAtual, mesAtual, 1),
      atualizadoEm: new Date(anoAtual, mesAtual, 1),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Pagamento",
      categoria: "Salário",
      valor: 4500.0,
      descricao: "Pagamento de salário mensal",
      dataVencimento: new Date(anoAtual, mesAtual, 5),
      dataPagamento: new Date(anoAtual, mesAtual, 5),
      status: "Pago",
      formaPagamento: "Transferência",
      numeroComprovante: "TRF-20250105-001",
      observacoes: "Pagamento efetuado via transferência bancária",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual, 4),
      pagoPor: "admin-001",
      pagoEm: new Date(anoAtual, mesAtual, 5),
      criadoPor: "system",
      criadoEm: new Date(anoAtual, mesAtual - 1, 28),
      atualizadoEm: new Date(anoAtual, mesAtual, 5),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Reembolso",
      categoria: "Reembolso",
      valor: 350.0,
      descricao: "Reembolso de despesas com transporte",
      dataVencimento: new Date(anoAtual, mesAtual, 10),
      status: "Aprovado",
      formaPagamento: "PIX",
      observacoes: "Reembolso aprovado, aguardando pagamento",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual, 8),
      criadoPor: colaborador.id,
      criadoEm: new Date(anoAtual, mesAtual, 7),
      atualizadoEm: new Date(anoAtual, mesAtual, 8),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Pagamento",
      categoria: "Vale Transporte",
      valor: 220.0,
      descricao: "Vale transporte mensal",
      dataVencimento: new Date(anoAtual, mesAtual, 1),
      dataPagamento: new Date(anoAtual, mesAtual, 1),
      status: "Pago",
      formaPagamento: "PIX",
      numeroComprovante: "PIX-20250101-002",
      observacoes: "",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual - 1, 30),
      pagoPor: "admin-001",
      pagoEm: new Date(anoAtual, mesAtual, 1),
      criadoPor: "system",
      criadoEm: new Date(anoAtual, mesAtual - 1, 25),
      atualizadoEm: new Date(anoAtual, mesAtual, 1),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Pagamento",
      categoria: "Vale Alimentação",
      valor: 600.0,
      descricao: "Vale alimentação mensal",
      dataVencimento: new Date(anoAtual, mesAtual, 1),
      dataPagamento: new Date(anoAtual, mesAtual, 1),
      status: "Pago",
      formaPagamento: "Transferência",
      numeroComprovante: "TRF-20250101-003",
      observacoes: "",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual - 1, 30),
      pagoPor: "admin-001",
      pagoEm: new Date(anoAtual, mesAtual, 1),
      criadoPor: "system",
      criadoEm: new Date(anoAtual, mesAtual - 1, 25),
      atualizadoEm: new Date(anoAtual, mesAtual, 1),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Pagamento",
      categoria: "Prêmio",
      valor: 800.0,
      descricao: "Prêmio de produtividade - Dezembro/2024",
      dataVencimento: new Date(anoAtual, mesAtual, 15),
      status: "Aprovado",
      formaPagamento: "PIX",
      observacoes: "Prêmio aprovado, aguardando pagamento",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual, 10),
      criadoPor: "admin-001",
      criadoEm: new Date(anoAtual, mesAtual, 8),
      atualizadoEm: new Date(anoAtual, mesAtual, 10),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Reembolso",
      categoria: "Reembolso",
      valor: 150.0,
      descricao: "Reembolso de despesas com material de escritório",
      dataVencimento: new Date(anoAtual, mesAtual, 20),
      status: "Pendente",
      observacoes: "Aguardando aprovação do gestor",
      anexos: [],
      criadoPor: colaborador.id,
      criadoEm: new Date(anoAtual, mesAtual, 12),
      atualizadoEm: new Date(anoAtual, mesAtual, 12),
    },
    {
      id: generateTempId(),
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      setor: colaborador.setor,
      tipoTransacao: "Desconto",
      categoria: "Despesa Operacional",
      valor: 50.0,
      descricao: "Desconto por atraso",
      dataVencimento: new Date(anoAtual, mesAtual - 1, 15),
      dataPagamento: new Date(anoAtual, mesAtual - 1, 15),
      status: "Pago",
      formaPagamento: undefined,
      observacoes: "Desconto aplicado na folha de pagamento",
      anexos: [],
      aprovadoPor: "admin-001",
      aprovadoEm: new Date(anoAtual, mesAtual - 1, 14),
      pagoPor: "admin-001",
      pagoEm: new Date(anoAtual, mesAtual - 1, 15),
      criadoPor: "admin-001",
      criadoEm: new Date(anoAtual, mesAtual - 1, 13),
      atualizadoEm: new Date(anoAtual, mesAtual - 1, 15),
    },
  ];
};

export const financeiroService = {
  async list(filters: TransacaoFilters = {}): Promise<Transacao[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters.colaboradorNome) {
        constraints.push(
          where("colaboradorNome", ">=", filters.colaboradorNome),
          where("colaboradorNome", "<=", filters.colaboradorNome + "\uf8ff")
        );
      }

      if (filters.tipoTransacao) {
        constraints.push(where("tipoTransacao", "==", filters.tipoTransacao));
      }

      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.categoria) {
        constraints.push(where("categoria", "==", filters.categoria));
      }

      if (filters.dataInicio) {
        constraints.push(
          where("dataVencimento", ">=", dateToTimestamp(filters.dataInicio))
        );
      }

      if (filters.dataFim) {
        constraints.push(
          where("dataVencimento", "<=", dateToTimestamp(filters.dataFim))
        );
      }

      constraints.push(orderBy("criadoEm", "desc"));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);

      let transacoes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataVencimento: timestampToDate(data.dataVencimento as Timestamp),
          dataPagamento: data.dataPagamento
            ? timestampToDate(data.dataPagamento as Timestamp)
            : undefined,
          aprovadoEm: data.aprovadoEm
            ? timestampToDate(data.aprovadoEm as Timestamp)
            : undefined,
          pagoEm: data.pagoEm
            ? timestampToDate(data.pagoEm as Timestamp)
            : undefined,
          criadoEm: timestampToDate(data.criadoEm as Timestamp),
          atualizadoEm: timestampToDate(data.atualizadoEm as Timestamp),
        } as Transacao;
      });

      // Se não houver dados no banco, retorna dados mockados como fallback
      if (transacoes.length === 0) {
        console.log(
          "📦 Nenhuma transação encontrada no banco. Usando dados mockados como fallback."
        );
        transacoes = getMockTransacoes();
      }

      // Filtros adicionais que não podem ser aplicados no Firestore
      if (filters.valorMin !== undefined) {
        transacoes = transacoes.filter((t) => t.valor >= filters.valorMin!);
      }

      if (filters.valorMax !== undefined) {
        transacoes = transacoes.filter((t) => t.valor <= filters.valorMax!);
      }

      // Aplicar filtro de colaboradorNome nos dados mockados também
      if (filters.colaboradorNome && transacoes.length > 0) {
        const nomeLower = filters.colaboradorNome.toLowerCase();
        transacoes = transacoes.filter((t) =>
          t.colaboradorNome.toLowerCase().includes(nomeLower)
        );
      }

      return transacoes;
    } catch (error) {
      console.error("Erro ao listar transações:", error);
      console.log(
        "📦 Erro ao acessar banco. Usando dados mockados como fallback."
      );
      // Em caso de erro, retorna dados mockados como fallback
      let mockTransacoes = getMockTransacoes();

      // Aplicar filtros básicos nos dados mockados
      if (filters.colaboradorNome) {
        const nomeLower = filters.colaboradorNome.toLowerCase();
        mockTransacoes = mockTransacoes.filter((t) =>
          t.colaboradorNome.toLowerCase().includes(nomeLower)
        );
      }

      if (filters.tipoTransacao) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.tipoTransacao === filters.tipoTransacao
        );
      }

      if (filters.status) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.status === filters.status
        );
      }

      if (filters.categoria) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.categoria === filters.categoria
        );
      }

      if (filters.dataInicio) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.dataVencimento >= filters.dataInicio!
        );
      }

      if (filters.dataFim) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.dataVencimento <= filters.dataFim!
        );
      }

      if (filters.valorMin !== undefined) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.valor >= filters.valorMin!
        );
      }

      if (filters.valorMax !== undefined) {
        mockTransacoes = mockTransacoes.filter(
          (t) => t.valor <= filters.valorMax!
        );
      }

      return mockTransacoes;
    }
  },

  async create(
    formData: TransacaoFormData,
    criadoPor: string
  ): Promise<string> {
    try {
      const novaTransacao = {
        colaboradorId: formData.colaboradorId,
        colaboradorNome: formData.colaboradorNome,
        cpf: formData.cpf,
        cargo: formData.cargo,
        setor: formData.setor,
        tipoTransacao: formData.tipoTransacao,
        categoria: formData.categoria,
        valor: formData.valor,
        descricao: formData.descricao,
        dataVencimento: dateToTimestamp(formData.dataVencimento),
        status: "Pendente" as StatusTransacao,
        formaPagamento: formData.formaPagamento,
        observacoes: formData.observacoes || "",
        anexos: [],
        criadoPor,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTION_NAME),
        novaTransacao
      );
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error;
    }
  },

  async update(
    id: string,
    formData: Partial<TransacaoFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = {
        ...formData,
        atualizadoEm: Timestamp.now(),
      };

      if (formData.dataVencimento) {
        updateData.dataVencimento = dateToTimestamp(formData.dataVencimento);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      throw error;
    }
  },

  async updateStatus(
    id: string,
    status: StatusTransacao,
    userId: string,
    formaPagamento?: FormaPagamento,
    numeroComprovante?: string,
    observacoes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = {
        status,
        atualizadoEm: Timestamp.now(),
      };

      if (status === "Aprovado") {
        updateData.aprovadoPor = userId;
        updateData.aprovadoEm = Timestamp.now();
      }

      if (status === "Pago") {
        updateData.pagoPor = userId;
        updateData.pagoEm = Timestamp.now();
        updateData.dataPagamento = Timestamp.now();
        if (formaPagamento) updateData.formaPagamento = formaPagamento;
        if (numeroComprovante) updateData.numeroComprovante = numeroComprovante;
      }

      if (observacoes) {
        updateData.observacoes = observacoes;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  },

  async getStats(): Promise<FinanceiroStats> {
    try {
      const transacoes = await this.list();

      const stats: FinanceiroStats = {
        totalPendente: 0,
        totalAprovado: 0,
        totalPago: 0,
        totalRejeitado: 0,
        valorTotalPendente: 0,
        valorTotalAprovado: 0,
        valorTotalPago: 0,
        valorTotalMes: 0,
        adiantamentosPendentes: 0,
        pagamentosPendentes: 0,
      };

      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();

      transacoes.forEach((t) => {
        // Contagem por status
        if (t.status === "Pendente") {
          stats.totalPendente++;
          stats.valorTotalPendente += t.valor;
          if (t.tipoTransacao === "Adiantamento") {
            stats.adiantamentosPendentes++;
          }
          if (t.tipoTransacao === "Pagamento") {
            stats.pagamentosPendentes++;
          }
        }
        if (t.status === "Aprovado") {
          stats.totalAprovado++;
          stats.valorTotalAprovado += t.valor;
        }
        if (t.status === "Pago") {
          stats.totalPago++;
          stats.valorTotalPago += t.valor;
        }
        if (t.status === "Rejeitado") {
          stats.totalRejeitado++;
        }

        // Total do mês atual
        if (
          t.criadoEm.getMonth() === mesAtual &&
          t.criadoEm.getFullYear() === anoAtual
        ) {
          stats.valorTotalMes += t.valor;
        }
      });

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw error;
    }
  },

  async getResumoMensal(mes: number, ano: number): Promise<ResumoFinanceiro> {
    try {
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0);

      const transacoes = await this.list({
        dataInicio,
        dataFim,
      });

      const resumo: ResumoFinanceiro = {
        mes,
        ano,
        totalAdiantamentos: 0,
        totalPagamentos: 0,
        totalReembolsos: 0,
        totalDescontos: 0,
        valorTotalAdiantamentos: 0,
        valorTotalPagamentos: 0,
        valorTotalReembolsos: 0,
        valorTotalDescontos: 0,
        transacoesPorStatus: {
          pendente: 0,
          aprovado: 0,
          pago: 0,
          rejeitado: 0,
        },
        transacoesPorCategoria: [],
      };

      const categoriaMap = new Map<
        string,
        { quantidade: number; valor: number }
      >();

      transacoes.forEach((t) => {
        // Contagem por tipo
        switch (t.tipoTransacao) {
          case "Adiantamento":
            resumo.totalAdiantamentos++;
            resumo.valorTotalAdiantamentos += t.valor;
            break;
          case "Pagamento":
            resumo.totalPagamentos++;
            resumo.valorTotalPagamentos += t.valor;
            break;
          case "Reembolso":
            resumo.totalReembolsos++;
            resumo.valorTotalReembolsos += t.valor;
            break;
          case "Desconto":
            resumo.totalDescontos++;
            resumo.valorTotalDescontos += t.valor;
            break;
        }

        // Contagem por status
        switch (t.status) {
          case "Pendente":
            resumo.transacoesPorStatus.pendente++;
            break;
          case "Aprovado":
            resumo.transacoesPorStatus.aprovado++;
            break;
          case "Pago":
            resumo.transacoesPorStatus.pago++;
            break;
          case "Rejeitado":
            resumo.transacoesPorStatus.rejeitado++;
            break;
        }

        // Agrupamento por categoria
        const catData = categoriaMap.get(t.categoria) || {
          quantidade: 0,
          valor: 0,
        };
        catData.quantidade++;
        catData.valor += t.valor;
        categoriaMap.set(t.categoria, catData);
      });

      // Converter map para array
      resumo.transacoesPorCategoria = Array.from(categoriaMap.entries()).map(
        ([categoria, data]) => ({
          categoria: categoria as CategoriaFinanceira,
          quantidade: data.quantidade,
          valor: data.valor,
        })
      );

      return resumo;
    } catch (error) {
      console.error("Erro ao gerar resumo mensal:", error);
      throw error;
    }
  },

  async exportarRelatorioCSV(filters: TransacaoFilters = {}): Promise<string> {
    try {
      const transacoes = await this.list(filters);

      const headers = [
        "Data",
        "Colaborador",
        "CPF",
        "Tipo",
        "Categoria",
        "Valor",
        "Status",
        "Vencimento",
        "Pagamento",
        "Forma Pagamento",
        "Descrição",
      ];

      const rows = transacoes.map((t) => [
        new Intl.DateTimeFormat("pt-BR").format(t.criadoEm),
        t.colaboradorNome,
        t.cpf,
        t.tipoTransacao,
        t.categoria,
        t.valor.toFixed(2),
        t.status,
        new Intl.DateTimeFormat("pt-BR").format(t.dataVencimento),
        t.dataPagamento
          ? new Intl.DateTimeFormat("pt-BR").format(t.dataPagamento)
          : "-",
        t.formaPagamento || "-",
        t.descricao,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      throw error;
    }
  },
};
