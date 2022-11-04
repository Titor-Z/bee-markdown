import { readdirSync, readFileSync as readfile } from "fs";
import Application, { Next, Context } from "koa";
import Router from "koa-router";
//@ts-ignore
import hljs from "highlight.js";
import { join, sep } from "path";
import { cwd } from "process";

const md = require("markdown-it")({
  html: true,
  linkify: false,
  xhtmlOut: true,
  breaks: true,
  langPrefix: "lang-",

  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class='hljs'><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }

    return `<pre class="hljs">${md.utils.escapeHtml(str)}<code></code></pre>`;
  },
}).enable(["link"]);

type configType = {
  entry: string;
  port: number;
  routes: any;
};

// // --------------------------------------------------------------------------------
const app = new Application();
const Route = new Router();
const cssRoute = new Router();
const Root: string = join(cwd(), sep);

const configFile: configType = JSON.parse(
  readfile(join(Root, ".mdrc")).toString()
);

const Port = !configFile["port"] ? 2222 : configFile["port"];
const docs = readdirSync(join(Root, "docs"));


app
  .on("error", (error) => {
    console.log(`ERROR: ${error}`)
  })
  .use(async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      console.log(`ERROR: ${error}`)
    }
  })
  .use(Route.routes())
  .use(Route.allowedMethods())
  .use(cssRoute.routes())
  .use(cssRoute.allowedMethods())


// 入口文件
Route.get("/", (ctx) => {
  // 检测配置项
  const entryFile = !configFile["entry"] ? "README.md" : configFile["entry"];
  try {
    const file = readfile(join(Root, entryFile));
    ctx.body = md.render(file.toString());
  } catch (error) {
    ctx.status = 404;
    ctx.body = "Entry file not found...";
  }
});

// 挂载Pages
docs.forEach((file) => {
  Route.get(`/docs/${file}`, (ctx) => {
    let mdFile = readfile(join(Root, "/docs/", file));
    ctx.body = md.render(mdFile.toString());
  });
});

// 挂载CSS文件
if (configFile["routes"]) {
  for (const css in configFile["routes"]) {
    cssRoute.get(css, (ctx) => {
      let cssFile = readfile(join(Root, configFile["routes"][css]));
      ctx.type = "text/css";
      ctx.body = cssFile.toString();
    });
  }
}

function message(port: number) {
  return () => console.log(`🐝 STARTTING...\nOPEN: http://localhost:${port}/`);
}

function serverStart(port: number) {
  try {
    app.listen(port, message(port));
  } catch (err) {
    console.log("Port is Used...");
  }
}

export function cli() {
  serverStart(Port);
}
