import { useState, useEffect, useCallback } from "react";

const REWARDS = [
  { threshold: 20, label: "1 Free Hour", emoji: "⏰", color: "#4ade80" },
  { threshold: 50, label: "3 Free Hours", emoji: "🕐", color: "#60a5fa" },
  { threshold: 100, label: "Free Day or Purchase List Item", emoji: "🎉", color: "#f472b6" },
];

const QUICK_TASKS = [
  { label: "Personal Hygiene", pts: 7, emoji: "🚿" },
  { label: "Household Chore", pts: 5, emoji: "🧹" },
  { label: "Straighten Up", pts: 10, emoji: "🏠" },
  { label: "Errand / Drive Task", pts: 10, emoji: "🚗" },
  { label: "Phone Call / Email", pts: 10, emoji: "📞" },
  { label: "Complex Task", pts: 15, emoji: "⚙️" },
  { label: "Medical / Doctor", pts: 20, emoji: "🩺" },
  { label: "Extraordinary Task", pts: 20, emoji: "⭐" },
];

const STORAGE_KEY = "ed_points_v1";

function ProgressBar({ current, threshold, color, label, emoji }) {
  const pct = Math.min((current / threshold) * 100, 100);
  const done = current >= threshold;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: done ? color : "#ccc" }}>
          {emoji} {label}
        </span>
        <span style={{ fontSize: 12, color: done ? color : "#888" }}>
          {done ? "✅ UNLOCKED" : `${current}/${threshold} pts`}
        </span>
      </div>
      <div style={{ height: 8, background: "#2a2a3a", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: done ? color : `${color}88`,
          borderRadius: 99,
          transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          boxShadow: done ? `0 0 8px ${color}88` : "none",
        }} />
      </div>
    </div>
  );
}

