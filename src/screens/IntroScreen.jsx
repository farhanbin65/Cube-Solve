import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import cubeAnimation from "../assets/cube-animation.json";

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
      {/* Header */}
      <div style={s.header}>
        <span style={s.tag}>Precision Lab · Farhan Bin Hossain</span>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.cubeWrapper}>
          <Lottie
            animationData={cubeAnimation}
            loop={true}
            style={{ width: 100, height: 100 }}
          />
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

      {/* Steps */}
      <div style={s.stepsWrapper}>
        {STEPS.map((step, i) => (
          <div key={i} style={s.stepRow}>
            <span style={s.stepNum}>{step.num}</span>
            <div style={s.stepDivider} />
            <span style={s.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
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