import React from 'react';
import { Layout } from '../../components/Layout';

const CadernoVirtual: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
          Caderno Virtual
        </h1>
        <p style={{ color: '#718096', fontSize: '16px' }}>
          Registro digital de atividades e anotações
        </p>
      </div>
    </Layout>
  );
};

export default CadernoVirtual;

