import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const requiredFiles = [
  "index.html",
  "atlas.html",
  "care-bed.html",
  "editorial.css",
  "styles.css",
  "app.js",
  "README.md",
  "CONTRIBUTING.md",
  "package.json",
  "LICENSE",
  "苏州BioBAY长寿经济产业图谱.md",
  "全球长寿经济市场分析与三家高成长企业.md",
  ".github/workflows/validate.yml",
  ".github/workflows/pages.yml",
  ".github/ISSUE_TEMPLATE/enterprise-capability.md",
  ".github/ISSUE_TEMPLATE/regional-cluster.md",
  ".github/ISSUE_TEMPLATE/product-case.md",
];

const contentChecks = [
  ["atlas.html", "看懂长寿经济的每一条连接"],
  ["atlas.html", "节点详情"],
  ["atlas.html", "产业聚集地"],
  ["atlas.html", "能力样例"],
  ["atlas.html", "证据边界"],
  ["app.js", 'status: "标杆案例"'],
  ["app.js", "renderNodeInspector"],
  ["app.js", "getRelatedNodeIds"],
  ["README.md", "数据状态与更新节奏"],
  ["README.md", "npm run validate"],
  ["README.md", "CONTRIBUTING.md"],
  ["CONTRIBUTING.md", "企业能力模板"],
  ["CONTRIBUTING.md", "地域样本模板"],
  ["CONTRIBUTING.md", "产品案例模板"],
  ["package.json", "\"validate\": \"node scripts/validate-static-site.mjs\""],
  [".github/workflows/validate.yml", "npm run validate"],
  [".github/workflows/pages.yml", "actions/deploy-pages@v4"],
  [".github/workflows/pages.yml", "npm run validate"],
  ["苏州BioBAY长寿经济产业图谱.md", "代表企业/主体案例"],
  ["苏州BioBAY长寿经济产业图谱.md", "真实产品/机制案例"],
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`缺少文件：${file}`);
  }
}

for (const [file, snippet] of contentChecks) {
  if (!existsSync(file)) continue;
  const content = await readFile(file, "utf8");
  if (!content.includes(snippet)) {
    failures.push(`缺少内容：${file} -> ${snippet}`);
  }
}

const jsCheck = spawnSync(process.execPath, ["--check", "app.js"], { encoding: "utf8" });
if (jsCheck.status !== 0) {
  failures.push(`app.js 语法检查失败：${jsCheck.stderr || jsCheck.stdout}`);
}

if (failures.length > 0) {
  console.error("长寿经济产业图谱自检失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("长寿经济产业图谱自检通过：轻量交互页面、BioBAY、证据边界、贡献模板和 JS 语法均正常。");
await import('./verify-v21.mjs');
