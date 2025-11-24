import React from 'react';
import { Layout } from '../../components/Layout';

const BoletinsMedicao: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
          Boletins de Medição
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Controle e gestão de boletins de medição
        </p>
      </div>
    </Layout>
  );
};

export default BoletinsMedicao;

