import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
  Documento,
  DocumentoFormData,
  DocumentoFilters,
  DocumentoStats,
  StatusDocumento,
  TipoDocumento,
  Treinamento,
  TreinamentoFormData,
} from "../types/documentacoes";

const documentosCollection = collection(db, "documentacoes");
const treinamentosCollection = collection(db, "treinamentos");

const calcularStatusDocumento = (dataValidade: Date): StatusDocumento => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade);
  validade.setHours(0, 0, 0, 0);

  const diffTime = validade.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Vencido";
  if (diffDays <= 7) return "Vencendo";
  return "Válido";
};

const mapSnapshotToDocumento = (
  snapshot: QueryDocumentSnapshot<DocumentData>
): Documento => {
  const data = snapshot.data();
  const dataValidade = data.dataValidade
    ? data.dataValidade.toDate()
    : new Date();
  const status = calcularStatusDocumento(dataValidade);

  return {
    id: snapshot.id,
    colaboradorId: data.colaboradorId,
    colaboradorNome: data.colaboradorNome,
    cpf: data.cpf,
    cargo: data.cargo,
    setor: data.setor,
    tipoDocumento: data.tipoDocumento as TipoDocumento,
    numeroDocumento: data.numeroDocumento,
    orgaoEmissor: data.orgaoEmissor,
    dataEmissao: data.dataEmissao ? data.dataEmissao.toDate() : undefined,
    dataValidade,
    status,
    observacoes: data.observacoes,
    anexos: data.anexos || [],
    alertaEnviado: data.alertaEnviado || false,
    dataAlerta: data.dataAlerta ? data.dataAlerta.toDate() : undefined,
    criadoPor: data.criadoPor,
    criadoEm: data.criadoEm ? data.criadoEm.toDate() : new Date(),
    atualizadoEm: data.atualizadoEm ? data.atualizadoEm.toDate() : new Date(),
  };
};

const buildFiltersQuery = (filters?: DocumentoFilters) => {
  const constraints: QueryConstraint[] = [];

  if (filters?.colaboradorNome) {
    constraints.push(
      where(
        "colaboradorNomeSearch",
        "array-contains",
        filters.colaboradorNome.toLowerCase()
      )
    );
  }

  if (filters?.tipoDocumento) {
    constraints.push(where("tipoDocumento", "==", filters.tipoDocumento));
  }

  if (filters?.dataVencimentoInicio) {
    constraints.push(
      where(
        "dataValidade",
        ">=",
        Timestamp.fromDate(filters.dataVencimentoInicio)
      )
    );
  }

  if (filters?.dataVencimentoFim) {
    constraints.push(
      where("dataValidade", "<=", Timestamp.fromDate(filters.dataVencimentoFim))
    );
  }

  constraints.push(orderBy("dataValidade", "asc"));

  return query(documentosCollection, ...constraints);
};

