/**
 * Utilitários para exportação de dados (PDF, Excel, CSV)
 */

/**
 * Exporta dados para CSV
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    alert("Não há dados para exportar");
    return;
  }

  // Determinar colunas (usa headers customizados ou todas as chaves do primeiro item)
  const columns = headers
    ? Object.keys(headers)
    : Object.keys(data[0]);

  // Cabeçalhos
  const headerLabels = headers
    ? Object.values(headers)
    : columns;

  // Linhas de dados
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col];
      
      // Formatar valores especiais
      if (value instanceof Date) {
        return value.toLocaleDateString("pt-BR");
      }
      if (typeof value === "number") {
        return value.toString().replace(".", ",");
      }
      if (value === null || value === undefined) {
        return "";
      }
      
      // Escapar vírgulas e quebras de linha
      const str = String(value).replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
      return str;
    })
  );

  // Montar CSV
  const csvContent = [headerLabels, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(";"))
    .join("\n");

  // Download
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados para Excel (formato simples via CSV com BOM UTF-8)
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  headers?: Record<string, string>
): void {
  exportToCSV(data, filename, headers);
}

/**
 * Gera PDF simples (básico) com tabela de dados
 * Nota: Para PDFs mais complexos, considere usar bibliotecas como jsPDF ou pdfmake
 */
export function exportToPDF(
  data: Record<string, any>[],
  _filename: string,
  title: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    alert("Não há dados para exportar");
    return;
  }

  // Determinar colunas
  const columns = headers ? Object.keys(headers) : Object.keys(data[0]);
  const headerLabels = headers ? Object.values(headers) : columns;

  // Criar HTML da tabela
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          background: white;
        }
        h1 {
          color: #1a202c;
          margin-bottom: 24px;
          font-size: 24px;
        }
        .meta {
          color: #718096;
          font-size: 14px;
          margin-bottom: 32px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        thead {
          background: #f7fafc;
        }
        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #4a5568;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 12px;
          font-size: 14px;
          color: #2d3748;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
          background: #f7fafc;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          color: #718096;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">
        Gerado em: ${new Date().toLocaleString("pt-BR")}<br>
        Total de registros: ${data.length}
      </div>
      <table>
        <thead>
          <tr>
            ${headerLabels.map((h) => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (item) =>
                `<tr>${columns
                  .map((col) => {
                    const value = item[col];
                    let formatted = "";
                    
                    if (value instanceof Date) {
                      formatted = value.toLocaleDateString("pt-BR");
                    } else if (typeof value === "number") {
                      formatted = value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    } else {
                      formatted = String(value || "");
                    }
                    
                    return `<td>${formatted}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="footer">
        © ${new Date().getFullYear()} Sistema de Gestão RH. Todos os direitos reservados.
      </div>
    </body>
    </html>
  `;

  // Abrir em nova janela e imprimir
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Bloqueador de pop-ups ativo. Permita pop-ups para exportar PDF.");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Aguardar carregamento e imprimir
  printWindow.setTimeout(() => {
    printWindow.print();
  }, 250);
}

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}
