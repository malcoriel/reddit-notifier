type IRedditAppConfig = {
  id: string;
  secret: string;
  botUser: string;
  botPassword: string;
};

export type IAppConfig = {
  root: {
    redditApp: IRedditAppConfig;
  };
};
