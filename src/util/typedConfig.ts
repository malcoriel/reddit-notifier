// https://itnext.io/node-config-made-type-safe-5be0a08ad5ba
import config from "config";
import { IAppConfig } from "./IAppConfig";

declare module "config" {
  interface IConfig {
    getTyped: <T extends keyof IAppConfig>(key: T) => IAppConfig[T];
  }
}

const prototype: config.IConfig = Object.getPrototypeOf(config);
prototype.getTyped = config.get;

export { config };
