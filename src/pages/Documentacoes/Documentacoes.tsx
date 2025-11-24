import React from "react";
import { Layout } from "../../components/Layout";

const Documentacoes: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "8px",
          }}
        >
          Documentações e Integrações
        </h1>
        <p style={{ color: "#718096", fontSize: "16px" }}>
          Gestão de documentos obrigatórios e suas integrações
        </p>
      </div>
    </Layout>
  );
};

export default Documentacoes;
