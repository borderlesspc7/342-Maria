/**
 * Serviço para gerenciamento de anexos
 * Nota: Este serviço usa armazenamento local via base64 por simplicidade.
 * Para produção, considere usar Firebase Storage ou S3.
 */

import type { Anexo } from "../types/boletimMedicao";

/**
 * Converte um arquivo para base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Faz upload de anexos (converte para base64 e armazena localmente)
 */
export async function uploadAnexos(files: File[]): Promise<Anexo[]> {
  const anexos: Anexo[] = [];

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);
      
      const anexo: Anexo = {
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: file.name,
        tipo: file.type,
        url: base64, // Em produção, seria a URL do Firebase Storage
        tamanho: file.size,
        dataUpload: new Date(),
      };

      anexos.push(anexo);
    } catch (error) {
      console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error);
      throw new Error(`Falha ao fazer upload de ${file.name}`);
    }
  }

  return anexos;
}

/**
 * Remove um anexo
 */
export async function removeAnexo(anexoId: string): Promise<void> {
  // Em produção, deletaria do Firebase Storage
  console.log("Anexo removido:", anexoId);
}

/**
 * Baixa um anexo
 */
export function downloadAnexo(anexo: Anexo): void {
  try {
    const link = document.createElement("a");
    link.href = anexo.url;
    link.download = anexo.nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erro ao baixar anexo:", error);
    throw new Error("Falha ao baixar anexo");
  }
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Valida tamanho de arquivo (máximo 5MB por arquivo)
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Valida tipo de arquivo permitido
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
): boolean {
  return allowedTypes.includes(file.type);
}
