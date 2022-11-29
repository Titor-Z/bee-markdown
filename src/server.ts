import { existsSync, readdirSync, readFileSync } from "fs";
import Application from "koa";
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
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .use(this.globalCssRouter.routes())
      .use(this.globalCssRouter.allowedMethods());

    this.globalCssServer();
    this.docsServer();
    this.main();
    this.route();
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
      this.globalCfg["defaultDocs"]
    );
    if (!existsSync(docsPath)) return [];
    return readdirSync(docsPath);
  }

  /* ==================================================
   * 二. 系统映射挂载
   * ================================================== */

  // 主入口映射
  private main() {
    this.router.get("/", ctx => {
      ctx.status = 200;
      ctx.type = "text/html; charset='utf-8'";
      ctx.body = this.render(
        join(this.workspace, this.entry())
      );
    });
  }

  // 系统CSS映射
  private globalCssServer() {
    return this.globalCssRouter.get("/default.css", ctx => {
      ctx.status = 200;
      ctx.type = "text/css";
      ctx.body = readFileSync(
        join(
          this.BeeRoot,
          "node_modules/@titor-z/markdown-theme/dist/dist.css"
        )
      ).toString();
    });
  }

  // 子文档映射
  private docsServer() {
    if (this.docs.length <= 0) return false;

    this.docs.forEach(doc => {
      this.router.get(`/docs/${doc}`, ctx => {
        let mdFile: string = this.render(
          join(
            this.workspace,
            this.globalCfg["defaultDocs"],
            doc
          )
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
      this.router.get(route, ctx => {
        let file = readFileSync(
          join(
            this.workspace,
            this.userCfg["routes"][route]
          )
        );
        ctx.status = 200;
        ctx.type = "text/css";
        ctx.body = file.toString();
      });
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
            <link rel="stylesheet" href="/default.css">
          </head>
          <body>
            <main class="container">
              ${this.md.render(file.toString())}
            </main>
          </body>
          </html>`;
        break;

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
        `
        break;
    }
  }

  // 启动
  listen(port?: number) {
    let Port: number = port ?? this.port();
    if (Port) this.userCfg["port"] = Port;
    this.app.listen(Port, () => {
      console.log(
        `🐝 STARTTING...\nOPEN: http://localhost:${Port}/`
      );
    });
  }
}
