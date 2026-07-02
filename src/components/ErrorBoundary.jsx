import { Component } from "react";

// Guards the public site against a shape mismatch in admin-authored data
// (e.g. a "live" project saved without full case-study content) so a bad
// row degrades to an error message instead of white-screening the whole app.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            Something went wrong loading this section.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
