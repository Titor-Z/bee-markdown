import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, sep } from "path";
import Config from "./config";

/**
 * @class 项目初始化工具
 */
export default class Generator extends Config {
  private bundle: Function[] = [];
  /**
   * 生成项目配置
   * @todo 生成用户默认配置文件
   * @todo 生成子目录
   * @todo 生成入口文件
   *
   * @constructor
   */
  constructor() {
    super();
    this.createCfgFile();
    this.createEntryFile();
    this.createChildDocFile();
  }

  // 创建配置文件
  private createCfgFile() {
    let filename = this.globalCfg["configFile"];
    let res = this.touchFile(
      filename,
      JSON.stringify(
        {
          routes: {},
          entry: this.globalCfg["defaultEntry"],
          useStyle: true,
          port: this.globalCfg["defaultPort"],
        },
        null,
        2
      )
    );

    if (res) this.logger(filename);
  }

  // 创建入口文件
  private createEntryFile() {
    let filename = this.globalCfg["defaultEntry"];
    let res = this.touchFile(filename, "# README.md");
    if (res) this.logger(filename);
  }

  private createChildDocFile() {
    let filename = `${this.globalCfg["defaultDocs"]}${sep}page.md`;
    let res = this.touchFile(filename, "# Page.md");
    if (res) this.logger(filename);
  }

  /**
   * 创建文件
   * 成功创建则返回文件名，失败返回false
   * @param {string} path 待创建的文件相对目录
   * @param {any} data 写入什么
   * @returns {string | false} filename | false
   */
  private touchFile(
    path: string,
    data: any
  ): string | false {
    const filePath = join(this.workspace, path);

    //检测目录
    if (existsSync(filePath)) {
      return false;
    }

    try {
      if (!existsSync(dirname(filePath)))
        mkdirSync(dirname(filePath)); //创建目录
      writeFileSync(filePath, data); //写入

      return path;
    } catch (error: any) {
      return false; //失败返回false
    }
  }

  /**
   * 命令行打印创建进程
   * @param {string} filename
   */
  private logger(filename: string) {
    console.log(`CREATE ${filename} done.`);
  }
}
