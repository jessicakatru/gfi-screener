const { G } = require("./skills");

const clamp = (x) => Math.max(0, Math.min(1, x));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const find = (text, list) =>
  list.filter((k) => new RegExp(`(^|[^a-z0-9+#])${esc(k)}([^a-z0-9+#]|$)`, "i").test(text));
const short = (a) => (a.length ? a.slice(0, 4).join(", ") : "none");

function scoreResume(r) {
  const raw = r.rawText || "";
  const text = raw.toLowerCase();
  const yrs = r.yearsExperience || 0;
  const edu = (r.education || []).join(" ").toLowerCase();

  // ---------- LCA Consultant (JD1) ----------
  const sw = find(text, G.lcaSoftware);
  const core = find(text, G.lcaCore);
  const iso = find(text, G.iso);
  const epd = find(text, G.epd);
  const sup = find(text, G.lcaSupport);
  const envEdu =
    /environment|sustainab|ecolog|climate/.test(edu) ||
    /(b\.?\s?tech|m\.?\s?tech|bachelor|master|m\.?\s?sc|b\.?\s?sc|\bb\.?e\b|\bm\.?e\b)[^\n]{0,80}(environment|sustainab)/i.test(raw);

  const L = {
    software: sw.length ? 25 : /openlca|umberto/.test(text) ? 12 : 0,
    core: 20 * clamp(core.length / 4),
    iso: 10 * clamp(iso.length / 2),
    exp: 25 * clamp(yrs / 2), // 2+ yrs = full (JD: 2-3 yrs, assignment: 4-6 yrs)
    epd: epd.length ? 8 : 0,
    edu: envEdu ? 7 : 0,
    support: 5 * clamp(sup.length / 3),
  };
  const lca = Math.round(Object.values(L).reduce((a, b) => a + b, 0));

  // ---------- UI/UX Intern (JD2) ----------
  const figma = /figma/.test(text);
  const tools = find(text, G.designTools);
  const ux = find(text, G.uxMethods);
  const web = find(text, G.designWeb);
  const portfolio = /behance|dribbble|portfolio|figma\.com/.test(text);
  const sust = /sustainab|climate|environment|green/.test(text);

  const D = {
    figma: figma ? 25 : 0,
    tools: 10 * clamp(tools.length / 3),
    ux: 25 * clamp(ux.length / 4),
    portfolio: portfolio ? 15 : 0,
    web: 10 * clamp(web.length / 3),
    sust: sust ? 5 : 0,
    exp: yrs <= 2 ? 10 : yrs <= 4 ? 5 : 0, // JD: 0-1 yr
  };
  const design = Math.round(Object.values(D).reduce((a, b) => a + b, 0));

  let label = "Neither / Uncertain";
  if (lca >= 40 && design >= 40) label = "Both";
  else if (lca >= 40 && lca > design) label = "LCA";
  else if (design >= 40 && design > lca) label = "UI/UX";

  const flags = [];
  if (!yrs) flags.push("Experience estimate avvaledu, manual ga check cheyyandi");
  if (!core.length && !ux.length && !figma) flags.push("JD keywords emi dorakaledu, resume format check cheyyandi");
  if (label === "LCA" && !sw.length) flags.push("LCA match, kani GaBi/SimaPro (must-have) kanapadaledu");

  return {
    lcaScore: lca,
    designScore: design,
    label,
    flags,
    lcaWhy: `GaBi/SimaPro: ${sw.length ? sw.join("/") : "no"} (+${Math.round(L.software)}) | LCA terms: ${short(core)} (+${Math.round(L.core)}) | ISO 14040/44: ${iso.length ? "yes" : "no"} (+${Math.round(L.iso)}) | Exp ${yrs}y (+${Math.round(L.exp)}) | EPD: ${epd.length ? "yes" : "no"} (+${L.epd}) | Env. education: ${envEdu ? "yes" : "no"} (+${L.edu})`,
    designWhy: `Figma: ${figma ? "yes" : "no"} (+${L.figma}) | Tools: ${short(tools)} (+${Math.round(L.tools)}) | UX methods: ${short(ux)} (+${Math.round(L.ux)}) | Portfolio: ${portfolio ? "yes" : "no"} (+${L.portfolio}) | Web/UI: ${short(web)} (+${Math.round(L.web)}) | Exp ${yrs}y (+${L.exp})`,
  };
}

module.exports = { scoreResume };