export default function PointTracker() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [redeemed, setRedeemed] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState(null);
  const [customTask, setCustomTask] = useState("");
  const [customPts, setCustomPts] = useState(10);
  const [tab, setTab] = useState("earn");
  const [confetti, setConfetti] = useState([]);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res) {
          const data = JSON.parse(res.value);
          setPoints(data.points ?? 0);
          setHistory(data.history ?? []);
          setRedeemed(data.redeemed ?? []);
        }
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (pts, hist, red) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ points: pts, history: hist, redeemed: red }));
    } catch (_) {}
  }, []);

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#4ade80","#60a5fa","#f472b6","#fbbf24","#a78bfa"][i % 5],
      delay: Math.random() * 0.4,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1800);
  };

  const addPoints = (label, pts) => {
    const newPts = points + pts;
    const entry = { label, pts, time: new Date().toLocaleString(), id: Date.now() };
    const newHist = [entry, ...history].slice(0, 50);
    setPoints(newPts);
    setHistory(newHist);
    setFlash(`+${pts}`);
    setTimeout(() => setFlash(null), 900);
    // Check reward unlock
    const justUnlocked = REWARDS.find(r => points < r.threshold && newPts >= r.threshold);
    if (justUnlocked) triggerConfetti();
    save(newPts, newHist, redeemed);
  };

  const redeem = (reward) => {
    if (points < reward.threshold) return;
    const newPts = points - reward.threshold;
    const entry = { label: `🎁 Redeemed: ${reward.label}`, pts: -reward.threshold, time: new Date().toLocaleString(), id: Date.now() };
    const newHist = [entry, ...history].slice(0, 50);
    const newRed = [{ ...reward, time: new Date().toLocaleString() }, ...redeemed].slice(0, 20);
    setPoints(newPts);
    setHistory(newHist);
    setRedeemed(newRed);
    save(newPts, newHist, newRed);
  };

  const handleCustom = () => {
    if (!customTask.trim() || customPts < 1) return;
    addPoints(customTask.trim(), Number(customPts));
    setCustomTask("");
    setCustomPts(10);
  };

  const nextReward = REWARDS.find(r => points < r.threshold);

  if (!loaded) return (
    <div style={{ background: "#12121e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "system-ui" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: "#12121e", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff", padding: "0 0 40px" }}>

      {/* Confetti */}
      {confetti.map(p => (
        <div key={p.id} style={{
          position: "fixed", top: "30%", left: `${p.x}%`, width: 10, height: 10,
          background: p.color, borderRadius: 2, zIndex: 999,
          animation: `confettiFall 1.6s ${p.delay}s ease-in forwards`,
          pointerEvents: "none",
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
        @keyframes flashPop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .task-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .task-btn:active { transform: scale(0.97); }
        .redeem-btn:hover { filter: brightness(1.2); }
        .redeem-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .tab-btn.active { background: #ffffff18; color: #fff; }
        .tab-btn:not(.active) { color: #666; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)", padding: "28px 20px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 13, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Ed's Point Tracker</div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -2 }}>
            {points}
          </div>
          {flash && (
            <div style={{
              position: "absolute", top: -10, right: -30, fontSize: 28, fontWeight: 800,
              color: "#4ade80", animation: "flashPop 0.9s ease-out forwards",
            }}>{flash}</div>
          )}
        </div>
        <div style={{ fontSize: 16, color: "#94a3b8", marginTop: 2 }}>points</div>
        {nextReward && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#60a5fa" }}>
            {nextReward.threshold - points} pts to unlock {nextReward.emoji} {nextReward.label}
          </div>
        )}
        {!nextReward && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#4ade80" }}>
            🎉 All rewards unlocked! Time to redeem.
          </div>
        )}
      </div>

      {/* Progress bars */}
      <div style={{ padding: "20px 20px 0" }}>
        {REWARDS.map(r => (
          <ProgressBar key={r.threshold} current={points} threshold={r.threshold} color={r.color} label={r.label} emoji={r.emoji} />
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "20px 0 16px", padding: "0 20px" }}>
        {["earn", "redeem", "log"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ color: tab === t ? "#fff" : "#666" }}>
            {t === "earn" ? "Earn" : t === "redeem" ? "Redeem" : "History"}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* EARN TAB */}
        {tab === "earn" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {QUICK_TASKS.map(task => (
                <button key={task.label} className="task-btn" onClick={() => addPoints(task.label, task.pts)}
                  style={{
                    background: "#1e2035", border: "1px solid #2a2d4a", borderRadius: 14,
                    padding: "14px 10px", cursor: "pointer", color: "#fff",
                    textAlign: "center", transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{task.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", marginBottom: 2 }}>{task.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#4ade80" }}>+{task.pts}</div>
                </button>
              ))}
            </div>

            {/* Custom task */}
            <div style={{ background: "#1e2035", border: "1px solid #2a2d4a", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>Custom Task</div>
              <input
                value={customTask}
                onChange={e => setCustomTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCustom()}
                placeholder="What did you do?"
                style={{
                  width: "100%", background: "#12121e", border: "1px solid #2a2d4a",
                  borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box", marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[5, 7, 10, 15, 20].map(v => (
                    <button key={v} onClick={() => setCustomPts(v)}
                      style={{
                        background: customPts === v ? "#4ade80" : "#2a2d4a",
                        color: customPts === v ? "#000" : "#94a3b8",
                        border: "none", borderRadius: 8, padding: "6px 10px",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>{v}</button>
                  ))}
                </div>
                <button onClick={handleCustom}
                  style={{
                    marginLeft: "auto", background: "#4ade80", color: "#000",
                    border: "none", borderRadius: 8, padding: "8px 18px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}>Log +{customPts}</button>
              </div>
            </div>
          </div>
        )}

        {/* REDEEM TAB */}
        {tab === "redeem" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {REWARDS.map(r => {
              const canRedeem = points >= r.threshold;
              return (
                <div key={r.threshold} style={{
                  background: "#1e2035", border: `1px solid ${canRedeem ? r.color + "44" : "#2a2d4a"}`,
                  borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14,
                  boxShadow: canRedeem ? `0 0 16px ${r.color}22` : "none",
                  transition: "all 0.3s",
                }}>
                  <div style={{ fontSize: 40 }}>{r.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: canRedeem ? "#fff" : "#666", marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: canRedeem ? r.color : "#444" }}>{r.threshold} pts</div>
                  </div>
                  <button className="redeem-btn" disabled={!canRedeem} onClick={() => redeem(r)}
                    style={{
                      background: canRedeem ? r.color : "#2a2d4a",
                      color: canRedeem ? "#000" : "#555",
                      border: "none", borderRadius: 10, padding: "10px 16px",
                      fontWeight: 700, fontSize: 13, cursor: canRedeem ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}>
                    {canRedeem ? "Redeem" : `Need ${r.threshold - points} more`}
                  </button>
                </div>
              );
            })}
            {redeemed.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Past Rewards</div>
                {redeemed.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#666", padding: "6px 0", borderBottom: "1px solid #1e2035" }}>
                    {r.emoji} {r.label} — <span style={{ color: "#444" }}>{r.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "log" && (
          <div>
            {history.length === 0 && (
              <div style={{ textAlign: "center", color: "#444", padding: 40, fontSize: 14 }}>
                No tasks logged yet. Start earning points!
              </div>
            )}
            {history.map(entry => (
              <div key={entry.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid #1e2035",
              }}>
                <div>
                  <div style={{ fontSize: 14, color: entry.pts < 0 ? "#f472b6" : "#cbd5e1" }}>{entry.label}</div>
                  <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{entry.time}</div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800,
                  color: entry.pts < 0 ? "#f472b6" : "#4ade80",
                }}>
                  {entry.pts > 0 ? "+" : ""}{entry.pts}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
