import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  RelatorioConsolidado,
  ResumoRelatorio,
  ResumoPremios,
  ResumoBoletins,
  ResumoDocumentacoes,
  ResumoRecebimentos,
} from "../types/relatorios";

const premiosCollection = collection(db, "premiosProdutividade");
const boletinsCollection = collection(db, "boletinsMedicao");
const lancamentosCollection = collection(db, "lancamentosDiarios");

export const relatoriosService = {
  async gerarRelatorioConsolidado(
    mes: number,
    ano: number
  ): Promise<RelatorioConsolidado> {
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    const [premiosData, boletinsData, lancamentosData] = await Promise.all([
      this.getPremiosPorPeriodo(inicioMes, fimMes),
      this.getBoletinsPorPeriodo(inicioMes, fimMes),
      this.getRecebimentosPorPeriodo(inicioMes, fimMes),
    ]);

    const resumoPremios: ResumoPremios = {
      quantidade: premiosData.length,
      valorTotal: premiosData.reduce((sum, p) => sum + p.valor, 0),
      aprovados: premiosData.filter((p) => p.status === "Aprovado").length,
      pendentes: premiosData.filter((p) => p.status === "Pendente").length,
      emRevisao: premiosData.filter((p) => p.status === "Em revisão").length,
    };

    const resumoBoletins: ResumoBoletins = {
      quantidade: boletinsData.length,
      valorTotal: boletinsData.reduce((sum, b) => sum + b.valor, 0),
      emitidos: boletinsData.filter((b) => b.status === "Emitido").length,
      pendentes: boletinsData.filter((b) => b.status === "Pendente").length,
      aguardandoAssinatura: boletinsData.filter(
        (b) => b.status === "Aguardando assinatura"
      ).length,
    };

    const resumoRecebimentos: ResumoRecebimentos = {
      quantidade: lancamentosData.filter(
        (l) => l.tipoMovimentacao === "Recebimento"
      ).length,
      valorTotal: lancamentosData
        .filter((l) => l.tipoMovimentacao === "Recebimento")
        .reduce((sum, l) => sum + l.valor, 0),
      recebidos: lancamentosData.filter(
        (l) => l.tipoMovimentacao === "Recebimento" && l.status === "Recebido"
      ).length,
      pendentes: lancamentosData.filter(
        (l) => l.tipoMovimentacao === "Recebimento" && l.status === "Pendente"
      ).length,
    };

    const resumoDocumentacoes: ResumoDocumentacoes = {
      total: 0,
      vencidas: 0,
      vencendoEm7Dias: 0,
      vencendoEm30Dias: 0,
      emDia: 0,
    };

    const resumo: ResumoRelatorio = {
      totalPremiosPagos: resumoPremios.valorTotal,
      totalBoletinsEmitidos: resumoBoletins.valorTotal,
      totalDocumentacoesVencidas: 0,
      totalRecebimentos: resumoRecebimentos.valorTotal,
      totalGeral:
        resumoPremios.valorTotal +
        resumoBoletins.valorTotal +
        resumoRecebimentos.valorTotal,
    };

    return {
      id: `relatorio-${ano}-${mes}`,
      mes,
      ano,
      dataGeracao: new Date(),
      geradoPor: "current-user",
      geradoPorNome: "Usuário",
      resumo,
      premios: resumoPremios,
      boletins: resumoBoletins,
      documentacoes: resumoDocumentacoes,
      recebimentos: resumoRecebimentos,
    };
  },

  async getPremiosPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<Array<{ valor: number; status: string }>> {
    const q = query(
      premiosCollection,
      where("dataPremio", ">=", Timestamp.fromDate(dataInicio)),
      where("dataPremio", "<=", Timestamp.fromDate(dataFim)),
      orderBy("dataPremio", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        valor: data.valor || 0,
        status: data.status || "Pendente",
      };
    });
  },

  async getBoletinsPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<Array<{ valor: number; status: string }>> {
    const q = query(
      boletinsCollection,
      where("dataEmissao", ">=", Timestamp.fromDate(dataInicio)),
      where("dataEmissao", "<=", Timestamp.fromDate(dataFim)),
      orderBy("dataEmissao", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        valor: data.valor || 0,
        status: data.status || "Pendente",
      };
    });
  },

  async getRecebimentosPorPeriodo(
    dataInicio: Date,
    dataFim: Date
  ): Promise<
    Array<{ valor: number; status: string; tipoMovimentacao: string }>
  > {
    const q = query(
      lancamentosCollection,
      where("dataLancamento", ">=", Timestamp.fromDate(dataInicio)),
      where("dataLancamento", "<=", Timestamp.fromDate(dataFim)),
      orderBy("dataLancamento", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        valor: data.valor || 0,
        status: data.status || "Pendente",
        tipoMovimentacao: data.tipoMovimentacao || "Outro",
      };
    });
  },

  async exportarRelatorioPDF(relatorio: RelatorioConsolidado): Promise<Blob> {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Consolidado - ${meses[relatorio.mes - 1]}/${
      relatorio.ano
    }</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #667eea; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #667eea; color: white; }
            .summary { background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .total { font-weight: bold; font-size: 18px; color: #667eea; }
          </style>
        </head>
        <body>
          <h1>Relatório Consolidado Mensal</h1>
          <p><strong>Período:</strong> ${meses[relatorio.mes - 1]}/${
      relatorio.ano
    }</p>
          <p><strong>Data de Geração:</strong> ${new Date(
            relatorio.dataGeracao
          ).toLocaleDateString("pt-BR")}</p>
          <p><strong>Gerado por:</strong> ${relatorio.geradoPorNome}</p>
          
          <div class="summary">
            <h2>Resumo Geral</h2>
            <p>Total de Prêmios Pagos: ${formatCurrency(
              relatorio.resumo.totalPremiosPagos
            )}</p>
            <p>Total de Boletins Emitidos: ${formatCurrency(
              relatorio.resumo.totalBoletinsEmitidos
            )}</p>
            <p>Total de Recebimentos: ${formatCurrency(
              relatorio.resumo.totalRecebimentos
            )}</p>
            <p class="total">Total Geral: ${formatCurrency(
              relatorio.resumo.totalGeral
            )}</p>
          </div>
  
          <h2>Prêmios de Produtividade</h2>
          <table>
            <tr>
              <th>Quantidade</th>
              <th>Valor Total</th>
              <th>Aprovados</th>
              <th>Pendentes</th>
              <th>Em Revisão</th>
            </tr>
            <tr>
              <td>${relatorio.premios.quantidade}</td>
              <td>${formatCurrency(relatorio.premios.valorTotal)}</td>
              <td>${relatorio.premios.aprovados}</td>
              <td>${relatorio.premios.pendentes}</td>
              <td>${relatorio.premios.emRevisao}</td>
            </tr>
          </table>
  
          <h2>Boletins de Medição</h2>
          <table>
            <tr>
              <th>Quantidade</th>
              <th>Valor Total</th>
              <th>Emitidos</th>
              <th>Pendentes</th>
              <th>Aguardando Assinatura</th>
            </tr>
            <tr>
              <td>${relatorio.boletins.quantidade}</td>
              <td>${formatCurrency(relatorio.boletins.valorTotal)}</td>
              <td>${relatorio.boletins.emitidos}</td>
              <td>${relatorio.boletins.pendentes}</td>
              <td>${relatorio.boletins.aguardandoAssinatura}</td>
            </tr>
          </table>
  
          <h2>Recebimentos</h2>
          <table>
            <tr>
              <th>Quantidade</th>
              <th>Valor Total</th>
              <th>Recebidos</th>
              <th>Pendentes</th>
            </tr>
            <tr>
              <td>${relatorio.recebimentos.quantidade}</td>
              <td>${formatCurrency(relatorio.recebimentos.valorTotal)}</td>
              <td>${relatorio.recebimentos.recebidos}</td>
              <td>${relatorio.recebimentos.pendentes}</td>
            </tr>
          </table>
        </body>
        </html>
      `;

    return new Blob([htmlContent], { type: "text/html" });
  },

  async exportarRelatorioExcel(relatorio: RelatorioConsolidado): Promise<Blob> {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const formatCurrency = (value: number) =>
      value.toFixed(2).replace(".", ",");

    const rows = [
      ["Relatório Consolidado Mensal"],
      [`Período: ${meses[relatorio.mes - 1]}/${relatorio.ano}`],
      [
        `Data de Geração: ${new Date(relatorio.dataGeracao).toLocaleDateString(
          "pt-BR"
        )}`,
      ],
      [`Gerado por: ${relatorio.geradoPorNome}`],
      [],
      ["RESUMO GERAL"],
      [
        "Total de Prêmios Pagos",
        formatCurrency(relatorio.resumo.totalPremiosPagos),
      ],
      [
        "Total de Boletins Emitidos",
        formatCurrency(relatorio.resumo.totalBoletinsEmitidos),
      ],
      [
        "Total de Recebimentos",
        formatCurrency(relatorio.resumo.totalRecebimentos),
      ],
      ["TOTAL GERAL", formatCurrency(relatorio.resumo.totalGeral)],
      [],
      ["PRÊMIOS DE PRODUTIVIDADE"],
      ["Quantidade", "Valor Total", "Aprovados", "Pendentes", "Em Revisão"],
      [
        relatorio.premios.quantidade.toString(),
        formatCurrency(relatorio.premios.valorTotal),
        relatorio.premios.aprovados.toString(),
        relatorio.premios.pendentes.toString(),
        relatorio.premios.emRevisao.toString(),
      ],
      [],
      ["BOLETINS DE MEDIÇÃO"],
      [
        "Quantidade",
        "Valor Total",
        "Emitidos",
        "Pendentes",
        "Aguardando Assinatura",
      ],
      [
        relatorio.boletins.quantidade.toString(),
        formatCurrency(relatorio.boletins.valorTotal),
        relatorio.boletins.emitidos.toString(),
        relatorio.boletins.pendentes.toString(),
        relatorio.boletins.aguardandoAssinatura.toString(),
      ],
      [],
      ["RECEBIMENTOS"],
      ["Quantidade", "Valor Total", "Recebidos", "Pendentes"],
      [
        relatorio.recebimentos.quantidade.toString(),
        formatCurrency(relatorio.recebimentos.valorTotal),
        relatorio.recebimentos.recebidos.toString(),
        relatorio.recebimentos.pendentes.toString(),
      ],
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    return new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  },
};
