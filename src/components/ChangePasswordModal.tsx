import { useState } from 'react';
import { Modal } from './modal/Modal';
import { useAuth } from '../contexts/AuthContext';
import './ChangePasswordModal.css'; // Importar o CSS do modal

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ isOpen, onClose }: Props) {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setError(null);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.');
      setSuccess(false);
    }
  }

  return (
    <Modal title="Alterar senha" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="change-password-form">
        <label>
          Senha atual
          <input
            type="password"
            placeholder="Digite sua senha atual"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
        </label>

        <label>
          Nova senha
          <input
            type="password"
            placeholder="Digite a nova senha"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </label>

        <label>
          Confirmar nova senha
          <input
            type="password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Senha alterada com sucesso!</p>}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
