import { useLocation } from "react-router-dom";

export default function Onboarding() {
  const location = useLocation();
  const state = location.state;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Onboarding</h1>
        <p>This is a temporary onboarding page for now. It will be fully connected once the backend is implemented.</p>

        <hr />

        <h3>Debug info (state passed)</h3>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </div>
  );
}
