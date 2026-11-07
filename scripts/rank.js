const fs = require("fs");
const path = require("path");
const { scoreResume } = require("../lib/score");

const resumes = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/resumes.json")));
const out = resumes.map((r) => ({ ...r, ...scoreResume(r) }));
fs.writeFileSync(path.join(__dirname, "../data/ranked.json"), JSON.stringify(out, null, 2));

const counts = {};
out.forEach((r) => (counts[r.label] = (counts[r.label] || 0) + 1));
console.log("Labels:", counts);
console.log("\nTop 5 LCA:");
[...out].sort((a, b) => b.lcaScore - a.lcaScore).slice(0, 5).forEach((r) => console.log(r.lcaScore, r.id, r.label));
console.log("\nTop 5 UI/UX:");
[...out].sort((a, b) => b.designScore - a.designScore).slice(0, 5).forEach((r) => console.log(r.designScore, r.id, r.label));
