import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "docs", "manual-do-usuario-films-dutra.md");
const htmlPath = join(root, "docs", "manual-do-usuario-films-dutra-print.html");
const pdfPath = join(root, "docs", "manual-do-usuario-films-dutra.pdf");

const { marked } = await import("marked");

const md = readFileSync(mdPath, "utf8");
const body = marked.parse(md);
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Manual do usuário — Films Dutra</title>
  <style>
    body { font-family: "Segoe UI", system-ui, sans-serif; max-width: 820px; margin: 24px auto; padding: 0 20px 40px; line-height: 1.55; color: #111; }
    h1 { font-size: 1.75rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
    h2 { font-size: 1.25rem; margin-top: 1.6em; }
    h3 { font-size: 1.05rem; margin-top: 1.2em; }
    table { border-collapse: collapse; width: 100%; font-size: 0.9rem; margin: 1em 0; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 0.88em; }
    pre { background: #f4f4f4; padding: 12px; overflow: auto; }
    a { color: #0b57d0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    @media print { body { max-width: none; margin: 0; } a { color: #000; text-decoration: none; } }
  </style>
</head>
<body>${body}</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");

const chromeCandidates = [
  "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
];

let chrome = chromeCandidates.find((p) => {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
});

if (!chrome) {
  console.error("Chrome não encontrado nos caminhos padrão. Instale o Google Chrome ou ajuste o script.");
  process.exit(1);
}

execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--print-to-pdf=${pdfPath}`,
    "--no-pdf-header-footer",
    fileUrl,
  ],
  { stdio: "inherit" }
);

console.log("Gerado:", pdfPath);
