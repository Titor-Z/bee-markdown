import yargs, { Arguments, Argv } from "yargs";
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
        (yargs) => {
          return yargs.positional("port", {
            describe: "Set BeeMarkdown Server Port...",
            default: this.port(),
          });
        },
        (argv) => {
          new Server().listen(argv.port);
        }
      )
      .parse();
  }
}

new Command().initialize();
