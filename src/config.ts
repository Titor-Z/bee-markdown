import { existsSync, readFileSync } from "fs";
import { join } from "path/posix";
import { cwd } from "process";

export type UserConfigType = {
  routes?: {};
  useStyle?: boolean;
  port?: number;
  entry?: string;
};

export type GlobalConfigType = {
  defaultCss: {};
  defaultEntry: string;
  defaultPort: number;
  configFile: string;
  defaultDocs: string;
};

export default class Config {
  protected BeeRoot: string = join(__dirname, '../');
  protected workspace: string;
  private globalFileName: string = "default.mdrc";
  private sourceDirname: string = "/src";
  protected globalCfg: GlobalConfigType;
  protected userCfg: UserConfigType;

  constructor() {
    this.workspace = join(cwd());
    // this.BeeRoot = join(
    //   resolve(__dirname).substring(
    //     0,
    //     resolve(__dirname).lastIndexOf(this.sourceDirname)
    //   )
    // );

    // this.BeeRoot = join(__dirname.substring(0, __dirname.lastIndexOf(this.sourceDirname)));


    this.globalCfg = this.getGlobalConfig();
    this.userCfg = this.getUserConfig();
  }


  /**
   * 获取 BeeMarkdown全局配置
   * @returns GlobalConfigType
   */
  getGlobalConfig(): GlobalConfigType {
    let configContent = readFileSync(join(this.BeeRoot, this.globalFileName));
    return JSON.parse(configContent.toString()) ?? {};
  }


  /**
   * 获取 用户项目中的自定义配置
   * 如果没有配置文件则返回空{}
   * @returns UserConfigType || {}
   */
  getUserConfig(): UserConfigType {
    if (existsSync(join(this.workspace, this.globalCfg["configFile"]))) {
      const configContent = readFileSync(
        join(this.workspace, this.globalCfg["configFile"])
      );

      return JSON.parse(configContent.toString()) ?? {};
    }
    return {};
  }

  // 设置端口号码
  protected port() {
    return this.userCfg["port"] ?? this.globalCfg["defaultPort"];
  }
}
