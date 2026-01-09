// src/services/documentosFinanceirosService.ts

import { db } from "../lib/firebaseconfig";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type {
  NotaFiscal,
  ComprovanteBancario,
  NotaFiscalFormData,
  ComprovanteBancarioFormData,
  DocumentoFinanceiroFilters,
} from "../types/documentosFinanceiros";

const NOTAS_FISCAIS_COLLECTION = "notas_fiscais";
const COMPROVANTES_COLLECTION = "comprovantes_bancarios";
const STORAGE_PATH = "documentos_financeiros";

// Converter Timestamp para Date
function convertTimestampToDate(data: DocumentData): DocumentData {
  if (!data) return data;
  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
    if (converted[key]?.dataUpload instanceof Timestamp) {
      converted[key].dataUpload = converted[key].dataUpload.toDate();
    }
  });
  return converted;
}

// Upload de arquivo para Firebase Storage
async function uploadArquivo(
  file: File,
  userId: string,
  tipo: string
): Promise<{
  id: string;
  nome: string;
  url: string;
  tamanho: number;
  tipo: string;
  dataUpload: Date;
}> {
  const storage = getStorage();
  const timestamp = Date.now();
  const nomeArquivo = `${tipo}_${userId}_${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${STORAGE_PATH}/${nomeArquivo}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    id: storageRef.name,
    nome: file.name,
    url,
    tamanho: file.size,
    tipo: file.type,
    dataUpload: new Date(),
  };
}

// Deletar arquivo do Storage
async function deletarArquivo(path: string): Promise<void> {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export const documentosFinanceirosService = {
  // ============== NOTAS FISCAIS ==============

  async criarNotaFiscal(
    data: NotaFiscalFormData,
    userId: string
  ): Promise<NotaFiscal> {
    try {
      // Upload do arquivo
      const arquivo = await uploadArquivo(data.arquivo, userId, "nota_fiscal");

      const notaFiscalData = {
        ...data,
        arquivo,
        status: "pendente" as const,
        criadoPor: userId,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const docRef = await addDoc(
        collection(db, NOTAS_FISCAIS_COLLECTION),
        notaFiscalData
      );

      return {
        id: docRef.id,
        ...notaFiscalData,
      } as NotaFiscal;
    } catch (error) {
      console.error("Erro ao criar nota fiscal:", error);
      throw new Error("Erro ao criar nota fiscal");
    }
  },

  async listarNotasFiscais(
    filters?: DocumentoFinanceiroFilters
  ): Promise<NotaFiscal[]> {
    try {
      let q = query(
        collection(db, NOTAS_FISCAIS_COLLECTION),
        orderBy("criadoEm", "desc")
      );

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters?.dataInicio) {
        q = query(q, where("dataEmissao", ">=", filters.dataInicio));
      }

      if (filters?.dataFim) {
        q = query(q, where("dataEmissao", "<=", filters.dataFim));
      }

      const snapshot = await getDocs(q);
      let notas = snapshot.docs.map((doc) => {
        const data = convertTimestampToDate(doc.data());
        return {
          id: doc.id,
          ...data,
        } as NotaFiscal;
      });

      // Filtros adicionais
      if (filters?.valorMin) {
        notas = notas.filter((n) => n.valor >= filters.valorMin!);
      }

      if (filters?.valorMax) {
        notas = notas.filter((n) => n.valor <= filters.valorMax!);
      }

      if (filters?.busca) {
        const buscaLower = filters.busca.toLowerCase();
        notas = notas.filter(
          (n) =>
            n.numero.toLowerCase().includes(buscaLower) ||
            n.fornecedor.toLowerCase().includes(buscaLower) ||
            n.descricao?.toLowerCase().includes(buscaLower)
        );
      }

      return notas;
    } catch (error) {
      console.error("Erro ao listar notas fiscais:", error);
      throw new Error("Erro ao listar notas fiscais");
    }
  },

  async atualizarNotaFiscal(
    id: string,
    data: Partial<NotaFiscal>
  ): Promise<void> {
    try {
      const docRef = doc(db, NOTAS_FISCAIS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        atualizadoEm: new Date(),
      });
    } catch (error) {
      console.error("Erro ao atualizar nota fiscal:", error);
      throw new Error("Erro ao atualizar nota fiscal");
    }
  },

  async deletarNotaFiscal(id: string): Promise<void> {
    try {
      const docRef = doc(db, NOTAS_FISCAIS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as NotaFiscal;
        // Deletar arquivo do storage
        if (data.arquivo?.id) {
          await deletarArquivo(`${STORAGE_PATH}/${data.arquivo.id}`);
        }
        // Deletar documento
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Erro ao deletar nota fiscal:", error);
      throw new Error("Erro ao deletar nota fiscal");
    }
  },

  // ============== COMPROVANTES BANCÁRIOS ==============

  async criarComprovanteBancario(
    data: ComprovanteBancarioFormData,
    userId: string
  ): Promise<ComprovanteBancario> {
    try {
      // Upload do arquivo
      const arquivo = await uploadArquivo(data.arquivo, userId, "comprovante");

      const comprovanteData = {
        ...data,
        arquivo,
        status: "pendente" as const,
        criadoPor: userId,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const docRef = await addDoc(
        collection(db, COMPROVANTES_COLLECTION),
        comprovanteData
      );

      return {
        id: docRef.id,
        ...comprovanteData,
      } as ComprovanteBancario;
    } catch (error) {
      console.error("Erro ao criar comprovante bancário:", error);
      throw new Error("Erro ao criar comprovante bancário");
    }
  },

  async listarComprovantesBancarios(
    filters?: DocumentoFinanceiroFilters
  ): Promise<ComprovanteBancario[]> {
    try {
      let q = query(
        collection(db, COMPROVANTES_COLLECTION),
        orderBy("criadoEm", "desc")
      );

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }

      if (filters?.dataInicio) {
        q = query(q, where("dataTransacao", ">=", filters.dataInicio));
      }

      if (filters?.dataFim) {
        q = query(q, where("dataTransacao", "<=", filters.dataFim));
      }

      const snapshot = await getDocs(q);
      let comprovantes = snapshot.docs.map((doc) => {
        const data = convertTimestampToDate(doc.data());
        return {
          id: doc.id,
          ...data,
        } as ComprovanteBancario;
      });

      // Filtros adicionais
      if (filters?.valorMin) {
        comprovantes = comprovantes.filter((c) => c.valor >= filters.valorMin!);
      }

      if (filters?.valorMax) {
        comprovantes = comprovantes.filter((c) => c.valor <= filters.valorMax!);
      }

      if (filters?.busca) {
        const buscaLower = filters.busca.toLowerCase();
        comprovantes = comprovantes.filter(
          (c) =>
            c.beneficiario.toLowerCase().includes(buscaLower) ||
            c.descricao.toLowerCase().includes(buscaLower) ||
            c.numeroDocumento?.toLowerCase().includes(buscaLower)
        );
      }

      return comprovantes;
    } catch (error) {
      console.error("Erro ao listar comprovantes bancários:", error);
      throw new Error("Erro ao listar comprovantes bancários");
    }
  },

  async atualizarComprovanteBancario(
    id: string,
    data: Partial<ComprovanteBancario>
  ): Promise<void> {
    try {
      const docRef = doc(db, COMPROVANTES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        atualizadoEm: new Date(),
      });
    } catch (error) {
      console.error("Erro ao atualizar comprovante bancário:", error);
      throw new Error("Erro ao atualizar comprovante bancário");
    }
  },

  async deletarComprovanteBancario(id: string): Promise<void> {
    try {
      const docRef = doc(db, COMPROVANTES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ComprovanteBancario;
        // Deletar arquivo do storage
        if (data.arquivo?.id) {
          await deletarArquivo(`${STORAGE_PATH}/${data.arquivo.id}`);
        }
        // Deletar documento
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Erro ao deletar comprovante bancário:", error);
      throw new Error("Erro ao deletar comprovante bancário");
    }
  },
};
