const fs = require("fs");
const path = require("path");
const { extractResume } = require("../lib/extract");

(async () => {
  const dir = path.join(__dirname, "../data/resumes");
  const files = fs.readdirSync(dir).filter((f) => /\.(pdf|docx)$/i.test(f));
  const out = [];
  for (const f of files) {
    const r = await extractResume(fs.readFileSync(path.join(dir, f)), f);
    out.push(r);
    console.log(f, "| exp:", r.yearsExperience, "| lca:", r.skills.lca.length, "| design:", r.skills.design.length, "| warn:", r.warnings.length);
  }
  fs.writeFileSync(path.join(__dirname, "../data/resumes.json"), JSON.stringify(out, null, 2));
  console.log(`\nDone: ${out.length} resumes`);
})();
