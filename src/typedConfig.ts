// src/config.service.ts
import config from "config";

// The relative path here resolves to `config/constraint.ts`
import { IAppConfig } from "../config/IAppConfig";

// Augment type definition for node-config.
// It helps TypeScript to learn about uor new method we're going to add to our prototype.
declare module "config" {
  interface IConfig {
    // This method accepts only first-level keys of our IConfigApp interface (e.g. 'cat').
    // TypeScript compiler is going to fail for anything else.
    getTyped: <T extends keyof IAppConfig>(key: T) => IAppConfig[T];
  }
}

const prototype: config.IConfig = Object.getPrototypeOf(config);
// Yep. It's still the same `config.get`. The real trick here was with augmenting the type definition for `config`.
prototype.getTyped = config.get;

export { config };