export const documentacoesService = {
  async list(filters?: DocumentoFilters): Promise<Documento[]> {
    const q = buildFiltersQuery(filters);
    const snapshot = await getDocs(q);
    let documentos = snapshot.docs.map(mapSnapshotToDocumento);

    // Filtros adicionais que não podem ser feitos no Firestore
    if (filters?.status) {
      documentos = documentos.filter((d) => d.status === filters.status);
    }

    if (filters?.vencidos) {
      documentos = documentos.filter((d) => d.status === "Vencido");
    }

    if (filters?.vencendoEm7Dias) {
      documentos = documentos.filter((d) => d.status === "Vencendo");
    }

    if (filters?.vencendoEm30Dias) {
      const hoje = new Date();
      const trintaDias = new Date(hoje);
      trintaDias.setDate(trintaDias.getDate() + 30);
      documentos = documentos.filter(
        (d) =>
          d.dataValidade >= hoje &&
          d.dataValidade <= trintaDias &&
          d.status !== "Vencido"
      );
    }

    return documentos;
  },

  async create(data: DocumentoFormData, criadoPor: string): Promise<string> {
    const status = calcularStatusDocumento(data.dataValidade);

    const payload = {
      ...data,
      dataEmissao: data.dataEmissao
        ? Timestamp.fromDate(data.dataEmissao)
        : null,
      dataValidade: Timestamp.fromDate(data.dataValidade),
      status,
      colaboradorNomeSearch: data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 0),
      anexos: [],
      alertaEnviado: false,
      criadoPor,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await addDoc(documentosCollection, payload);
    return docRef.id;
  },

  async update(
    id: string,
    data: Partial<DocumentoFormData>
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      atualizadoEm: Timestamp.now(),
    };

    if (data.tipoDocumento) updateData.tipoDocumento = data.tipoDocumento;
    if (data.numeroDocumento !== undefined)
      updateData.numeroDocumento = data.numeroDocumento;
    if (data.orgaoEmissor !== undefined)
      updateData.orgaoEmissor = data.orgaoEmissor;
    if (data.dataEmissao !== undefined)
      updateData.dataEmissao = data.dataEmissao
        ? Timestamp.fromDate(data.dataEmissao)
        : null;
    if (data.dataValidade) {
      updateData.dataValidade = Timestamp.fromDate(data.dataValidade);
      updateData.status = calcularStatusDocumento(data.dataValidade);
    }
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes;
    if (data.colaboradorNome) {
      updateData.colaboradorNome = data.colaboradorNome;
      updateData.colaboradorNomeSearch = data.colaboradorNome
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 0);
    }
    if (data.cpf) updateData.cpf = data.cpf;
    if (data.cargo) updateData.cargo = data.cargo;
    if (data.setor) updateData.setor = data.setor;

    await updateDoc(doc(documentosCollection, id), updateData);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(documentosCollection, id));
  },

  async getStats(): Promise<DocumentoStats> {
    const snapshot = await getDocs(documentosCollection);
    const documentos = snapshot.docs.map(mapSnapshotToDocumento);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seteDias = new Date(hoje);
    seteDias.setDate(seteDias.getDate() + 7);
    const trintaDias = new Date(hoje);
    trintaDias.setDate(trintaDias.getDate() + 30);

    return {
      total: documentos.length,
      validos: documentos.filter(
        (d) =>
          d.status === "Válido" &&
          d.dataValidade > trintaDias
      ).length,
      vencidos: documentos.filter((d) => d.status === "Vencido").length,
      vencendoEm7Dias: documentos.filter(
        (d) =>
          d.status === "Vencendo" &&
          d.dataValidade >= hoje &&
          d.dataValidade <= seteDias
      ).length,
      vencendoEm30Dias: documentos.filter(
        (d) =>
          d.dataValidade >= hoje &&
          d.dataValidade <= trintaDias &&
          d.status !== "Vencido"
      ).length,
      pendentes: documentos.filter((d) => d.status === "Pendente").length,
    };
  },

  async getDocumentosVencidos(): Promise<Documento[]> {
    const snapshot = await getDocs(documentosCollection);
    const documentos = snapshot.docs.map(mapSnapshotToDocumento);
    return documentos.filter((d) => d.status === "Vencido");
  },

  async getDocumentosVencendo(): Promise<Documento[]> {
    const snapshot = await getDocs(documentosCollection);
    const documentos = snapshot.docs.map(mapSnapshotToDocumento);
    return documentos.filter((d) => d.status === "Vencendo");
  },

  async marcarAlertaEnviado(id: string): Promise<void> {
    await updateDoc(doc(documentosCollection, id), {
      alertaEnviado: true,
      dataAlerta: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    });
  },

  // Treinamentos
  async listTreinamentos(): Promise<Treinamento[]> {
    const q = query(treinamentosCollection, orderBy("dataInicio", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        titulo: data.titulo,
        descricao: data.descricao,
        dataInicio: data.dataInicio.toDate(),
        dataFim: data.dataFim.toDate(),
        colaboradores: data.colaboradores || [],
        tipoDocumento: data.tipoDocumento as TipoDocumento,
        status: data.status as Treinamento["status"],
        criadoEm: data.criadoEm.toDate(),
        atualizadoEm: data.atualizadoEm.toDate(),
      };
    });
  },

  async createTreinamento(
    data: TreinamentoFormData
  ): Promise<string> {
    const hoje = new Date();
    let status: Treinamento["status"] = "Agendado";
    if (data.dataInicio <= hoje && data.dataFim >= hoje) {
      status = "Em andamento";
    } else if (data.dataFim < hoje) {
      status = "Concluído";
    }

    const payload = {
      ...data,
      dataInicio: Timestamp.fromDate(data.dataInicio),
      dataFim: Timestamp.fromDate(data.dataFim),
      status,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await addDoc(treinamentosCollection, payload);
    return docRef.id;
  },

  async updateTreinamento(
    id: string,
    data: Partial<TreinamentoFormData>
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      atualizadoEm: Timestamp.now(),
    };

    if (data.titulo) updateData.titulo = data.titulo;
    if (data.descricao) updateData.descricao = data.descricao;
    if (data.dataInicio) {
      updateData.dataInicio = Timestamp.fromDate(data.dataInicio);
    }
    if (data.dataFim) {
      updateData.dataFim = Timestamp.fromDate(data.dataFim);
    }
    if (data.colaboradores) updateData.colaboradores = data.colaboradores;
    if (data.tipoDocumento) updateData.tipoDocumento = data.tipoDocumento;

    // Recalcular status
    const docRef = doc(treinamentosCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existing = docSnap.data();
      const dataInicio = data.dataInicio
        ? data.dataInicio
        : existing.dataInicio.toDate();
      const dataFim = data.dataFim
        ? data.dataFim
        : existing.dataFim.toDate();
      const hoje = new Date();

      if (dataInicio <= hoje && dataFim >= hoje) {
        updateData.status = "Em andamento";
      } else if (dataFim < hoje) {
        updateData.status = "Concluído";
      } else {
        updateData.status = "Agendado";
      }
    }

    await updateDoc(doc(treinamentosCollection, id), updateData);
  },

  async deleteTreinamento(id: string): Promise<void> {
    await deleteDoc(doc(treinamentosCollection, id));
  },
};

