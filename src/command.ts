import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import Config from "./config";
import Generator from "./generator";
import Server from "./server";

export default class Command extends Config {
  commander: Argv<{}>;

  constructor() {
    super();
    this.commander = yargs(hideBin(process.argv));
  }

  initialize() {
    this.commander
      .command(
        "start [port]",
        "开始使用 BeeMarkdown 编辑器",
        (yargs) => {
          return yargs.positional("port", {
            describe: "Set BeeMarkdown Server Port...",
            default: this.port(),
          });
        },
        (argv) => {
          new Server().listen(argv.port);
        },
      )
      .command("init", "为当前项目初始化 BeeMarkdown 所需工作", () => {
        new Generator();
      })
      .parse();
  }
}

new Command().initialize();
