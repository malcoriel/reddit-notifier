import { IAppConfig } from "../src/typedConfig/IAppConfig";

const config: IAppConfig = {
  root: {
    redditApp: {
      id: "VL05CSLT6OkGng",
      secret: "oXTnnlr6wFq-1YD_URWT6TGtW1QE6Q",
      botUser: "malc-reddit-notifier",
      botPassword: "NHptdM9NBBQ473T",
    },
    api: {
      port: 8080,
    },
    logging: {
      level: "debug",
      enableConsole: true,
    },
  },
};

export default config;
