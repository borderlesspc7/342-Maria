import React from 'react';
import { Layout } from '../../components/Layout';

const Relatorios: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
          Relatórios
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Visualização e geração de relatórios do sistema
        </p>
      </div>
    </Layout>
  );
};

export default Relatorios;

