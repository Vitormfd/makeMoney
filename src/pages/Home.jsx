import { useState, useEffect, useRef } from "react";

const CHECKOUT_URL = "https://pay.kiwify.com.br/Bq71rE0";

/* ─── Countdown ─────────────────────────────────────────────────────────── */
function useCountdown(h = 1, m = 47, s = 33) {
  const [t, setT] = useState(h * 3600 + m * 60 + s);
  useEffect(() => {
    const id = setInterval(() => setT(x => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    h: String(Math.floor(t / 3600)).padStart(2, "0"),
    m: String(Math.floor((t % 3600) / 60)).padStart(2, "0"),
    s: String(t % 60).padStart(2, "0"),
  };
}

/* ─── InView ─────────────────────────────────────────────────────────────── */
function useInView(thresh = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: thresh });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}

/* ─── FadeIn ─────────────────────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, dir = "up" }) {
  const { ref, v } = useInView();
  const from = dir === "up" ? "translateY(40px)" : dir === "left" ? "translateX(-40px)" : "translateX(40px)";
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translate(0)" : from,
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ─── Particles background ───────────────────────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,197,94,${d.a})`;
        ctx.fill();
      });
      // lines between close dots
      for (let i = 0; i < dots.length; i++)
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(34,197,94,${0.07 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }} />;
}

/* ─── Glowing divider ────────────────────────────────────────────────────── */
function GlowDivider({ color = "#22c55e" }) {
  return (
    <div style={{ position: "relative", height: 1, margin: "0 auto", maxWidth: 400, marginTop: 0, marginBottom: 0 }}>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ text, color = "#22c55e" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span style={{ color, fontWeight: 800, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>{text}</span>
      <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

/* ─── CTA Button ─────────────────────────────────────────────────────────── */
function CTAButton({ label = "QUERO GARANTIR MINHA VAGA AGORA →", size = "md", full = false }) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  const lg = size === "lg";
  return (
    <a
      href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        display: full ? "block" : "inline-block",
        position: "relative",
        overflow: "hidden",
        background: press
          ? "linear-gradient(135deg,#15803d,#166534)"
          : hov
            ? "linear-gradient(135deg,#16a34a,#15803d)"
            : "linear-gradient(135deg,#22c55e,#16a34a)",
        color: "#fff",
        fontWeight: 900,
        textDecoration: "none",
        borderRadius: 14,
        padding: lg ? "22px 44px" : "17px 34px",
        fontSize: lg ? 19 : 16,
        letterSpacing: "0.5px",
        textAlign: "center",
        cursor: "pointer",
        lineHeight: 1.3,
        boxShadow: hov
          ? "0 0 50px rgba(34,197,94,0.65), 0 12px 40px rgba(0,0,0,0.5)"
          : "0 0 28px rgba(34,197,94,0.35), 0 6px 20px rgba(0,0,0,0.4)",
        transform: press ? "scale(0.98)" : hov ? "scale(1.03) translateY(-2px)" : "scale(1)",
        transition: "all 0.22s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* shimmer sweep */}
      <span style={{
        position: "absolute", top: 0, left: hov ? "110%" : "-40%", width: "40%", height: "100%",
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
        transition: "left 0.55s ease",
        pointerEvents: "none",
      }} />
      {label}
    </a>
  );
}

/* ─── Stars ──────────────────────────────────────────────────────────────── */
function Stars() {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const testimonials = [
  { name: "Carla Mendes", role: "Assistente Administrativa", city: "São Paulo, SP", text: "Achei que era mais um curso qualquer, mas me surpreendi. Em menos de 3 semanas já gerava uma renda extra que cobriu o cartão. Vale cada centavo!" },
  { name: "Ricardo Souza", role: "Técnico de TI", city: "Belo Horizonte, MG", text: "Trabalho 8h por dia e consegui encaixar as estratégias no meu tempo livre. Já no primeiro mês fiz R$380 extras. Simples e prático como prometido." },
  { name: "Fernanda Lima", role: "Professora Municipal", city: "Curitiba, PR", text: "Meu salário nunca chegava no fim do mês. Hoje tenho uma segunda fonte de renda e finalmente consigo respirar financeiramente. Recomendo!" },
  { name: "Marcos Oliveira", role: "Operador de Logística", city: "Recife, PE", text: "Não acreditava que funcionaria pra mim. Mas as aulas são tão claras que qualquer um consegue aplicar. Segundo mês seguido gerando extra." },
];

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const go = dir => {
    setFade(false);
    setTimeout(() => { setIdx(i => (i + dir + testimonials.length) % testimonials.length); setFade(true); }, 250);
  };
  useEffect(() => { const id = setInterval(() => go(1), 5500); return () => clearInterval(id); }, []);
  const t = testimonials[idx];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "44px 52px",
        opacity: fade ? 1 : 0,
        transform: fade ? "scale(1) translateY(0)" : "scale(0.98) translateY(8px)",
        transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        minHeight: 230,
      }}>
        {/* top accent */}
        <div style={{ width: 40, height: 3, background: "linear-gradient(90deg,#22c55e,#4ade80)", borderRadius: 99, marginBottom: 20 }} />
        <Stars />
        <p style={{ color: "#e2e8f0", fontSize: 18, lineHeight: 1.8, margin: "18px 0 28px", fontStyle: "italic", fontWeight: 400 }}>
          "{t.text}"
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "linear-gradient(135deg,#22c55e,#0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 20, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 20px rgba(34,197,94,0.3)",
          }}>{t.name[0]}</div>
          <div>
            <p style={{ color: "#f1f5f9", fontWeight: 800, margin: 0, fontSize: 16 }}>{t.name}</p>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{t.role} · {t.city}</p>
          </div>
        </div>
      </div>
      {/* arrows */}
      {[-1, 1].map(dir => (
        <button key={dir} onClick={() => go(dir)} style={{
          position: "absolute", top: "50%",
          [dir === -1 ? "left" : "right"]: -22,
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", width: 44, height: 44, borderRadius: "50%",
          fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", transition: "background 0.2s", zIndex: 2,
        }}>{dir === -1 ? "‹" : "›"}</button>
      ))}
      {/* dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 250); }}
            style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 99, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s", background: i === idx ? "#22c55e" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
const faqs = [
  { q: "Preciso ter experiência ou conhecimento prévio?", a: "Não. O método foi criado para pessoas comuns, sem nenhum conhecimento técnico. Se você sabe usar um celular ou computador básico, você consegue aplicar." },
  { q: "Quanto tempo preciso dedicar por dia?", a: "Você pode começar com apenas 1 a 2 horas por dia, no seu tempo livre. O método é pensado para quem já tem um emprego fixo." },
  { q: "Funciona para qualquer cidade do Brasil?", a: "Sim! As estratégias ensinadas funcionam em qualquer cidade, grande ou pequena, em todo o território nacional." },
  { q: "E se eu não gostar? Tem garantia?", a: "Sim! Você tem 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, basta pedir o reembolso e devolvemos 100% do seu dinheiro. Sem burocracia." },
  { q: "O acesso é imediato após a compra?", a: "Sim! Assim que o pagamento for confirmado, você recebe o acesso imediatamente no e-mail cadastrado." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
      {faqs.map((f, i) => (
        <div key={i} style={{
          background: open === i ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
          border: open === i ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden", transition: "all 0.3s ease",
          boxShadow: open === i ? "0 0 30px rgba(34,197,94,0.08)" : "none",
        }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", background: "transparent", border: "none", color: "#f1f5f9",
            fontWeight: 700, fontSize: 16, textAlign: "left", padding: "22px 28px",
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          }}>
            <span>{f.q}</span>
            <span style={{
              width: 28, height: 28, borderRadius: "50%",
              background: open === i ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: open === i ? "#22c55e" : "#94a3b8",
              fontSize: 18, flexShrink: 0,
              transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
              transition: "all 0.3s ease",
            }}>+</span>
          </button>
          <div style={{ maxHeight: open === i ? 300 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(.16,1,.3,1)" }}>
            <p style={{ color: "#94a3b8", padding: "0 28px 24px", margin: 0, lineHeight: 1.8, fontSize: 15 }}>{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PainCard ───────────────────────────────────────────────────────────── */
function PainCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.025)",
      border: hov ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: "32px 28px",
      transform: hov ? "translateY(-6px)" : "translateY(0)",
      transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
      height: "100%",
      boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(239,68,68,0.08)" : "none",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 26, marginBottom: 18,
      }}>{icon}</div>
      <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 10px" }}>{title}</h3>
      <p style={{ color: "#64748b", lineHeight: 1.7, margin: 0, fontSize: 15 }}>{desc}</p>
    </div>
  );
}

