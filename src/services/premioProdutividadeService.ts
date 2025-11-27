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
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  PremioProdutividade,
  PremioFormData,
  PremioFilters,
  PremioStats,
  RelatorioMensal,
  PremioStatus,
} from "../types/premioProdutividade";

const premiosCollection = collection(db, "premiosProdutividade");

const mapSnapshotToPremio = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): PremioProdutividade => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    colaboradorId: data.colaboradorId,
    colaboradorNome: data.colaboradorNome,
    cpf: data.cpf,
    cargo: data.cargo,
    setor: data.setor,
    valor: data.valor,
    dataPremio: data.dataPremio
      ? data.dataPremio.toDate()
      : new Date(data.criadoEm?.toDate?.() ?? Date.now()),
    motivo: data.motivo,
    status: data.status as PremioStatus,
    mesReferencia: data.mesReferencia,
    anoReferencia: data.anoReferencia,
    criadoEm: data.criadoEm ? data.criadoEm.toDate() : new Date(),
    atualizadoEm: data.atualizadoEm ? data.atualizadoEm.toDate() : new Date(),
    aprovadoPor: data.aprovadoPor,
    observacoes: data.observacoes,
  };
};

const buildFiltersQuery = (filters?: PremioFilters) => {
  const constraints: QueryConstraint[] = [];

  if (filters?.ano) {
    constraints.push(where("anoReferencia", "==", filters.ano));
  }

  if (filters?.mes) {
    constraints.push(where("mesReferencia", "==", filters.mes));
  }

  if (filters?.status) {
    constraints.push(where("status", "==", filters.status));
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

  constraints.push(orderBy("dataPremio", "desc"));

  return query(premiosCollection, ...constraints);
};

export const premioProdutividadeService = {
  async list(filters?: PremioFilters): Promise<PremioProdutividade[]> {
    const q = buildFiltersQuery(filters);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshotToPremio);
  },

  async create(data: PremioFormData): Promise<string> {
    const payload = {
      ...data,
      valor: Number(data.valor),
      mesReferencia: data.dataPremio.getMonth() + 1,
      anoReferencia: data.dataPremio.getFullYear(),
      dataPremio: Timestamp.fromDate(data.dataPremio),
      status: data.status,
      colaboradorNomeSearch: data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter(Boolean),
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await addDoc(premiosCollection, payload);
    return docRef.id;
  },

  async update(id: string, data: Partial<PremioFormData>): Promise<void> {
    const docRef = doc(premiosCollection, id);
    const payload: Record<string, unknown> = {
      ...data,
      atualizadoEm: Timestamp.now(),
    };

    if (data.dataPremio) {
      payload.dataPremio = Timestamp.fromDate(data.dataPremio);
      payload.mesReferencia = data.dataPremio.getMonth() + 1;
      payload.anoReferencia = data.dataPremio.getFullYear();
    }

    if (data.colaboradorNome) {
      payload.colaboradorNomeSearch = data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter(Boolean);
    }

    await updateDoc(docRef, payload);
  },

  async updateStatus(
    id: string,
    status: PremioStatus,
    aprovadoPor?: string
  ): Promise<void> {
    const docRef = doc(premiosCollection, id);
    await updateDoc(docRef, {
      status,
      aprovadoPor: aprovadoPor || null,
      atualizadoEm: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(premiosCollection, id);
    await deleteDoc(docRef);
  },

  async getHistoricoByColaborador(
    colaboradorId: string
  ): Promise<PremioProdutividade[]> {
    const q = query(
      premiosCollection,
      where("colaboradorId", "==", colaboradorId),
      orderBy("dataPremio", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshotToPremio);
  },

  async getStats(ano: number, mes: number): Promise<PremioStats> {
    const q = query(
      premiosCollection,
      where("anoReferencia", "==", ano),
      where("mesReferencia", "==", mes)
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(mapSnapshotToPremio);

    const totalPremiado = entries.reduce(
      (sum, premio) => sum + premio.valor,
      0
    );
    const pendente = entries
      .filter((p) => p.status === "Pendente")
      .reduce((sum, premio) => sum + premio.valor, 0);
    const emRevisao = entries
      .filter((p) => p.status === "Em revisão")
      .reduce((sum, premio) => sum + premio.valor, 0);
    const aprovados = entries
      .filter((p) => p.status === "Aprovado")
      .reduce((sum, premio) => sum + premio.valor, 0);

    return {
      totalPremiado,
      pendente,
      emRevisao,
      aprovados,
    };
  },

  async gerarRelatorioMensal(
    ano: number,
    mes: number
  ): Promise<RelatorioMensal> {
    const q = query(
      premiosCollection,
      where("anoReferencia", "==", ano),
      where("mesReferencia", "==", mes)
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(mapSnapshotToPremio);

    const totalPago = entries
      .filter((p) => p.status === "Aprovado")
      .reduce((sum, premio) => sum + premio.valor, 0);
    const totalPendente = entries
      .filter((p) => p.status === "Pendente")
      .reduce((sum, premio) => sum + premio.valor, 0);
    const totalEmRevisao = entries
      .filter((p) => p.status === "Em revisão")
      .reduce((sum, premio) => sum + premio.valor, 0);

    return {
      mes,
      ano,
      totalRegistros: entries.length,
      totalPago,
      totalPendente,
      totalEmRevisao,
    };
  },

  async exportarRelatorioCSV(ano: number, mes: number): Promise<Blob> {
    const q = query(
      premiosCollection,
      where("anoReferencia", "==", ano),
      where("mesReferencia", "==", mes),
      orderBy("dataPremio", "desc")
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(mapSnapshotToPremio);

    const header = [
      "Colaborador",
      "CPF",
      "Cargo",
      "Setor",
      "Valor",
      "Data",
      "Motivo",
      "Status",
    ];

    const rows = entries.map((entry) => [
      entry.colaboradorNome,
      entry.cpf,
      entry.cargo,
      entry.setor,
      entry.valor.toFixed(2).replace(".", ","),
      entry.dataPremio.toLocaleDateString("pt-BR"),
      entry.motivo.replace(/(\r\n|\n|\r)/gm, " "),
      entry.status,
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  },
};
