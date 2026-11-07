const mammoth = require("mammoth");
const pdf = require("pdf-parse/lib/pdf-parse.js");
const SKILLS = require("./skills");

const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function findSkills(text, list) {
  const low = text.toLowerCase();
  return list.filter((k) => new RegExp(`(^|[^a-z0-9+#])${esc(k)}([^a-z0-9+#]|$)`, "i").test(low));
}

function parseDate(str) {
  if (/present|current|now/i.test(str)) {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  const y = str.match(/(19|20)\d{2}/);
  if (!y) return null;
  const m = str.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i);
  return Number(y[0]) * 12 + (m ? MONTHS[m[0].toLowerCase()] : 0);
}

const HEADINGS = ["experience", "work experience", "employment", "education", "projects", "skills", "certifications", "summary", "objective", "achievements", "internships"];

function getSection(text, name) {
  const lines = text.split("\n");
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim().toLowerCase().replace(/[^a-z ]/g, "");
    if (!HEADINGS.includes(l)) continue;
    if (start === -1 && l.includes(name)) start = i + 1;
    else if (start !== -1) { end = i; break; }
  }
  return start === -1 ? "" : lines.slice(start, end).join("\n");
}

function estimateYears(text) {
  let explicit = 0;
  for (const m of text.matchAll(/(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)/gi)) {
    explicit = Math.max(explicit, parseFloat(m[1]));
  }
  const exp = getSection(text, "experience") || text;
  const re = /((?:[A-Za-z]{3,9}\.?\s*)?(?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:[A-Za-z]{3,9}\.?\s*)?(?:(?:19|20)\d{2}|present|current))/gi;
  let months = 0;
  for (const m of exp.matchAll(re)) {
    const a = parseDate(m[1]), b = parseDate(m[2]);
    if (a && b && b >= a && b - a < 480) months += b - a;
  }
  const fromDates = Math.round((months / 12) * 10) / 10;
  return { explicit, fromDates, years: fromDates || explicit };
}

function extractEducation(text) {
  const out = [];
  const re = /(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|b\.?\s?des|m\.?\s?des|bachelor[^\n,]*|master[^\n,]*|mba|ph\.?d|diploma|b\.?\s?arch|m\.?\s?arch)[^\n]{0,80}/gi;
  for (const m of text.matchAll(re)) out.push(m[0].trim());
  return [...new Set(out)].slice(0, 4);
}

async function extractResume(buffer, filename) {
  const warnings = [];
  let text = "";
  try {
    let raw = "";
    if (/\.docx$/i.test(filename)) raw = (await mammoth.extractRawText({ buffer })).value;
    else raw = (await pdf(buffer)).text;
    text = (raw || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  } catch (e) {
    warnings.push("File read cheyyalekapoyam (corrupted/protected): " + e.message);
  }

  if (text.length < 200) warnings.push("Text chala takkuva. Manual review cheyyandi.");

  const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || null;
  const phone = (text.match(/(\+?\d[\d\s-]{8,13}\d)/) || [])[0] || null;
  if (text && !email) warnings.push("Email dorakaledu (anonymized ayi undochu).");

  const exp = estimateYears(text);
  if (text.length >= 200 && !exp.years) warnings.push("Experience years estimate cheyyalekapoyam.");

  const skills = {
    lca: findSkills(text, SKILLS.LCA),
    design: findSkills(text, SKILLS.DESIGN),
    general: findSkills(text, SKILLS.GENERAL),
  };

  const firstLine = text.split("\n").map((l) => l.trim()).find((l) => l.length > 2 && l.length < 50);

  return {
    id: filename.replace(/\.(pdf|docx)$/i, ""),
    file: filename,
    sourceUrl: `/resumes/${filename}`,
    name: firstLine || filename,
    email,
    phone,
    yearsExperience: exp.years,
    yearsDebug: { explicit: exp.explicit, fromDates: exp.fromDates },
    education: extractEducation(text),
    projects: getSection(text, "project").slice(0, 600),
    skills,
    textLength: text.length,
    warnings,
    rawText: text,
  };
}

module.exports = { extractResume };
