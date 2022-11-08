import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import Config from "./config";
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
        "Start the BeeMarkdown Server",
        yargs => {
          return yargs.positional("port", {
            describe: "Set BeeMarkdown Server Port...",
            default: this.port(),
          });
        },
        argv => {
          new Server().listen(argv.port);
        }
      )
      .command("init", "初始化你的项目", () => {
        return "初始化";
      })
      .parse();
  }
}

new Command().initialize();
