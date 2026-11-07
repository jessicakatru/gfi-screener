const G = {
  lcaSoftware: ["gabi", "simapro"],
  lcaCore: [
    "life cycle assessment", "lifecycle assessment", "life cycle analysis", "lca",
    "life cycle inventory", "lci", "lcia", "openlca", "ecoinvent",
    "cradle to gate", "cradle to grave", "carbon footprint", "product carbon footprint",
    "environmental impact",
  ],
  iso: ["iso 14040", "iso 14044", "iso14040", "iso14044"],
  epd: ["epd", "environmental product declaration", "environmental product declarations"],
  lcaSupport: [
    "benchmarking", "assumptions", "data collection", "data validation", "logistics",
    "energy use", "emission factors", "ghg", "greenhouse gas", "sustainability",
    "circular economy", "audit",
  ],
  designTools: [
    "adobe xd", "sketch", "invision", "framer", "prototype", "prototyping",
    "wireframe", "wireframing", "photoshop", "illustrator",
  ],
  uxMethods: [
    "user research", "usability testing", "usability", "user psychology",
    "human-centered design", "human centered design", "user-centered design",
    "user centered design", "design thinking", "persona", "user flow",
    "information architecture", "interaction design", "ux research",
    "user experience", "ux", "ui/ux", "ux/ui", "design critique",
  ],
  designWeb: [
    "responsive design", "web design", "website", "job board", "design system",
    "visual design", "typography", "mockup", "accessibility", "mobile app",
    "high-fidelity", "high fidelity",
  ],
};

const uniq = (a) => [...new Set(a)];

module.exports = {
  G,
  LCA: uniq([...G.lcaSoftware, ...G.lcaCore, ...G.iso, ...G.epd, ...G.lcaSupport]),
  DESIGN: uniq(["figma", ...G.designTools, ...G.uxMethods, ...G.designWeb]),
  GENERAL: ["python", "excel", "sql", "power bi", "tableau", "html", "css", "javascript", "react", "r", "matlab"],
};
