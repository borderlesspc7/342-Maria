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
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Colaborador } from "../types/premioProdutividade";

const LOCAL_STORAGE_KEY = "colaboradores_local";
const CREATE_TIMEOUT_MS = 3000;

function getColaboradoresCollection() {
  return collection(db, "colaboradores");
}

function isFirebaseConfigured(): boolean {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return typeof projectId === "string" && projectId.trim().length > 0;
}

function mapSnapshotToColaborador(
  snapshot: QueryDocumentSnapshot<DocumentData> 
): Colaborador {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    nome: data.nome ?? "",
    cpf: data.cpf ?? "",
    cargo: data.cargo ?? "",
    setor: data.setor ?? "",
    email: data.email,
    admissao: data.admissao?.toDate?.() ? data.admissao.toDate() : undefined,
  };
}

function getLocalColaboradores(): Colaborador[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      nome: string;
      cpf: string;
      cargo: string;
      setor: string;
      email?: string;
      admissao?: string;
    }>;
    return parsed.map((c) => ({
      ...c,
      admissao: c.admissao ? new Date(c.admissao) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveLocalColaborador(colab: Colaborador): void {
  const list = getLocalColaboradores();
  const index = list.findIndex((c) => c.id === colab.id);
  if (index >= 0) {
    list[index] = colab;
  } else {
    list.push(colab);
  }
  const toSave = list.map((c) => ({
    id: c.id,
    nome: c.nome,
    cpf: c.cpf,
    cargo: c.cargo,
    setor: c.setor,
    email: c.email,
    admissao: c.admissao instanceof Date ? c.admissao.toISOString() : undefined,
  }));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
}

function removeLocalColaborador(id: string): void {
  const list = getLocalColaboradores().filter((c) => c.id !== id);
  const toSave = list.map((c) => ({
    id: c.id,
    nome: c.nome,
    cpf: c.cpf,
    cargo: c.cargo,
    setor: c.setor,
    email: c.email,
    admissao: c.admissao instanceof Date ? c.admissao.toISOString() : undefined,
  }));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
}

function timeoutPromise<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
}

export interface ColaboradorFormData {
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  email?: string;
  admissao?: Date;
}

export const colaboradorService = {
  async list(nomeBusca?: string): Promise<Colaborador[]> {
    let list: Colaborador[] = [];
    if (isFirebaseConfigured()) {
      try {
        const q = query(
          getColaboradoresCollection(),
          orderBy("nome", "asc")
        );
        const snapshot = await getDocs(q);
        list = snapshot.docs.map(mapSnapshotToColaborador);
      } catch {
        list = [];
      }
    }
    const local = getLocalColaboradores();
    const merged = [...list];
    for (const c of local) {
      if (!merged.some((m) => m.id === c.id)) merged.push(c);
    }
    merged.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (nomeBusca?.trim()) {
      const term = nomeBusca.trim().toLowerCase();
      return merged.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          c.cpf.replace(/\D/g, "").includes(term.replace(/\D/g, "")) ||
          c.cargo.toLowerCase().includes(term) ||
          c.setor.toLowerCase().includes(term)
      );
    }
    return merged;
  },

  async getById(id: string): Promise<Colaborador | null> {
    if (!isFirebaseConfigured()) return null;
    const docRef = doc(getColaboradoresCollection(), id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapSnapshotToColaborador(snap as QueryDocumentSnapshot<DocumentData>);
  },

  async create(data: ColaboradorFormData): Promise<string> {
    const newColab: Colaborador = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      nome: data.nome.trim(),
      cpf: data.cpf.trim(),
      cargo: data.cargo.trim(),
      setor: data.setor.trim(),
      email: data.email?.trim(),
      admissao: data.admissao,
    };

    // Sem Firebase configurado: salva só no localStorage e retorna na hora
    if (!isFirebaseConfigured()) {
      saveLocalColaborador(newColab);
      return newColab.id;
    }

    const firestoreCreate = (): Promise<string> => {
      const payload = {
        nome: newColab.nome,
        cpf: newColab.cpf,
        cargo: newColab.cargo,
        setor: newColab.setor,
        email: newColab.email ?? null,
        admissao: data.admissao ? Timestamp.fromDate(data.admissao) : null,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      };
      return addDoc(getColaboradoresCollection(), payload).then((docRef) => docRef.id);
    };

    try {
      const id = await Promise.race([
        firestoreCreate(),
        timeoutPromise<string>(CREATE_TIMEOUT_MS, "timeout"),
      ]);
      return id;
    } catch (_err) {
      saveLocalColaborador(newColab);
      return newColab.id;
    }
  },

  async update(id: string, data: Partial<ColaboradorFormData>): Promise<void> {
    if (id.startsWith("local-")) {
      const local = getLocalColaboradores();
      const item = local.find((c) => c.id === id);
      if (item) {
        if (data.nome !== undefined) item.nome = data.nome.trim();
        if (data.cpf !== undefined) item.cpf = data.cpf.trim();
        if (data.cargo !== undefined) item.cargo = data.cargo.trim();
        if (data.setor !== undefined) item.setor = data.setor.trim();
        if (data.email !== undefined) item.email = data.email?.trim();
        if (data.admissao !== undefined) item.admissao = data.admissao;
        saveLocalColaborador(item);
      }
      return;
    }
    const docRef = doc(getColaboradoresCollection(), id);
    const payload: Record<string, unknown> = {
      atualizadoEm: Timestamp.now(),
    };
    if (data.nome !== undefined) payload.nome = data.nome.trim();
    if (data.cpf !== undefined) payload.cpf = data.cpf.trim();
    if (data.cargo !== undefined) payload.cargo = data.cargo.trim();
    if (data.setor !== undefined) payload.setor = data.setor.trim();
    if (data.email !== undefined) payload.email = data.email?.trim() || null;
    if (data.admissao !== undefined)
      payload.admissao = data.admissao ? Timestamp.fromDate(data.admissao) : null;
    await updateDoc(docRef, payload);
  },

  async delete(id: string): Promise<void> {
    if (id.startsWith("local-")) {
      removeLocalColaborador(id);
      return;
    }
    const docRef = doc(getColaboradoresCollection(), id);
    await deleteDoc(docRef);
  },
};
