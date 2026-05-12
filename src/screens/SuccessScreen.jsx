import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SuccessScreen() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const canvasRef = useRef(null);

  const moves = location.state?.moves || 0;
  const time  = location.state?.time  || 0;

  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Confetti ───────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const COLORS = ["#e2e8f0", "#4ade80", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa"];
    const pieces = Array.from({ length: 80 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * -canvas.height,
      r:    Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 2 + 1,
      drift: Math.random() * 2 - 1,
      spin:  Math.random() * 0.2 - 0.1,
      angle: Math.random() * Math.PI * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
        p.y     += p.speed;
        p.x     += p.drift;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Share ──────────────────────────────────────────────

  const handleShare = async () => {
    const text = `I just solved a Rubik's Cube in ${formatTime(time)} with ${moves} moves using Cube Solve by Farhan Bin Hossain!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Cube Solve", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  const handleSolveAgain = () => {
    sessionStorage.removeItem("cube_colors");
    sessionStorage.removeItem("cube_faces");
    if (window.axisTimer) window.axisTimer.reset();
    navigate("/");
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div style={s.root}>
      {/* Confetti canvas */}
      <canvas ref={canvasRef} style={s.canvas} />

      {/* Content */}
      <div style={s.content}>

        {/* Icon */}
        <div style={s.iconWrapper}>
          <div style={s.iconRing}>
            <CheckIcon />
          </div>
          <div style={s.iconGlow} />
        </div>

        {/* Text */}
        <div style={s.textBlock}>
          <h1 style={s.heading}>Solved.</h1>
          <p style={s.subtext}>Cube successfully resolved</p>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <span style={s.statValue}>{moves}</span>
            <span style={s.statLabel}>Moves</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.statCard}>
            <span style={s.statValue}>{formatTime(time)}</span>
            <span style={s.statLabel}>Time</span>
          </div>
        </div>

        {/* Rating */}
        <div style={s.ratingBox}>
          <span style={s.ratingLabel}>{getRating(moves)}</span>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.secondaryBtn} onClick={handleShare}>
            <ShareIcon />
            Share result
          </button>
          <button style={s.primaryBtn} onClick={handleSolveAgain}>
            Solve again
          </button>
        </div>

        {/* Footer */}
        <span style={s.footer}>Cube Solve · Farhan Bin Hossain</span>

      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────

function getRating(moves) {
  if (moves <= 20) return "🏆 Optimal solve";
  if (moves <= 30) return "⚡ Excellent";
  if (moves <= 40) return "✓ Good solve";
  if (moves <= 55) return "Completed";
  return "Completed";
}

// ── Icons ──────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#0a0a0f" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    overflow: "hidden",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100%",
    padding: "32px 24px 40px",
    gap: 24,
  },
  iconWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  iconGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "rgba(226,232,240,0.15)",
    filter: "blur(16px)",
    zIndex: 0,
  },
  textBlock: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  heading: {
    color: "#e2e8f0",
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
    lineHeight: 1,
  },
  subtext: {
    color: "#334155",
    fontSize: 14,
    fontWeight: 400,
    margin: 0,
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    maxWidth: 280,
  },
  statCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "20px 16px",
  },
  statValue: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 40,
    background: "rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  ratingBox: {
    background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.15)",
    borderRadius: 20,
    padding: "6px 16px",
  },
  ratingLabel: {
    color: "#4ade80",
    fontSize: 13,
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
    maxWidth: 320,
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  primaryBtn: {
    padding: "14px",
    borderRadius: 12,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
  footer: {
    color: "#1e293b",
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.04em",
    marginTop: "auto",
  },
};