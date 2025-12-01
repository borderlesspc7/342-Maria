import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  Timestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  LancamentoDiario,
  LancamentoFormData,
  LancamentoFilters,
  LancamentoStatus,
} from "../types/lancamentoDiario";

const lancamentosCollection = collection(db, "lancamentosDiarios");

const mapSnapshotToLancamento = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): LancamentoDiario => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    tipoMovimentacao: data.tipoMovimentacao,
    descricao: data.descricao,
    valor: data.valor,
    status: data.status as LancamentoStatus,
    dataLancamento: data.dataLancamento
      ? data.dataLancamento.toDate()
      : new Date(),
    criadoPor: data.criadoPor,
    criadoPorNome: data.criadoPorNome,
    colaboradorId: data.colaboradorId,
    colaboradorNome: data.colaboradorNome,
    observacoes: data.observacoes,
    anexos: data.anexos || [],
    criadoEm: data.criadoEm ? data.criadoEm.toDate() : new Date(),
    atualizadoEm: data.atualizadoEm ? data.atualizadoEm.toDate() : new Date(),
  };
};

const buildFiltersQuery = (filters?: LancamentoFilters) => {
  const constraints: QueryConstraint[] = [];

  if (filters?.dataInicio) {
    constraints.push(
      where("dataLancamento", ">=", Timestamp.fromDate(filters.dataInicio))
    );
  }

  if (filters?.dataFim) {
    const dataFim = new Date(filters.dataFim);
    dataFim.setHours(23, 59, 59, 999);
    constraints.push(
      where("dataLancamento", "<=", Timestamp.fromDate(dataFim))
    );
  }

  if (filters?.colaboradorId) {
    constraints.push(where("colaboradorId", "==", filters.colaboradorId));
  }

  if (filters?.colaboradorNome) {
    constraints.push(
      where(
        "colaboradorNomeSearch",
        "array-contains",
        filters.colaboradorNome.toLowerCase()
      )
    );
  }

  if (filters?.tipoMovimentacao) {
    constraints.push(where("tipoMovimentacao", "==", filters.tipoMovimentacao));
  }

  if (filters?.status) {
    constraints.push(where("status", "==", filters.status));
  }

  constraints.push(orderBy("dataLancamento", "desc"));

  return query(lancamentosCollection, ...constraints);
};

export const lancamentoDiarioService = {
  async list(filters?: LancamentoFilters): Promise<LancamentoDiario[]> {
    try {
      const q = buildFiltersQuery(filters);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(mapSnapshotToLancamento);
    } catch (error) {
      console.error("Erro ao listar lançamentos:", error);
      throw error;
    }
  },

  async create(
    data: LancamentoFormData,
    criadoPor: string,
    criadoPorNome: string
  ): Promise<string> {
    try {
      const payload = {
        ...data,
        valor: data.valor ? Number(data.valor) : null,
        dataLancamento: Timestamp.fromDate(data.dataLancamento),
        criadoPor,
        criadoPorNome,
        colaboradorNomeSearch: data.colaboradorNome
          ? data.colaboradorNome.toLowerCase().split(" ").filter(Boolean)
          : [],
        anexos: [],
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      };

      const docRef = await addDoc(lancamentosCollection, payload);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<LancamentoFormData>): Promise<void> {
    try {
      const docRef = doc(lancamentosCollection, id);
      const payload: Record<string, unknown> = {
        atualizadoEm: Timestamp.now(),
      };

      if (data.tipoMovimentacao !== undefined) {
        payload.tipoMovimentacao = data.tipoMovimentacao;
      }

      if (data.descricao !== undefined) {
        payload.descricao = data.descricao;
      }

      if (data.valor !== undefined) {
        payload.valor = data.valor ? Number(data.valor) : null;
      }

      if (data.status !== undefined) {
        payload.status = data.status;
      }

      if (data.dataLancamento) {
        payload.dataLancamento = Timestamp.fromDate(data.dataLancamento);
      }

      if (data.colaboradorId !== undefined) {
        payload.colaboradorId = data.colaboradorId;
      }

      if (data.colaboradorNome !== undefined) {
        payload.colaboradorNome = data.colaboradorNome;
        payload.colaboradorNomeSearch = data.colaboradorNome
          ? data.colaboradorNome.toLowerCase().split(" ").filter(Boolean)
          : [];
      }

      if (data.observacoes !== undefined) {
        payload.observacoes = data.observacoes;
      }

      await updateDoc(docRef, payload);
    } catch (error) {
      console.error("Erro ao atualizar lançamento:", error);
      throw error;
    }
  },

  async updateStatus(id: string, status: LancamentoStatus): Promise<void> {
    try {
      const docRef = doc(lancamentosCollection, id);
      await updateDoc(docRef, {
        status,
        atualizadoEm: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(lancamentosCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      throw error;
    }
  },
};
