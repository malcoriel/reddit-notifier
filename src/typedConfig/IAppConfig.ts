export type IRedditAppConfig = {
  id: string;
  secret: string;
  botUser: string;
  botPassword: string;
};

export type IApiConfig = {
  port: number;
};

export type ILoggingConfig = {
  enableConsole: boolean;
  level: string;
};

export type IAppConfig = {
  root: {
    api: IApiConfig;
    redditApp: IRedditAppConfig;
    logging: ILoggingConfig;
  };
};
