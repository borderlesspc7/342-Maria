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
  getDoc,
} from "firebase/firestore";
import type {
  Transacao,
  TransacaoFormData,
  TransacaoFilters,
  FinanceiroStats,
  ResumoFinanceiro,
  StatusTransacao,
  FormaPagamento,
} from "../types/financeiro";

const COLLECTION_NAME = "transacoes_financeiras";

// Helper para converter Date para Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Helper para converter Timestamp para Date
const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
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

      // Filtros adicionais que não podem ser aplicados no Firestore
      if (filters.valorMin !== undefined) {
        transacoes = transacoes.filter((t) => t.valor >= filters.valorMin!);
      }

      if (filters.valorMax !== undefined) {
        transacoes = transacoes.filter((t) => t.valor <= filters.valorMax!);
      }

      return transacoes;
    } catch (error) {
      console.error("Erro ao listar transações:", error);
      throw error;
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

  async update(id: string, formData: Partial<TransacaoFormData>): Promise<void> {
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

      const categoriaMap = new Map<string, { quantidade: number; valor: number }>();

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
        const catData = categoriaMap.get(t.categoria) || { quantidade: 0, valor: 0 };
        catData.quantidade++;
        catData.valor += t.valor;
        categoriaMap.set(t.categoria, catData);
      });

      // Converter map para array
      resumo.transacoesPorCategoria = Array.from(categoriaMap.entries()).map(
        ([categoria, data]) => ({
          categoria: categoria as any,
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

