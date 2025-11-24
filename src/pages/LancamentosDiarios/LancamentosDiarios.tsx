import React from 'react';
import { Layout } from '../../components/Layout';

const LancamentosDiarios: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
          Lançamentos Diários
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Registro de lançamentos e atividades diárias
        </p>
      </div>
    </Layout>
  );
};

export default LancamentosDiarios;

