import type {
  BoletimMedicao,
  BoletimMedicaoFormData,
  BoletimFilters,
  BoletimStats,
} from "../types/boletimMedicao";

// Mock data - será substituído por chamadas ao Firebase
const mockBoletins: BoletimMedicao[] = [
  {
    id: "1",
    numero: "BM-2024-001",
    cliente: "Construtora ABC Ltda",
    mesReferencia: "Outubro",
    anoReferencia: 2024,
    tipoServico: "Instalação",
    status: "Emitido",
    valor: 45000.0,
    dataEmissao: new Date("2024-10-15"),
    dataVencimento: new Date("2024-11-15"),
    observacoes: "Instalação completa do sistema elétrico",
    anexos: [],
    criadoPor: "user1",
    criadoEm: new Date("2024-10-15"),
    atualizadoEm: new Date("2024-10-15"),
  },
  {
    id: "2",
    numero: "BM-2024-002",
    cliente: "Empresa XYZ S.A.",
    mesReferencia: "Outubro",
    anoReferencia: 2024,
    tipoServico: "Manutenção",
    status: "Pendente",
    valor: 12500.0,
    dataEmissao: new Date("2024-10-20"),
    dataVencimento: new Date("2024-11-20"),
    observacoes: "Manutenção preventiva mensal",
    anexos: [],
    criadoPor: "user1",
    criadoEm: new Date("2024-10-20"),
    atualizadoEm: new Date("2024-10-20"),
  },
  {
    id: "3",
    numero: "BM-2024-003",
    cliente: "Construtora ABC Ltda",
    mesReferencia: "Setembro",
    anoReferencia: 2024,
    tipoServico: "Vistoria",
    status: "Aguardando assinatura",
    valor: 8500.0,
    dataEmissao: new Date("2024-09-28"),
    dataVencimento: new Date("2024-10-28"),
    observacoes: "Vistoria técnica completa",
    anexos: [],
    criadoPor: "user1",
    criadoEm: new Date("2024-09-28"),
    atualizadoEm: new Date("2024-09-28"),
  },
  {
    id: "4",
    numero: "BM-2024-004",
    cliente: "Construtora DEF",
    mesReferencia: "Outubro",
    anoReferencia: 2024,
    tipoServico: "Instalação",
    status: "Emitido",
    valor: 32000.0,
    dataEmissao: new Date("2024-10-10"),
    dataVencimento: new Date("2024-11-10"),
    observacoes: "",
    anexos: [],
    criadoPor: "user1",
    criadoEm: new Date("2024-10-10"),
    atualizadoEm: new Date("2024-10-10"),
  },
  {
    id: "5",
    numero: "BM-2024-005",
    cliente: "Empresa XYZ S.A.",
    mesReferencia: "Outubro",
    anoReferencia: 2024,
    tipoServico: "Manutenção",
    status: "Aguardando assinatura",
    valor: 15000.0,
    dataEmissao: new Date("2024-10-25"),
    dataVencimento: new Date("2024-11-25"),
    observacoes: "Manutenção corretiva",
    anexos: [],
    criadoPor: "user1",
    criadoEm: new Date("2024-10-25"),
    atualizadoEm: new Date("2024-10-25"),
  },
];

export const boletimMedicaoService = {
  async getAll(filters?: BoletimFilters): Promise<BoletimMedicao[]> {
    // Simula delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockBoletins];

    if (filters) {
      if (filters.mes) {
        filtered = filtered.filter((b) => b.mesReferencia === filters.mes);
      }
      if (filters.ano) {
        filtered = filtered.filter((b) => b.anoReferencia === filters.ano);
      }
      if (filters.cliente) {
        filtered = filtered.filter((b) =>
          b.cliente.toLowerCase().includes(filters.cliente!.toLowerCase())
        );
      }
      if (filters.tipoServico) {
        filtered = filtered.filter(
          (b) => b.tipoServico === filters.tipoServico
        );
      }
      if (filters.status) {
        filtered = filtered.filter((b) => b.status === filters.status);
      }
    }

    return filtered.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  },

  async getById(id: string): Promise<BoletimMedicao | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockBoletins.find((b) => b.id === id) || null;
  },

  async create(data: BoletimMedicaoFormData): Promise<BoletimMedicao> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const novoBoletim: BoletimMedicao = {
      id: Date.now().toString(),
      numero: `BM-${data.anoReferencia}-${String(
        mockBoletins.length + 1
      ).padStart(3, "0")}`,
      cliente: data.cliente,
      mesReferencia: data.mesReferencia,
      anoReferencia: data.anoReferencia,
      tipoServico: data.tipoServico,
      status: data.status,
      valor: data.valor,
      dataEmissao: data.dataEmissao,
      dataVencimento: data.dataVencimento,
      observacoes: data.observacoes,
      anexos: [],
      criadoPor: "current-user",
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockBoletins.push(novoBoletim);
    return novoBoletim;
  },

  async update(
    id: string,
    data: Partial<BoletimMedicaoFormData>
  ): Promise<BoletimMedicao> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockBoletins.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error("Boletim não encontrado");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { anexos, ...updateData } = data;
    const boletimAtualizado: BoletimMedicao = {
      ...mockBoletins[index],
      ...updateData,
      atualizadoEm: new Date(),
    };

    mockBoletins[index] = boletimAtualizado;
    return boletimAtualizado;
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockBoletins.findIndex((b) => b.id === id);
    if (index !== -1) {
      mockBoletins.splice(index, 1);
    }
  },

  async getStats(ano?: number, mes?: string): Promise<BoletimStats> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filtered = [...mockBoletins];

    if (ano) {
      filtered = filtered.filter((b) => b.anoReferencia === ano);
    }
    if (mes) {
      filtered = filtered.filter((b) => b.mesReferencia === mes);
    }

    const totalEmitidoMes = filtered
      .filter((b) => b.status === "Emitido")
      .reduce((sum, b) => sum + b.valor, 0);

    const saldoPendente = filtered
      .filter(
        (b) => b.status === "Pendente" || b.status === "Aguardando assinatura"
      )
      .reduce((sum, b) => sum + b.valor, 0);

    const aguardandoAssinatura = filtered.filter(
      (b) => b.status === "Aguardando assinatura"
    ).length;

    return {
      totalEmitidoMes,
      saldoPendente,
      totalBoletins: filtered.length,
      aguardandoAssinatura,
    };
  },
};
