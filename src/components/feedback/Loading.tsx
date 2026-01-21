interface LoadingProps {
    message?: string;
  }
  
  export function Loading({ message = "Carregando..." }: LoadingProps) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <p>{message}</p>
      </div>
    );
  }
  