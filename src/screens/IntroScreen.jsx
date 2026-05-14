import { useNavigate } from "react-router-dom";

const STEPS = [
  { num: "01", label: "Scan all six cube faces" },
  { num: "02", label: "Verify detected color data" },
  { num: "03", label: "Generate optimal sequence" },
  { num: "04", label: "Follow step-by-step guide" },
];

export default function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.tag}>Precision Lab · Farhan Bin Hossain</span>
      </div>

      <div style={s.hero}>
        <div style={s.cubeWrapper}>
          <CubeGraphic />
        </div>
        <h1 style={s.heading}>
          Solve any cube,<br />
          <span style={s.headingMuted}>scrambled or not.</span>
        </h1>
        <p style={s.subtext}>
          A precision tool for mechanical puzzle resolution.
          <br />Scan, verify, and follow.
        </p>
      </div>

      <div style={s.stepsWrapper}>
        {STEPS.map((step, i) => (
          <div key={i} style={s.stepRow}>
            <span style={s.stepNum}>{step.num}</span>
            <div style={s.stepDivider} />
            <span style={s.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>

      <div style={s.ctaWrapper}>
        <button style={s.primaryBtn} onClick={() => {
          if (window.axisTimer) window.axisTimer.start();
          navigate("/capture");
        }}>
          📷 Scan with camera
        </button>
        <button style={s.secondaryBtn} onClick={() => {
          sessionStorage.removeItem("cube_colors");
          sessionStorage.removeItem("cube_faces");
          if (window.axisTimer) window.axisTimer.start();
          navigate("/review");
        }}>
          ✏️ Enter manually
        </button>
        <span style={s.ctaHint}>Camera access required for scanning</span>
      </div>
    </div>
  );
}

function CubeGraphic() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 8L68 24V24L40 40L12 24V24L40 8Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M12 24L40 40V72L12 56V24Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <path d="M68 24L40 40V72L68 56V24Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <line x1="30.7" y1="13.3" x2="58.7" y2="29.3" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <line x1="21.3" y1="18.7" x2="49.3" y2="34.7" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <line x1="26.7" y1="10.7" x2="26.7" y2="26.7" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <line x1="40" y1="8" x2="40" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <line x1="53.3" y1="10.7" x2="53.3" y2="26.7" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <line x1="12" y1="34.7" x2="40" y2="50.7" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="12" y1="45.3" x2="40" y2="61.3" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="21.3" y1="29.3" x2="21.3" y2="61.3" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="30.7" y1="34.7" x2="30.7" y2="66.7" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="40" y1="50.7" x2="68" y2="34.7" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="40" y1="61.3" x2="68" y2="45.3" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="49.3" y1="34.7" x2="49.3" y2="66.7" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
      <line x1="58.7" y1="29.3" x2="58.7" y2="61.3" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
    </svg>
  );
}

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "24px 20px 32px",
    gap: 32,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  tag: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    paddingTop: 8,
  },
  cubeWrapper: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.15,
    color: "#e2e8f0",
    letterSpacing: "-0.02em",
  },
  headingMuted: {
    color: "#334155",
  },
  subtext: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.7,
    fontWeight: 400,
  },
  stepsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "20px 0",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  stepNum: {
    color: "#1e293b",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    minWidth: 24,
  },
  stepDivider: {
    width: 1,
    height: 14,
    background: "rgba(255,255,255,0.06)",
  },
  stepLabel: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 400,
  },
  ctaWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    marginTop: "auto",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px 24px",
    background: "#e2e8f0",
    color: "#0a0a0f",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
  ctaHint: {
    textAlign: "center",
    color: "#1e293b",
    fontSize: 12,
    fontWeight: 400,
  },
};