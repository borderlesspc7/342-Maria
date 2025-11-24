import React from 'react';
import { Layout } from '../../components/Layout';

const PremiosProdutividade: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
          Prêmio de Produtividade
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Gestão de prêmios e bonificações por produtividade
        </p>
      </div>
    </Layout>
  );
};

export default PremiosProdutividade;

