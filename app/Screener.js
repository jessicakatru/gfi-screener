"use client";
import { useState, useMemo, Fragment } from "react";

const ROLES = {
  lca: { title: "LCA Role (4-6 yrs)", key: "lcaScore", why: "lcaWhy", skills: "lca" },
  design: { title: "UI/UX Design Internship", key: "designScore", why: "designWhy", skills: "design" },
};

export default function Screener({ initial }) {
  const [rows, setRows] = useState(initial);
  const [role, setRole] = useState("lca");
  const [sortBy, setSortBy] = useState("score");
  const [minScore, setMinScore] = useState(0);
  const [minYears, setMinYears] = useState(0);
  const [labelFilter, setLabelFilter] = useState("All");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const R = ROLES[role];

  const ranked = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b[R.key] - a[R.key] || (b.yearsExperience || 0) - (a.yearsExperience || 0))
        .map((r, i) => ({ ...r, rank: i + 1 })),
    [rows, R.key]
  );

  const shown = ranked
    .filter((r) => r[R.key] >= minScore)
    .filter((r) => (r.yearsExperience || 0) >= minYears)
    .filter((r) => labelFilter === "All" || r.label === labelFilter)
    .filter((r) => !onlyIssues || r.flags.length || r.warnings.some((w) => !w.startsWith("Email")))
    .sort((a, b) => (sortBy === "years" ? (b.yearsExperience || 0) - (a.yearsExperience || 0) : a.rank - b.rank));

  async function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error || "Upload failed");
      r.isNew = true;
      const next = [r, ...rows.filter((x) => x.id !== r.id)];
      const pos = (k) => next.filter((x) => x[k] > r[k]).length + 1;
      setRows(next);
      setMsg({
        ok: true,
        text: `${r.id}: LCA rank #${pos("lcaScore")} (score ${r.lcaScore}), UI/UX rank #${pos("designScore")} (score ${r.designScore}) of ${next.length}. Label: ${r.label}`,
      });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
    setBusy(false);
    e.target.value = "";
  }

  return (
    <main>
      <h1>Resume Screener</h1>
      <p className="sub">{rows.length} resumes · 2 roles · rule-based, explainable scoring</p>

      <div className="card upload">
        <b>Test with a new resume:</b>
        <input type="file" accept=".pdf,.docx" onChange={upload} disabled={busy} />
        {busy && <span>Processing...</span>}
        {msg && <div className={msg.ok ? "ok" : "err"}>{msg.text}</div>}
      </div>

      <div className="tabs">
        {Object.entries(ROLES).map(([k, v]) => (
          <button key={k} className={role === k ? "active" : ""} onClick={() => setRole(k)}>
            {v.title}
          </button>
        ))}
      </div>

      <div className="card method">
        {role === "lca" ? <><b>Ranking method (JD1):</b> GaBi/SimaPro 25 (OpenLCA/Umberto 12) + LCA/LCI terms 20 + experience 25 (2+ yrs = full) + ISO 14040/44 10 + EPD 8 + environmental education 7 + supporting terms 5 = 100.</> : <><b>Ranking method (JD2):</b> Figma 25 + UX methods 25 + portfolio link 15 + tools 10 + web/UI terms 10 + experience 10 (0-2 yrs full) + sustainability interest 5 = 100.</>}{" "}
        Label: score ≥ 40 for a role = match; both ≥ 40 = Both; otherwise Neither/Uncertain.
      </div>

      <div className="filters">
        <label>Min score: {minScore}
          <input type="range" min="0" max="100" step="5" value={minScore} onChange={(e) => setMinScore(+e.target.value)} />
        </label>
        <label>Min years: {minYears}
          <input type="range" min="0" max="8" step="0.5" value={minYears} onChange={(e) => setMinYears(+e.target.value)} />
        </label>
        <label>Label
          <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
            {["All", "LCA", "UI/UX", "Both", "Neither / Uncertain"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label>Sort
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Score</option>
            <option value="years">Experience</option>
          </select>
        </label>
        <label className="chk">
          <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} /> Only extraction issues
        </label>
      </div>

      <p className="sub">Showing {shown.length} of {rows.length}</p>

      <table>
        <thead>
          <tr><th>#</th><th>Candidate</th><th>Score</th><th>Label</th><th>Yrs</th><th>Why</th></tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <Fragment key={r.id}>
              <tr className={r.isNew ? "new" : ""} onClick={() => setOpen(open === r.id ? null : r.id)}>
                <td>{r.rank}</td>
                <td>{r.id.replace("anonymized_", "")}{r.isNew && " (new)"}</td>
                <td><b>{r[R.key]}</b></td>
                <td><span className={"tag " + r.label.split(" ")[0].replace("/", "")}>{r.label}</span></td>
                <td>{r.yearsExperience || "?"}</td>
                <td className="why">{r[R.why]}{r.flags.length > 0 && " ⚠️"}</td>
              </tr>
              {open === r.id && (
                <tr className="detail">
                  <td colSpan={6}>
                    <div><b>Source:</b> {r.sourceUrl ? <a href={r.sourceUrl} target="_blank">Open original resume</a> : "Uploaded now (not stored)"} · {r.file}</div>
                    <div><b>Email:</b> {r.email || "not found"} · <b>Experience:</b> {r.yearsExperience || "?"} yrs (from dates: {r.yearsDebug.fromDates}, stated: {r.yearsDebug.explicit})</div>
                    <div><b>Education:</b> {r.education.join(" | ") || "not detected"}</div>
                    <div><b>LCA skills:</b> {r.skills.lca.join(", ") || "none"}</div>
                    <div><b>Design skills:</b> {r.skills.design.join(", ") || "none"}</div>
                    <div><b>Other skills:</b> {r.skills.general.join(", ") || "none"}</div>
                    {r.projects && <div><b>Projects:</b> <pre>{r.projects}</pre></div>}
                    {(r.flags.length > 0 || r.warnings.length > 0) && (
                      <div className="err"><b>Extraction notes:</b> {[...r.flags, ...r.warnings].join(" · ")}</div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </main>
  );
}