/* ─── ValueCard ──────────────────────────────────────────────────────────── */
function ValueCard({ icon, title, value, desc, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
      border: hov ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, padding: "32px 28px",
      transform: hov ? "translateY(-6px)" : "translateY(0)",
      transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
      boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(34,197,94,0.08)" : "none",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.12),transparent)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26,
        }}>{icon}</div>
        <span style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 99, border: "1px solid rgba(34,197,94,0.2)" }}>val. {value}</span>
      </div>
      <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 10px" }}>{title}</h3>
      <p style={{ color: "#64748b", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{desc}</p>
    </div>
  );
}

/* ─── Number stat ────────────────────────────────────────────────────────── */
function Stat({ num, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#22c55e,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</p>
      <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0", fontWeight: 600 }}>{label}</p>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const timer = useCountdown(1, 47, 33);
  const [floatHov, setFloatHov] = useState(false);

  return (
    <div style={{ background: "#060910", color: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif", overflowX: "hidden" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 100px" }}>
        <Particles />

        {/* glow blobs */}
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 900, background: "radial-gradient(circle,rgba(34,197,94,0.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: "-15%", width: 700, height: 700, background: "radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(34,197,94,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.03) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div style={{ maxWidth: 900, textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* eyebrow badge */}
          <FadeIn>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 99, padding: "10px 22px", marginBottom: 36,
              backdropFilter: "blur(12px)",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#4ade80", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>MÉTODO VALIDADO POR +3.200 PESSOAS</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(40px,7vw,82px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 28px", letterSpacing: "-2px" }}>
              <span style={{ color: "#f1f5f9" }}>Seu salário</span>{" "}
              <span style={{
                position: "relative", display: "inline-block",
                background: "linear-gradient(135deg,#ef4444,#f97316)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                some
                <span style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#ef4444,#f97316)", borderRadius: 99, opacity: 0.6 }} />
              </span>
              <br />
              <span style={{ color: "#f1f5f9" }}>antes do dia 20?</span>
              <br />
              <span style={{ background: "linear-gradient(135deg,#22c55e,#4ade80,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Isso muda hoje.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ fontSize: "clamp(16px,2.4vw,21px)", color: "#94a3b8", lineHeight: 1.8, margin: "0 auto 52px", maxWidth: 660 }}>
              Descubra o método prático que está ajudando pessoas comuns — que trabalham 8h por dia de CLT — a gerar renda extra real, sem largar o emprego e sem precisar de capital inicial.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <CTAButton size="lg" label="✦ QUERO GERAR RENDA EXTRA AGORA →" />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
              {["🔒 Compra Segura", "↩️ 7 Dias de Garantia", "⚡ Acesso Imediato"].map(t => (
                <span key={t} style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </FadeIn>

          {/* scroll indicator */}
          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 }}>
            <span style={{ fontSize: 11, letterSpacing: 2, color: "#64748b" }}>ROLE PARA VER</span>
            <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,#22c55e,transparent)", animation: "scrollPulse 1.5s ease infinite" }} />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px" }}>
        <FadeIn>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32 }}>
            <Stat num="+3.200" label="Pessoas Atendidas" />
            <Stat num="R$26,90" label="Preço de Acesso" />
            <Stat num="7 dias" label="Garantia Total" />
            <Stat num="100%" label="Acesso Digital" />
          </div>
        </FadeIn>
      </section>

      {/* ══ DOR ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "#060910" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel text="VOCÊ SE IDENTIFICA?" color="#ef4444" />
            <h2 style={{ textAlign: "center", fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15 }}>
              A realidade brutal de quem{" "}
              <span style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>vive no limite</span>{" "}
              todo mês
            </h2>
            <p style={{ textAlign: "center", color: "#475569", marginBottom: 64, fontSize: 16, maxWidth: 540, margin: "16px auto 64px" }}>
              Se você se identificou com algum desses cenários, saiba: você não está sozinho — e isso tem solução.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20 }}>
            {[
              { icon: "💳", title: "Cartão no limite todo mês", desc: "Você usa o cartão para pagar o básico porque o salário não chegou ainda — e a fatura só cresce a cada mês." },
              { icon: "😰", title: "Ansiedade no fim do mês", desc: "Aquela sensação de aperto no peito quando você olha o saldo e ainda faltam 10 dias para o próximo pagamento." },
              { icon: "⛓", title: "Preso ao salário", desc: "Você depende 100% do seu emprego. Se perder o trabalho, não tem nada para te segurar. Uma dependência perigosa." },
              { icon: "😞", title: "Zero sobrando no final", desc: "Paga contas, mercado, aluguel… e no final o saldo é zero. Sem reserva, sem lazer, sem respiro financeiro." },
              { icon: "😴", title: "Cansaço e falta de energia", desc: "Chega em casa exausto depois de 8h de trabalho e não sabe como poderia ainda pensar em mudar de vida." },
              { icon: "📉", title: "Dívidas crescendo", desc: "Uma conta aqui, um boleto ali, e a dívida vai crescendo silenciosamente enquanto o salário permanece o mesmo." },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <PainCard {...c} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SOLUÇÃO ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(180deg,#060910,#080f1a,#060910)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(circle,rgba(34,197,94,0.06),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <SectionLabel text="A SOLUÇÃO" />
            <h2 style={{ textAlign: "center", fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15 }}>
              Conheça o{" "}
              <span style={{ background: "linear-gradient(135deg,#22c55e,#4ade80,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Salário Nunca Mais Aperto
              </span>
            </h2>
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 18, lineHeight: 1.8, maxWidth: 680, margin: "16px auto 64px" }}>
              Um guia prático e direto com estratégias testadas para gerar renda extra compatível com a rotina de CLT — sem enrolação, sem promessa irreal, sem milagre.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16 }}>
            {[
              { icon: "✦", text: "Métodos validados por pessoas que trabalham CLT assim como você" },
              { icon: "✦", text: "Estratégias que você pode começar hoje, com pouco tempo livre" },
              { icon: "✦", text: "Sem precisar de investimento inicial ou experiência prévia" },
              { icon: "✦", text: "Sem abandonar seu emprego atual — compatível com qualquer rotina" },
              { icon: "✦", text: "Linguagem simples e passo a passo extremamente claro" },
              { icon: "✦", text: "Foco em resultado real no curto prazo, não promessa de riqueza" },
            ].map((b, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <BenefitItem {...b} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <CTAButton label="QUERO SAIR DO APERTO AGORA →" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ PROVA SOCIAL ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "#060910" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel text="DEPOIMENTOS REAIS" />
            <h2 style={{ textAlign: "center", fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, margin: "0 0 52px", lineHeight: 1.15 }}>
              Quem já está{" "}
              <span style={{ background: "linear-gradient(135deg,#22c55e,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                gerando renda extra
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <TestimonialCarousel />
          </FadeIn>
        </div>
      </section>

      {/* ══ STACK DE VALOR ═════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(180deg,#060910,#080f1a)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel text="O QUE VOCÊ RECEBE" />
            <h2 style={{ textAlign: "center", fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, margin: "0 0 16px" }}>
              Tudo incluso no seu acesso
            </h2>
            <p style={{ textAlign: "center", color: "#475569", fontSize: 16, margin: "0 0 60px" }}>
              Um arsenal completo por menos do que um lanche
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
              { icon: "📘", title: "Guia Completo em PDF", value: "R$67", desc: "O método passo a passo em formato que você pode acessar em qualquer dispositivo, a qualquer hora." },
              { icon: "🎯", title: "Mapa de Oportunidades", value: "R$47", desc: "As melhores fontes de renda extra para quem trabalha CLT, filtradas por tempo disponível." },
              { icon: "📊", title: "Planilha de Controle Financeiro", value: "R$27", desc: "Para você finalmente saber para onde vai o seu dinheiro e onde cortar gastos sem sofrimento." },
              { icon: "💬", title: "Script de Negociação de Dívidas", value: "R$37", desc: "Um passo a passo simples de como negociar e organizar as dívidas que estão te travando." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <ValueCard {...item} index={i} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.35}>
            <div style={{
              marginTop: 32, borderRadius: 20, padding: "28px 36px",
              background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.04))",
              border: "1px solid rgba(34,197,94,0.2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 20,
              backdropFilter: "blur(12px)",
            }}>
              <div>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: 14 }}>Valor total do que você recebe</p>
                <p style={{ color: "#94a3b8", fontSize: 26, fontWeight: 900, margin: 0, textDecoration: "line-through" }}>R$178,00</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#64748b", margin: "0 0 4px", fontSize: 14 }}>Você investe apenas</p>
                <p style={{ fontSize: 42, fontWeight: 900, margin: 0, background: "linear-gradient(135deg,#22c55e,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>R$26,90</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ URGÊNCIA / CONTADOR ════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", background: "#060910", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,rgba(234,179,8,0.05),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <FadeIn>
            <div style={{ display: "inline-block", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 99, padding: "8px 20px", marginBottom: 24, color: "#fbbf24", fontWeight: 800, fontSize: 12, letterSpacing: 2 }}>
              ⚠️ OFERTA POR TEMPO LIMITADO
            </div>
            <h3 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, margin: "0 0 40px" }}>
              Esta oferta especial expira em:
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              {[{ label: "Horas", val: timer.h }, { label: "Minutos", val: timer.m }, { label: "Segundos", val: timer.s }].map((t, i) => (
                <div key={i}>
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(234,179,8,0.2)",
                    borderRadius: 18, padding: "24px 32px", minWidth: 100,
                    boxShadow: "0 0 30px rgba(234,179,8,0.06)",
                  }}>
                    <span style={{ fontSize: "clamp(36px,7vw,62px)", fontWeight: 900, fontVariantNumeric: "tabular-nums", color: "#fbbf24", display: "block", lineHeight: 1 }}>{t.val}</span>
                  </div>
                  <p style={{ color: "#475569", fontSize: 12, marginTop: 10, letterSpacing: 1, fontWeight: 700 }}>{t.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ OFERTA PRINCIPAL ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px 100px", background: "linear-gradient(180deg,#060910,#040709)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <FadeIn>
            {/* outer glow ring */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -2, borderRadius: 28, background: "linear-gradient(135deg,rgba(34,197,94,0.4),rgba(34,197,94,0.1),rgba(34,197,94,0.4))", filter: "blur(8px)", opacity: 0.5 }} />
              <div style={{
                position: "relative",
                background: "linear-gradient(145deg,rgba(10,20,12,0.97),rgba(8,14,24,0.97))",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 26, padding: "56px 44px",
                textAlign: "center",
                backdropFilter: "blur(30px)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                {/* badge */}
                <div style={{
                  position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff", fontWeight: 900, fontSize: 13,
                  padding: "10px 24px", borderRadius: 99, whiteSpace: "nowrap",
                  boxShadow: "0 8px 24px rgba(239,68,68,0.5)",
                  letterSpacing: "0.5px",
                }}>🔥 OFERTA ESPECIAL — VAGAS LIMITADAS</div>

                <SectionLabel text="ACESSO COMPLETO" />
                <h3 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "16px 0 32px", lineHeight: 1.2 }}>
                  Salário Nunca Mais Aperto
                </h3>

                <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 4px" }}>De <span style={{ textDecoration: "line-through" }}>R$97,00</span></p>
                <p style={{ color: "#475569", fontSize: 14, margin: "0 0 12px" }}>Por apenas</p>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 36 }}>
                  <span style={{ color: "#4ade80", fontSize: 28, fontWeight: 900, marginTop: 14, marginRight: 4 }}>R$</span>
                  <span style={{ fontSize: "clamp(72px,14vw,108px)", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#22c55e,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>26</span>
                  <span style={{ color: "#4ade80", fontSize: 32, fontWeight: 900, marginTop: 20 }}>,90</span>
                </div>

                <CTAButton size="lg" label="✦ GARANTIR MINHA VAGA AGORA →" full />

                <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 28, flexWrap: "wrap" }}>
                  {["🔒 Compra Segura", "↩️ 7 dias de garantia", "⚡ Acesso imediato"].map(t => (
                    <span key={t} style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>

                <GlowDivider />

                {/* guarantee box */}
                <div style={{ marginTop: 32, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 16, padding: "20px 24px", textAlign: "left", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 32, flexShrink: 0 }}>🛡️</span>
                  <div>
                    <p style={{ color: "#4ade80", fontWeight: 800, margin: "0 0 6px", fontSize: 15 }}>Garantia Incondicional de 7 Dias</p>
                    <p style={{ color: "#475569", fontSize: 13, margin: 0, lineHeight: 1.7 }}>Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas, sem enrolação.</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", background: "#060910" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel text="DÚVIDAS FREQUENTES" />
            <h2 style={{ textAlign: "center", fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, margin: "0 0 52px" }}>
              Perguntas e respostas
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}><FAQ /></FadeIn>
        </div>
      </section>

      {/* ══ CTA FINAL ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 24px", background: "linear-gradient(180deg,#060910,#03060c)", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(34,197,94,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.025) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(circle,rgba(34,197,94,0.08),transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <SectionLabel text="SUA DECISÃO MAIS IMPORTANTE HOJE" />
            <h2 style={{ fontSize: "clamp(32px,5.5vw,64px)", fontWeight: 900, lineHeight: 1.1, margin: "16px 0 28px", letterSpacing: "-1px" }}>
              Você vai continuar{" "}
              <span style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                vivendo no aperto
              </span>
              {" "}ou vai fazer algo diferente?
            </h2>
            <p style={{ color: "#64748b", fontSize: 19, lineHeight: 1.8, margin: "0 auto 56px", maxWidth: 600 }}>
              Por menos do que um lanche você pode ter acesso ao método que está ajudando pessoas reais a criar uma fonte extra de renda — sem largar o emprego, sem milagre, só com método e ação.
            </p>
            <CTAButton size="lg" label="✦ SIM, QUERO MUDAR MINHA SITUAÇÃO →" />
            <p style={{ marginTop: 24, color: "#334155", fontSize: 13 }}>
              Acesso imediato · Garantia de 7 dias · Pagamento 100% seguro
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "36px 24px", textAlign: "center" }}>
        <p style={{ color: "#1e293b", fontSize: 13, margin: 0 }}>© 2026 Salário Nunca Mais Aperto · Todos os direitos reservados</p>
        <p style={{ color: "#0f172a", fontSize: 11, marginTop: 8 }}>Este produto não garante resultados financeiros. Os resultados dependem do esforço e dedicação de cada pessoa.</p>
      </footer>

      {/* ══ FLOATING BUTTON (mobile) ════════════════════════════════════════════ */}
      <a
        href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setFloatHov(true)} onMouseLeave={() => setFloatHov(false)}
        className="float-cta"
        style={{
          position: "fixed", bottom: 20, left: "50%",
          transform: `translateX(-50%) ${floatHov ? "scale(1.05)" : "scale(1)"}`,
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#fff", fontWeight: 900, fontSize: 14,
          padding: "16px 30px", borderRadius: 99, textDecoration: "none",
          boxShadow: "0 0 32px rgba(34,197,94,0.55), 0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 999, whiteSpace: "nowrap", display: "none",
          transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
        }}
      >✦ GARANTIR VAGA — R$26,90</a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        @media (max-width: 640px) { .float-cta { display: block !important; } }
        button:focus { outline: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #22c55e; }
          50% { opacity: 0.5; box-shadow: 0 0 20px #22c55e; }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 0.9; transform: scaleY(1.15); }
        }
      `}</style>
    </div>
  );
}

/* ─── BenefitItem ──────────────────────────────────────────────────────────── */
function BenefitItem({ icon, text }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
        border: hov ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: "20px 24px",
        display: "flex", gap: 14, alignItems: "flex-start",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(.16,1,.3,1)",
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <span style={{ color: "#22c55e", fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ color: "#cbd5e1", margin: 0, lineHeight: 1.65, fontSize: 15 }}>{text}</p>
    </div>
  );
}
