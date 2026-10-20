// Собирает страницу из src/BarbershopLanding.jsx:
//  • index.html          — самостоятельный HTML-документ (открывается в браузере);
//  • dist/artifact.html  — фрагмент без <html>/<head>/<body> для публикации как Artifact.
// Библиотеки (React, Framer Motion, Lucide, GSAP, Three.js) грузятся с CDN как UMD-глобалы,
// а код страницы, загрузчик glTF с декодером meshopt, модели и Tailwind CSS встраиваются инлайном.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...parts) => resolve(root, ...parts);

const GLOBALS = {
  react: "module.exports = window.React;",
  "react-dom/client": "module.exports = window.ReactDOM;",
  "framer-motion": "module.exports = window.Motion;",
  "lucide-react": "module.exports = window.LucideReact;",
  gsap: "module.exports = window.gsap;",
  "gsap/ScrollTrigger": "module.exports = { ScrollTrigger: window.ScrollTrigger };",
  three: "module.exports = window.THREE;",
};

const cdnGlobals = {
  name: "cdn-globals",
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom\/client|framer-motion|lucide-react|gsap|gsap\/ScrollTrigger|three)$/ }, (args) => ({ path: args.path, namespace: "cdn-global" }));
    b.onLoad({ filter: /.*/, namespace: "cdn-global" }, (args) => ({ contents: GLOBALS[args.path], loader: "js" }));
  },
};

mkdirSync(p("dist"), { recursive: true });

const js = await build({
  entryPoints: [p("src/main.jsx")],
  bundle: true,
  write: false,
  format: "iife",
  target: ["es2020"],
  jsx: "transform",
  minifySyntax: true,
  legalComments: "none",
  // 3D-модели инструментов (models/*.glb) встраиваются в страницу как data: URL — отдельные файлы не нужны
  loader: { ".glb": "dataurl" },
  plugins: [cdnGlobals],
});
const app = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

execFileSync(p("node_modules/.bin/tailwindcss"), ["-c", p("tailwind.config.cjs"), "-i", p("src/tailwind.css"), "-o", p("dist/tailwind.css"), "--minify"], { stdio: "inherit", cwd: root });
const css = readFileSync(p("dist/tailwind.css"), "utf8");

const favicon = `data:image/png;base64,${readFileSync(p("brand/favicon.png")).toString("base64")}`;
const fragment = readFileSync(p("src/template.html"), "utf8")
  .replace("__FAVICON__", () => favicon)
  .replace("/*__TAILWIND__*/", () => css)
  .replace("/*__APP__*/", () => app);

writeFileSync(p("dist/artifact.html"), fragment);
// фото гостей лежат рядом со страницей: clients/*.webp
cpSync(p("clients"), p("dist/clients"), { recursive: true });
writeFileSync(
  p("index.html"),
  `<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${fragment.replace('<div id="root"></div>', "</head>\n<body>\n<div id=\"root\"></div>")}\n</body>\n</html>\n`
);
console.log(`index.html: ${(fragment.length / 1024).toFixed(1)} KB (JS ${(app.length / 1024).toFixed(1)} KB, CSS ${(css.length / 1024).toFixed(1)} KB)`);
