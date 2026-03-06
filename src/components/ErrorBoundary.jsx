import { Component } from "react";
import { css } from "../styles/theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleClearAndReset = () => {
    if (window.confirm("Esto eliminará todos los datos guardados. ¿Continuar?")) {
      localStorage.clear();
      window.location.hash = "#/";
      window.location.reload();
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
        <div style={{ ...css.card, maxWidth: "520px", textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }} aria-hidden="true">!</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.4rem", margin: "0 0 0.75rem", color: "var(--danger)" }}>
            Algo ha fallado
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0 0 0.5rem" }}>
            Se ha producido un error inesperado en la aplicación.
          </p>
          <details style={{ textAlign: "left", margin: "1rem 0", padding: "0.75rem", background: "var(--bg-input)", borderRadius: "4px", fontSize: "0.8rem" }}>
            <summary style={{ cursor: "pointer", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Detalles del error</summary>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--danger)", fontFamily: "'DM Mono',monospace", fontSize: "0.75rem", margin: 0 }}>
              {this.state.error?.message || "Error desconocido"}
            </pre>
          </details>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
            <button style={css.btnSolid()} onClick={this.handleReset}>
              Reintentar
            </button>
            <button style={css.btn("var(--danger)")} onClick={this.handleClearAndReset}>
              Limpiar datos y recargar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
