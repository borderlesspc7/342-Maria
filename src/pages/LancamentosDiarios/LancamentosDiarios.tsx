import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../components/Layout";
import {
  HiPlus,
  HiSearch,
  HiFilter,
  HiDocumentText,
  HiCheckCircle,
  HiClock,
  HiPaperClip,
  HiPencil,
  HiTrash,
  HiX,
} from "react-icons/hi";
import { lancamentoDiarioService } from "../../services/lancamentoDiarioService";
import { useAuth } from "../../hooks/useAuth";
import type {
  LancamentoDiario,
  LancamentoFilters,
  LancamentoStatus,
  TipoMovimentacao,
  LancamentoFormData,
} from "../../types/lancamentoDiario";
import "./LancamentosDiarios.css";

const tipoMovimentacaoOptions: TipoMovimentacao[] = [
  "Serviço",
  "Pagamento",
  "Recebimento",
  "Outro",
];

const statusOptions: LancamentoStatus[] = ["Recebido", "Pendente"];

const LancamentosDiarios: React.FC = () => {
  const { user } = useAuth();
  const hoje = new Date();
  const [lancamentos, setLancamentos] = useState<LancamentoDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLancamento, setEditingLancamento] =
    useState<LancamentoDiario | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LancamentoFilters>({
    dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
    dataFim: hoje,
  });

  const loadLancamentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lancamentoDiarioService.list(filters);
      setLancamentos(data);
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
      alert("Não foi possível carregar os lançamentos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLancamentos();
  }, [loadLancamentos]);

  const handleFilterChange = (
    key: keyof LancamentoFilters,
    value: string | Date | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" || value === null ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      dataInicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataFim: hoje,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      return;
    }
    try {
      await lancamentoDiarioService.delete(id);
      await loadLancamentos();
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
      alert("Erro ao excluir lançamento");
    }
  };

  const handleStatusChange = async (id: string, status: LancamentoStatus) => {
    try {
      await lancamentoDiarioService.updateStatus(id, status);
      await loadLancamentos();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status");
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusClass = (status: LancamentoStatus) => {
    return status === "Recebido" ? "recebido" : "pendente";
  };

  const getTipoClass = (tipo: TipoMovimentacao) => {
    switch (tipo) {
      case "Serviço":
        return "servico";
      case "Pagamento":
        return "pagamento";
      case "Recebimento":
        return "recebimento";
      default:
        return "outro";
    }
  };

  return (
    <Layout>
      <div className="lancamentos-container">
        <div className="lancamentos-header">
          <div>
            <h1 className="lancamentos-title">Caderno Virtual</h1>
            <p className="lancamentos-subtitle">
              Registro de lançamentos e movimentações diárias
            </p>
          </div>
          <button
            className="lancamentos-btn-primary"
            onClick={() => {
              setEditingLancamento(null);
              setShowModal(true);
            }}
          >
            <HiPlus />
            Novo Lançamento
          </button>
        </div>

        <div className="lancamentos-filters-section">
          <div className="lancamentos-filters-header">
            <button
              className="lancamentos-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <HiFilter />
              Filtros
            </button>
            <div className="lancamentos-search">
              <HiSearch className="lancamentos-search-icon" />
              <input
                type="text"
                placeholder="Buscar por colaborador..."
                value={filters.colaboradorNome || ""}
                onChange={(e) =>
                  handleFilterChange("colaboradorNome", e.target.value)
                }
              />
            </div>
          </div>

          {showFilters && (
            <div className="lancamentos-filters-panel">
              <div className="lancamentos-filter-row">
                <div className="lancamentos-filter-group">
                  <label>Data Início</label>
                  <input
                    type="date"
                    value={
                      filters.dataInicio
                        ? filters.dataInicio.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "dataInicio",
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="lancamentos-filter-group">
                  <label>Data Fim</label>
                  <input
                    type="date"
                    value={
                      filters.dataFim
                        ? filters.dataFim.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "dataFim",
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className="lancamentos-filter-group">
                  <label>Tipo de Movimentação</label>
                  <select
                    value={filters.tipoMovimentacao || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "tipoMovimentacao",
                        e.target.value
                          ? (e.target.value as TipoMovimentacao)
                          : undefined
                      )
                    }
                  >
                    <option value="">Todos</option>
                    {tipoMovimentacaoOptions.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lancamentos-filter-group">
                  <label>Status</label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "status",
                        e.target.value
                          ? (e.target.value as LancamentoStatus)
                          : undefined
                      )
                    }
                  >
                    <option value="">Todos</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="lancamentos-clear-filters"
                onClick={clearFilters}
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        <div className="lancamentos-table-container">
          {loading ? (
            <div className="lancamentos-loading">Carregando lançamentos...</div>
          ) : lancamentos.length === 0 ? (
            <div className="lancamentos-empty">
              <HiDocumentText className="lancamentos-empty-icon" />
              <p>Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <table className="lancamentos-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Colaborador</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Lançado por</th>
                  <th>Anexos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((lancamento) => (
                  <tr key={lancamento.id}>
                    <td>{formatDateTime(lancamento.dataLancamento)}</td>
                    <td>
                      <span
                        className={`lancamentos-tipo-badge ${getTipoClass(
                          lancamento.tipoMovimentacao
                        )}`}
                      >
                        {lancamento.tipoMovimentacao}
                      </span>
                    </td>
                    <td className="lancamentos-descricao">
                      {lancamento.descricao}
                    </td>
                    <td>
                      {lancamento.colaboradorNome || "-"}
                    </td>
                    <td className="lancamentos-valor">
                      {formatCurrency(lancamento.valor)}
                    </td>
                    <td>
                      <span
                        className={`lancamentos-status-badge ${getStatusClass(
                          lancamento.status
                        )}`}
                      >
                        {lancamento.status}
                      </span>
                    </td>
                    <td>
                      <div className="lancamentos-criado-por">
                        <span>{lancamento.criadoPorNome}</span>
                        <small>{formatDateTime(lancamento.criadoEm)}</small>
                      </div>
                    </td>
                    <td>
                      {lancamento.anexos && lancamento.anexos.length > 0 ? (
                        <span className="lancamentos-anexos-count">
                          <HiPaperClip />
                          {lancamento.anexos.length}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="lancamentos-actions">
                        <button
                          className="lancamentos-action-btn"
                          title="Editar"
                          onClick={() => {
                            setEditingLancamento(lancamento);
                            setShowModal(true);
                          }}
                        >
                          <HiPencil />
                        </button>
                        <button
                          className="lancamentos-action-btn danger"
                          title="Excluir"
                          onClick={() => handleDelete(lancamento.id)}
                        >
                          <HiTrash />
                        </button>
                        {lancamento.status === "Pendente" && (
                          <button
                            className="lancamentos-action-btn success"
                            title="Marcar como recebido"
                            onClick={() =>
                              handleStatusChange(lancamento.id, "Recebido")
                            }
                          >
                            <HiCheckCircle />
                          </button>
                        )}
                        {lancamento.status === "Recebido" && (
                          <button
                            className="lancamentos-action-btn warning"
                            title="Marcar como pendente"
                            onClick={() =>
                              handleStatusChange(lancamento.id, "Pendente")
                            }
                          >
                            <HiClock />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <LancamentoModal
            lancamento={editingLancamento}
            onClose={() => {
              setShowModal(false);
              setEditingLancamento(null);
            }}
            onSuccess={async () => {
              setShowModal(false);
              setEditingLancamento(null);
              await loadLancamentos();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

interface LancamentoModalProps {
  lancamento: LancamentoDiario | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LancamentoModal: React.FC<LancamentoModalProps> = ({
  lancamento,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const hoje = new Date();
  const [formData, setFormData] = useState<LancamentoFormData>({
    tipoMovimentacao: lancamento?.tipoMovimentacao || "Serviço",
    descricao: lancamento?.descricao || "",
    valor: lancamento?.valor,
    status: lancamento?.status || "Pendente",
    dataLancamento: lancamento?.dataLancamento || hoje,
    colaboradorId: lancamento?.colaboradorId,
    colaboradorNome: lancamento?.colaboradorNome,
    observacoes: lancamento?.observacoes,
    anexos: [],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "valor"
          ? value === ""
            ? undefined
            : Number(value)
          : name === "dataLancamento"
          ? new Date(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        anexos: Array.from(e.target.files || []),
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    setSaving(true);
    try {
      if (lancamento) {
        await lancamentoDiarioService.update(lancamento.id, formData);
      } else {
        await lancamentoDiarioService.create(
          formData,
          user.uid,
          user.name
        );
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
      alert("Não foi possível salvar o lançamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lancamentos-modal-overlay" onClick={onClose}>
      <div
        className="lancamentos-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lancamentos-modal-header">
          <h2>
            {lancamento ? "Editar Lançamento" : "Novo Lançamento Diário"}
          </h2>
          <button className="lancamentos-modal-close" onClick={onClose}>
            <HiX />
          </button>
        </div>

        <form className="lancamentos-modal-form" onSubmit={handleSubmit}>
          <div className="lancamentos-modal-row">
            <div className="lancamentos-modal-group">
              <label>Tipo de Movimentação *</label>
              <select
                name="tipoMovimentacao"
                value={formData.tipoMovimentacao}
                onChange={handleChange}
                required
              >
                {tipoMovimentacaoOptions.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="lancamentos-modal-group">
              <label>Data do Lançamento *</label>
              <input
                type="date"
                name="dataLancamento"
                value={
                  formData.dataLancamento
                    ? new Date(formData.dataLancamento)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleChange}
                required
              />
            </div>

            <div className="lancamentos-modal-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lancamentos-modal-group">
            <label>Descrição *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              required
              placeholder="Descreva a movimentação..."
            />
          </div>

          <div className="lancamentos-modal-row">
            <div className="lancamentos-modal-group">
              <label>Valor (R$)</label>
              <input
                type="number"
                name="valor"
                min="0"
                step="0.01"
                value={formData.valor || ""}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="lancamentos-modal-group">
              <label>Colaborador</label>
              <input
                type="text"
                name="colaboradorNome"
                value={formData.colaboradorNome || ""}
                onChange={handleChange}
                placeholder="Nome do colaborador (opcional)"
              />
            </div>
          </div>

          <div className="lancamentos-modal-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="lancamentos-modal-group">
            <label>Anexar Comprovantes</label>
            <div className="lancamentos-file-upload">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                id="lancamentos-file-input"
              />
              <label
                htmlFor="lancamentos-file-input"
                className="lancamentos-file-label"
              >
                <HiPaperClip />
                Selecionar arquivos (PDF, OS, Boletos, etc.)
              </label>
              {formData.anexos.length > 0 && (
                <div className="lancamentos-file-list">
                  {formData.anexos.map((file, index) => (
                    <div key={index} className="lancamentos-file-item">
                      <HiDocumentText />
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="lancamentos-file-remove"
                      >
                        <HiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lancamentos-modal-info">
            <p>
              <strong>Lançado por:</strong> {user?.name || "Usuário"}
            </p>
            <p>
              <strong>Data/Hora:</strong> {new Date().toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="lancamentos-modal-actions">
            <button
              type="button"
              className="lancamentos-btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="lancamentos-btn-primary"
              disabled={saving}
            >
              {saving ? "Salvando..." : lancamento ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LancamentosDiarios;
