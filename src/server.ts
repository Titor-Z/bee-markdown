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
  }


  /* ==================================================
   * 一. 检测
   * ================================================== */

  // 设置入口文件名
  private entry() {
    return this.userCfg["entry"] ?? this.globalCfg["defaultEntry"];
  }

  // 统计Docs文件夹中的文件列表
  private initDocs() {
    // 检查本地是否存在全局的docs文件夹
    const docsPath = join(this.workspace, this.globalCfg["defaultDocs"]);
    if (!existsSync(docsPath)) return [];
    return readdirSync(docsPath);
  }


  /* ==================================================
   * 二. 系统映射挂载
   * ================================================== */

  // 主入口映射
  private main() {
    this.router.get("/", (ctx) => {
      ctx.status = 201;
      ctx.type = "text/html; charset='utf-8'";
      ctx.body = this.render(join(this.workspace, this.entry()));
    });
  }

  // 系统CSS映射
  private globalCssServer() {
    if (this.userCfg["useStyle"]) {
      for (const css in this.globalCfg["defaultCss"]) {
        this.globalCssRouter.get(css, (ctx) => {
          let file = readFileSync(
            join(this.BeeRoot, this.globalCfg["defaultCss"][css])
          );
          ctx.status = 201;
          ctx.type = "text/css";
          ctx.body = file.toString();
        });
      }
    }
    return false;
  }

  // 子文档映射
  private docsServer() {
    if (this.docs.length <= 0) return false;

    this.docs.forEach((doc) => {
      this.router.get(`/docs/${doc}`, (ctx) => {
        let mdFile: string = this.render(
          join(this.workspace, this.globalCfg["defaultDocs"], doc)
        );
        ctx.status = 201;
        ctx.type = "text/html; charset='utf-8'";
        ctx.body = mdFile.toString();
      });
    });
  }


  /* ==================================================
   * 其它: 工具函数
   * ================================================== */
  
  // markdown文档渲染函数
  protected render(mdFile: string): string {
    let file: Buffer = readFileSync(mdFile);

    if (this.userCfg["useStyle"]) {
      return `
        <link rel="stylesheet" href="http://localhost:${this.port()}/editor.css">
        <link rel="stylesheet" href="http://localhost:${this.port()}/style.css">
        ${this.md.render(file.toString())}
      `;
    }

    return this.md.render(file.toString());
  }


  // 启动
  listen(port?: number) {
    let Port: number = port ?? this.port();
    if(Port) this.userCfg["port"] = Port;
    this.app.listen(Port, () => {
      console.log(`🐝 STARTTING...\nOPEN: http://localhost:${Port}/`);
    });
  }
}