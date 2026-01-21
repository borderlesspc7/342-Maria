interface ErrorMessageProps {
    message: string;
  }
  
  export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
      <div style={{ padding: "1rem", color: "red" }}>
        <p>{message}</p>
      </div>
    );
  }
  