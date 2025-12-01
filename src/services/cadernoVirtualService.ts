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
  LancamentoStats,
  LancamentoStatus,
  TipoMovimentacao,
} from "../types/cadernoVirtual";

const lancamentosCollection = collection(db, "lancamentosDiarios");

const mapSnapshotToLancamento = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): LancamentoDiario => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    tipoMovimentacao: data.tipoMovimentacao as TipoMovimentacao,
    descricao: data.descricao,
    valor: data.valor,
    dataLancamento: data.dataLancamento
      ? data.dataLancamento.toDate()
      : new Date(),
    status: data.status as LancamentoStatus,
    colaboradorId: data.colaboradorId,
    colaboradorNome: data.colaboradorNome,
    observacoes: data.observacoes,
    anexos: data.anexos || [],
    criadoPor: data.criadoPor,
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

export const cadernoVirtualService = {
  async list(filters?: LancamentoFilters): Promise<LancamentoDiario[]> {
    const q = buildFiltersQuery(filters);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshotToLancamento);
  },

  async create(
    data: LancamentoFormData,
    userId: string,
    userName: string
  ): Promise<string> {
    const payload = {
      ...data,
      valor: Number(data.valor),
      dataLancamento: Timestamp.fromDate(data.dataLancamento),
      colaboradorNomeSearch: data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter(Boolean),
      criadoPor: userId,
      criadoPorNome: userName,
      anexos: [],
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await addDoc(lancamentosCollection, payload);
    return docRef.id;
  },

  async update(id: string, data: Partial<LancamentoFormData>): Promise<void> {
    const docRef = doc(lancamentosCollection, id);
    const payload: Record<string, unknown> = {
      ...data,
      atualizadoEm: Timestamp.now(),
    };

    if (data.dataLancamento) {
      payload.dataLancamento = Timestamp.fromDate(data.dataLancamento);
    }

    if (data.colaboradorNome) {
      payload.colaboradorNomeSearch = data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter(Boolean);
    }

    if (data.valor !== undefined) {
      payload.valor = Number(data.valor);
    }

    await updateDoc(docRef, payload);
  },

  async updateStatus(id: string, status: LancamentoStatus): Promise<void> {
    const docRef = doc(lancamentosCollection, id);
    await updateDoc(docRef, {
      status,
      atualizadoEm: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(lancamentosCollection, id);
    await deleteDoc(docRef);
  },

  async getStats(dataInicio?: Date, dataFim?: Date): Promise<LancamentoStats> {
    const filters: LancamentoFilters = {};
    if (dataInicio) filters.dataInicio = dataInicio;
    if (dataFim) filters.dataFim = dataFim;

    const q = buildFiltersQuery(filters);
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(mapSnapshotToLancamento);

    const totalRecebido = entries
      .filter((e) => e.status === "Recebido")
      .reduce((sum, entry) => sum + entry.valor, 0);

    const totalPendente = entries
      .filter((e) => e.status === "Pendente")
      .reduce((sum, entry) => sum + entry.valor, 0);

    const totalPorTipo: Record<TipoMovimentacao, number> = {
      Serviço: 0,
      Pagamento: 0,
      Recebimento: 0,
      Outro: 0,
    };

    entries.forEach((entry) => {
      totalPorTipo[entry.tipoMovimentacao] += entry.valor;
    });

    return {
      totalRecebido,
      totalPendente,
      totalLancamentos: entries.length,
      totalPorTipo,
    };
  },
};
