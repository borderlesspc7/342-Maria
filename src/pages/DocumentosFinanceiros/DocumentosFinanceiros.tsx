// src/pages/DocumentosFinanceiros/DocumentosFinanceiros.tsx

import React, { useState, useEffect } from "react";
import {
  HiDocumentText,
  HiUpload,
  HiX,
  HiDownload,
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiFilter,
} from "react-icons/hi";
import { documentosFinanceirosService } from "../../services/documentosFinanceirosService";
import { useAuth } from "../../hooks/useAuth";
import type {
  NotaFiscal,
  ComprovanteBancario,
  NotaFiscalFormData,
  ComprovanteBancarioFormData,
} from "../../types/documentosFinanceiros";
import { Layout } from "../../components/Layout";
import "./DocumentosFinanceiros.css";

const DocumentosFinanceiros: React.FC = () => {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<"notas" | "comprovantes">("notas");
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [comprovantes, setComprovantes] = useState<ComprovanteBancario[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados do formulário de Nota Fiscal
  const [formNotaFiscal, setFormNotaFiscal] = useState<
    Omit<NotaFiscalFormData, "arquivo"> & { arquivo: File | null }
  >({
    numero: "",
    fornecedor: "",
    valor: 0,
    dataEmissao: new Date(),
    tipo: "entrada",
    categoria: "",
    arquivo: null,
  });

  // Estados do formulário de Comprovante
  const [formComprovante, setFormComprovante] = useState<
    Omit<ComprovanteBancarioFormData, "arquivo"> & { arquivo: File | null }
  >({
    tipo: "pagamento",
    banco: "",
    valor: 0,
    dataTransacao: new Date(),
    beneficiario: "",
    descricao: "",
    arquivo: null,
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (abaAtiva === "notas") {
        const notas = await documentosFinanceirosService.listarNotasFiscais();
        setNotasFiscais(notas);
      } else {
        const comprovantesList =
          await documentosFinanceirosService.listarComprovantesBancarios();
        setComprovantes(comprovantesList);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNotaFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formNotaFiscal.arquivo) return;

    setLoading(true);
    try {
      await documentosFinanceirosService.criarNotaFiscal(
        {
          ...formNotaFiscal,
          arquivo: formNotaFiscal.arquivo,
        },
        user.uid
      );
      setFormNotaFiscal({
        numero: "",
        fornecedor: "",
        valor: 0,
        dataEmissao: new Date(),
        tipo: "entrada",
        categoria: "",
        arquivo: null,
      });
      setMostrarFormulario(false);
      await carregarDados();
      alert("Nota fiscal cadastrada com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar nota fiscal:", error);
      alert("Erro ao cadastrar nota fiscal");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComprovante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formComprovante.arquivo) return;

    setLoading(true);
    try {
      await documentosFinanceirosService.criarComprovanteBancario(
        {
          ...formComprovante,
          arquivo: formComprovante.arquivo,
        },
        user.uid
      );
      setFormComprovante({
        tipo: "pagamento",
        banco: "",
        valor: 0,
        dataTransacao: new Date(),
        beneficiario: "",
        descricao: "",
        arquivo: null,
      });
      setMostrarFormulario(false);
      await carregarDados();
      alert("Comprovante bancário cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar comprovante:", error);
      alert("Erro ao cadastrar comprovante bancário");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarNotaFiscal = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta nota fiscal?")) return;

    try {
      await documentosFinanceirosService.deletarNotaFiscal(id);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao deletar nota fiscal:", error);
      alert("Erro ao deletar nota fiscal");
    }
  };

  const handleDeletarComprovante = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este comprovante?")) return;

    try {
      await documentosFinanceirosService.deletarComprovanteBancario(id);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao deletar comprovante:", error);
      alert("Erro ao deletar comprovante");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <HiCheckCircle className="status-icon approved" />;
      case "rejeitado":
        return <HiXCircle className="status-icon rejected" />;
      default:
        return <HiClock className="status-icon pending" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Pendente";
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <Layout>
      <div className="documentos-financeiros-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-title-section">
              <HiDocumentText className="page-icon" />
              <div>
                <h1>Documentos Financeiros</h1>
                <p className="page-subtitle">
                  Gerencie notas fiscais e comprovantes bancários
                </p>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn-secondary"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <HiFilter />
                Filtros
              </button>
              <button
                className="btn-primary"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
              >
                <HiUpload />
                Novo Upload
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab ${abaAtiva === "notas" ? "active" : ""}`}
            onClick={() => setAbaAtiva("notas")}
          >
            <HiDocumentText />
            Notas Fiscais ({notasFiscais.length})
          </button>
          <button
            className={`tab ${abaAtiva === "comprovantes" ? "active" : ""}`}
            onClick={() => setAbaAtiva("comprovantes")}
          >
            <HiDocumentText />
            Comprovantes Bancários ({comprovantes.length})
          </button>
        </div>

        {/* Formulário de Upload */}
        {mostrarFormulario && (
          <div className="upload-form-container">
            <div className="form-header">
              <h3>
                {abaAtiva === "notas"
                  ? "Nova Nota Fiscal"
                  : "Novo Comprovante Bancário"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setMostrarFormulario(false)}
              >
                <HiX />
              </button>
            </div>

            {abaAtiva === "notas" ? (
              <form onSubmit={handleSubmitNotaFiscal} className="upload-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Número da Nota Fiscal *</label>
                    <input
                      type="text"
                      value={formNotaFiscal.numero}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          numero: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Série</label>
                    <input
                      type="text"
                      value={formNotaFiscal.serie || ""}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          serie: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fornecedor *</label>
                    <input
                      type="text"
                      value={formNotaFiscal.fornecedor}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          fornecedor: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CNPJ do Fornecedor</label>
                    <input
                      type="text"
                      value={formNotaFiscal.cnpjFornecedor || ""}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          cnpjFornecedor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formNotaFiscal.valor}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          valor: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      value={formNotaFiscal.tipo}
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          tipo: e.target.value as "entrada" | "saida",
                        })
                      }
                      required
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Data de Emissão *</label>
                    <input
                      type="date"
                      value={
                        formNotaFiscal.dataEmissao.toISOString().split("T")[0]
                      }
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          dataEmissao: new Date(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input
                      type="date"
                      value={
                        formNotaFiscal.dataVencimento
                          ? formNotaFiscal.dataVencimento
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          dataVencimento: e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Categoria *</label>
                  <input
                    type="text"
                    value={formNotaFiscal.categoria}
                    onChange={(e) =>
                      setFormNotaFiscal({
                        ...formNotaFiscal,
                        categoria: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    value={formNotaFiscal.descricao || ""}
                    onChange={(e) =>
                      setFormNotaFiscal({
                        ...formNotaFiscal,
                        descricao: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Arquivo (PDF/Imagem) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormNotaFiscal({
                          ...formNotaFiscal,
                          arquivo: file,
                        });
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitComprovante} className="upload-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Transação *</label>
                    <select
                      value={formComprovante.tipo}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          tipo: e.target.value as
                            | "deposito"
                            | "saque"
                            | "transferencia"
                            | "pagamento"
                            | "recebimento",
                        })
                      }
                      required
                    >
                      <option value="deposito">Depósito</option>
                      <option value="saque">Saque</option>
                      <option value="transferencia">Transferência</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="recebimento">Recebimento</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Banco *</label>
                    <input
                      type="text"
                      value={formComprovante.banco}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          banco: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Agência</label>
                    <input
                      type="text"
                      value={formComprovante.agencia || ""}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          agencia: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Conta</label>
                    <input
                      type="text"
                      value={formComprovante.conta || ""}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          conta: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formComprovante.valor}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          valor: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data da Transação *</label>
                    <input
                      type="date"
                      value={
                        formComprovante.dataTransacao
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          dataTransacao: new Date(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Beneficiário *</label>
                  <input
                    type="text"
                    value={formComprovante.beneficiario}
                    onChange={(e) =>
                      setFormComprovante({
                        ...formComprovante,
                        beneficiario: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CPF/CNPJ do Beneficiário</label>
                    <input
                      type="text"
                      value={formComprovante.cpfCnpjBeneficiario || ""}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          cpfCnpjBeneficiario: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Número do Documento</label>
                    <input
                      type="text"
                      value={formComprovante.numeroDocumento || ""}
                      onChange={(e) =>
                        setFormComprovante({
                          ...formComprovante,
                          numeroDocumento: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição *</label>
                  <textarea
                    value={formComprovante.descricao}
                    onChange={(e) =>
                      setFormComprovante({
                        ...formComprovante,
                        descricao: e.target.value,
                      })
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Arquivo (PDF/Imagem) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormComprovante({
                          ...formComprovante,
                          arquivo: file,
                        });
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Lista de Documentos */}
        <div className="documentos-lista">
          {loading && <div className="loading">Carregando...</div>}

          {abaAtiva === "notas" ? (
            notasFiscais.length === 0 ? (
              <div className="empty-state">
                <HiDocumentText />
                <p>Nenhuma nota fiscal cadastrada</p>
              </div>
            ) : (
              notasFiscais.map((nota) => (
                <div key={nota.id} className="documento-card">
                  <div className="documento-header">
                    <div className="documento-info">
                      <h3>NF {nota.numero}</h3>
                      <span className="documento-fornecedor">
                        {nota.fornecedor}
                      </span>
                    </div>
                    <div className="documento-status">
                      {getStatusIcon(nota.status)}
                      <span>{getStatusLabel(nota.status)}</span>
                    </div>
                  </div>
                  <div className="documento-body">
                    <div className="documento-detalhes">
                      <div>
                        <span className="label">Valor:</span>
                        <span className="value">
                          {formatarValor(nota.valor)}
                        </span>
                      </div>
                      <div>
                        <span className="label">Tipo:</span>
                        <span className="value">
                          {nota.tipo === "entrada" ? "Entrada" : "Saída"}
                        </span>
                      </div>
                      <div>
                        <span className="label">Categoria:</span>
                        <span className="value">{nota.categoria}</span>
                      </div>
                      <div>
                        <span className="label">Data Emissão:</span>
                        <span className="value">
                          {nota.dataEmissao.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="documento-actions">
                      <a
                        href={nota.arquivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action"
                      >
                        <HiEye />
                        Visualizar
                      </a>
                      <a
                        href={nota.arquivo.url}
                        download
                        className="btn-action"
                      >
                        <HiDownload />
                        Download
                      </a>
                      <button
                        className="btn-action danger"
                        onClick={() => handleDeletarNotaFiscal(nota.id)}
                      >
                        <HiX />
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : comprovantes.length === 0 ? (
            <div className="empty-state">
              <HiDocumentText />
              <p>Nenhum comprovante bancário cadastrado</p>
            </div>
          ) : (
            comprovantes.map((comprovante) => (
              <div key={comprovante.id} className="documento-card">
                <div className="documento-header">
                  <div className="documento-info">
                    <h3>
                      {comprovante.tipo === "deposito"
                        ? "Depósito"
                        : comprovante.tipo === "saque"
                        ? "Saque"
                        : comprovante.tipo === "transferencia"
                        ? "Transferência"
                        : comprovante.tipo === "pagamento"
                        ? "Pagamento"
                        : "Recebimento"}
                    </h3>
                    <span className="documento-fornecedor">
                      {comprovante.beneficiario}
                    </span>
                  </div>
                  <div className="documento-status">
                    {getStatusIcon(comprovante.status)}
                    <span>{getStatusLabel(comprovante.status)}</span>
                  </div>
                </div>
                <div className="documento-body">
                  <div className="documento-detalhes">
                    <div>
                      <span className="label">Valor:</span>
                      <span className="value">
                        {formatarValor(comprovante.valor)}
                      </span>
                    </div>
                    <div>
                      <span className="label">Banco:</span>
                      <span className="value">{comprovante.banco}</span>
                    </div>
                    <div>
                      <span className="label">Data:</span>
                      <span className="value">
                        {comprovante.dataTransacao.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="label">Descrição:</span>
                      <span className="value">{comprovante.descricao}</span>
                    </div>
                  </div>
                  <div className="documento-actions">
                    <a
                      href={comprovante.arquivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action"
                    >
                      <HiEye />
                      Visualizar
                    </a>
                    <a
                      href={comprovante.arquivo.url}
                      download
                      className="btn-action"
                    >
                      <HiDownload />
                      Download
                    </a>
                    <button
                      className="btn-action danger"
                      onClick={() => handleDeletarComprovante(comprovante.id)}
                    >
                      <HiX />
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DocumentosFinanceiros;
