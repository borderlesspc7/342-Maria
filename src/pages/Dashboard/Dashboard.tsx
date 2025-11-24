import React from "react";
import { Layout } from "../../components/Layout";

const Dashboard: React.FC = () => {
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
          Dashboard
        </h1>
        <p style={{ color: "#718096", fontSize: "16px" }}>
          Bem-vindo ao sistema de gestão de RH
        </p>

        <div
          style={{
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                color: "#718096",
                marginBottom: "8px",
              }}
            >
              Total de Colaboradores
            </h3>
            <p
              style={{ fontSize: "32px", fontWeight: "700", color: "#1a202c" }}
            >
              248
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                color: "#718096",
                marginBottom: "8px",
              }}
            >
              Documentos Pendentes
            </h3>
            <p
              style={{ fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}
            >
              12
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                color: "#718096",
                marginBottom: "8px",
              }}
            >
              Boletins do Mês
            </h3>
            <p
              style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}
            >
              8
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
