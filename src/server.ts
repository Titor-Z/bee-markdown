import { existsSync, readdirSync, readFileSync } from "fs";
import Application, { Context, Next } from "koa";
import Router from "koa-router";
import { join } from "path";
import Markdown from "./markdown";

export default class Server extends Markdown {
  private app: Application;
  private router: Router;
  private globalCssRouter: Router;
  private docs: string[];

  constructor() {
    super();

    this.app = new Application();
    this.router = new Router();
    this.globalCssRouter = new Router();
    this.docs = this.initDocs();

    this.app
      .use(this.program)
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(this.globalCssRouter.routes())
      .use(this.globalCssRouter.allowedMethods());

    this.docsServer();
    this.main();
    this.route();
    this.client();
  }

  /* ==================================================
   * 一. 检测
   * ================================================== */

  // 设置入口文件名
  private entry() {
    return (
      this.userCfg["entry"] ??
        this.globalCfg["defaultEntry"]
    );
  }

  // 统计Docs文件夹中的文件列表
  private initDocs() {
    // 检查本地是否存在全局的docs文件夹
    const docsPath = join(
      this.workspace,
      this.globalCfg["defaultDocs"],
    );
    if (!existsSync(docsPath)) return [];
    return readdirSync(docsPath);
  }

  /* ==================================================
   * 二. 系统映射挂载
   * ================================================== */

  // 主入口映射
  private main() {
    this.router.get("/", (ctx) => {
      ctx.status = 200;
      ctx.type = "text/html; charset='utf-8'";
      ctx.body = this.render(
        join(this.workspace, this.entry()),
      );
    });
  }

  // 客户端模块入口
  private client() {
    this.router.get("/client.js", (ctx) => {
      ctx.type = "application/javascript";
      ctx.status = 200;
      ctx.body = `import "./../node_modules/bee-markdown-theme/dist/dist.css";`
        .toString()
        .replace(/\n/g, "");
    });
  }

  // 子文档映射
  private docsServer() {
    if (this.docs.length <= 0) return false;

    this.docs.forEach((doc) => {
      this.router.get(`/docs/${doc}`, (ctx) => {
        let mdFile: string = this.render(
          join(
            this.workspace,
            this.globalCfg["defaultDocs"],
            doc,
          ),
        );
        ctx.status = 201;
        ctx.type = "text/html; charset='utf-8'";
        ctx.body = mdFile.toString();
      });
    });
  }

  // 用户自定义映射
  private route() {
    // 判断用户映射是否存在
    if (this.userCfg["routes"] == "{}") return false;

    for (const route in this.userCfg["routes"]) {
      this.router.get(route, (ctx) => {
        let file = readFileSync(
          join(
            this.workspace,
            this.userCfg["routes"][route],
          ),
        );
        ctx.status = 200;
        ctx.type = "text/css";
        ctx.body = file.toString();
      });
    }
  }

  // Bee 加载引擎
  private async program(ctx: Context, next: Next) {
    await next();
    const { url } = ctx;

    // 系统css映射
    if (url.endsWith(".css")) {
      const css = readFileSync(
        join(__dirname, "../", url.slice(1)),
      )
        .toString()
        .replace(/\n/g, "");

      ctx.type = "application/javascript";
      ctx.status = 200;
      ctx.body = `
const head = document.querySelector("head");
const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerText = '${css}';
head.appendChild(style)`;
    }
  }

  /* ==================================================
   * 其它: 工具函数
   * ================================================== */

  // markdown文档渲染函数
  protected render(mdFile: string): string {
    let file: Buffer = readFileSync(mdFile);

    switch (this.userCfg["useStyle"]) {
      case true:
        return `
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <meta charset="utf-8">
          </head>
          <body>
            <main class="container">
              ${this.md.render(file.toString())}
            </main>

            <script type="module" src="client.js"></script>
          </body>
          </html>`;

      default:
        return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <meta charset="utf-8">
        </head>
        <body>
        ${this.md.render(file.toString())}
        </body>
        </html>
        `;
    }
  }

  // Package Third Modules Requred Method.
  protected rewriteModule(content: string) {
    return content.replace(
      / from ['|"]([^'"]+)['|"]/g,
      (s0, s1) => {
        if (s1[0] !== "." && s1[1] !== "/") {
          return ` from "/@m/${s1}"`;
        }
        return s0;
      },
    );
  }

  // 启动
  listen(port?: number) {
    let Port: number = port ?? this.port();
    if (Port) this.userCfg["port"] = Port;
    this.app.listen(Port, () => {
      console.log(
        `🐝 STARTTING...\nOPEN: http://localhost:${Port}/`,
      );
    });
  }
}
