import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiSearch,
  HiPencil,
  HiTrash,
  HiUserGroup,
} from "react-icons/hi";
import { Layout } from "../../components/Layout";
import { colaboradorService } from "../../services/colaboradorService";
import type {
  ColaboradorFormData,
  CreateColaboradorResult,
} from "../../services/colaboradorService";
import type { Colaborador } from "../../types/premioProdutividade";
import { maskCPF, unmaskCPF } from "../../utils/masks";
import { useToast } from "../../contexts/ToastContext";
import "./Colaboradores.css";

const LIST_LOAD_TIMEOUT_MS = 15000;

const Colaboradores: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingColaborador, setEditingColaborador] =
    useState<Colaborador | null>(null);

  const loadColaboradores = useCallback(async () => {
    setLoadError(false);
    setLoading(true);
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setColaboradores([]);
      setLoadError(true);
    }, LIST_LOAD_TIMEOUT_MS);
    try {
      const data = await colaboradorService.list(search || undefined);
      window.clearTimeout(timeoutId);
      setColaboradores(data);
    } catch (error) {
      window.clearTimeout(timeoutId);
      console.error("Erro ao carregar colaboradores:", error);
      setColaboradores([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadColaboradores();
  }, [loadColaboradores]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este colaborador?")) return;
    try {
      await colaboradorService.delete(id);
      await loadColaboradores();
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error);
      alert("Não foi possível excluir o colaborador.");
    }
  };

  return (
    <Layout>
      <div className="colaboradores-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Colaboradores</h1>
            <p className="page-subtitle">
              Cadastre e gerencie os colaboradores para lançamento de prêmios
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingColaborador(null);
              setShowModal(true);
            }}
          >
            <HiPlus />
            Novo colaborador
          </button>
        </div>

        <div className="filters-section">
          <div className="filters-header">
            <div className="search-box">
              <HiSearch />
              <input
                type="text"
                placeholder="Buscar por nome, CPF, cargo ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">Carregando colaboradores...</div>
          ) : colaboradores.length === 0 ? (
            <div className="empty-state">
              <HiUserGroup className="empty-icon" />
              <p>
                {loadError
                  ? "Não foi possível carregar a lista. Verifique sua conexão e tente novamente."
                  : search
                    ? "Nenhum colaborador encontrado para essa busca."
                    : "Nenhum colaborador cadastrado. Clique em Novo colaborador para começar."}
              </p>
            </div>
          ) : (
            <table className="colaboradores-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Cargo</th>
                  <th>Setor</th>
                  <th>E-mail</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((colab) => (
                  <tr key={colab.id}>
                    <td>
                      <strong>{colab.nome}</strong>
                    </td>
                    <td>{maskCPF(colab.cpf)}</td>
                    <td>{colab.cargo}</td>
                    <td>{colab.setor}</td>
                    <td>{colab.email || "—"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setEditingColaborador(colab);
                            setShowModal(true);
                          }}
                          title="Editar"
                        >
                          <HiPencil />
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDelete(colab.id)}
                          title="Excluir"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <ColaboradorModal
            colaborador={editingColaborador}
            onClose={() => {
              setShowModal(false);
              setEditingColaborador(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingColaborador(null);
              loadColaboradores();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

interface ColaboradorModalProps {
  colaborador: Colaborador | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ColaboradorModal: React.FC<ColaboradorModalProps> = ({
  colaborador,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const submittedRef = React.useRef(false);
  const [formData, setFormData] = useState({
    nome: colaborador?.nome ?? "",
    cpf: maskCPF(colaborador?.cpf ?? ""),
    cargo: colaborador?.cargo ?? "",
    setor: colaborador?.setor ?? "",
    email: colaborador?.email ?? "",
    admissao:
      colaborador?.admissao != null
        ? new Date(colaborador.admissao).toISOString().split("T")[0]
        : "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        cpf: maskCPF(colaborador.cpf),
        cargo: colaborador.cargo,
        setor: colaborador.setor,
        email: colaborador.email ?? "",
        admissao:
          colaborador.admissao != null
            ? new Date(colaborador.admissao).toISOString().split("T")[0]
            : "",
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        cargo: "",
        setor: "",
        email: "",
        admissao: "",
      });
    }
  }, [colaborador]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      setFormData((prev) => ({ ...prev, cpf: maskCPF(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);
    try {
      const data: ColaboradorFormData = {
        nome: formData.nome.trim(),
        cpf: unmaskCPF(formData.cpf),
        cargo: formData.cargo.trim(),
        setor: formData.setor.trim(),
        email: formData.email.trim() || undefined,
        admissao: formData.admissao
          ? new Date(formData.admissao)
          : undefined,
      };
      if (colaborador) {
        await colaboradorService.update(colaborador.id, data);
        showToast("Colaborador atualizado com sucesso!");
        onSuccess();
      } else {
        const result: CreateColaboradorResult =
          await colaboradorService.create(data);
        if (result.savedLocally) {
          showToast(
            "Colaborador salvo localmente. Será sincronizado quando a conexão estiver disponível.",
            "info"
          );
        } else {
          showToast("Colaborador cadastrado com sucesso!");
        }
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);
      submittedRef.current = false;
      showToast(
        "Não foi possível salvar o colaborador. Verifique os dados e tente novamente.",
        "error"
      );
    } finally {
      setSaving(false);
      submittedRef.current = false;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {colaborador ? "Editar colaborador" : "Novo colaborador"}
          </h2>
          <button type="button" className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Nome *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome completo"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div className="form-group">
              <label>Cargo *</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                required
                placeholder="Cargo"
              />
            </div>
            <div className="form-group">
              <label>Setor *</label>
              <input
                type="text"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                required
                placeholder="Setor"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full-width">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@empresa.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Data de admissão</label>
              <input
                type="date"
                name="admissao"
                value={formData.admissao}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Salvando..." : colaborador ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Colaboradores;
