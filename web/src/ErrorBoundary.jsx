import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0D0D0F",
          color: "#ECECEC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#6B6B70", maxWidth: "400px", margin: 0 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              marginTop: "8px",
              padding: "12px 24px",
              background: "#F4A261",
              color: "#0D0D0F",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
