declare module "reddit" {
  export default class RedditClient {
    constructor({
      username: string,
      password: string,
      appId: string,
      appSecret: string,
      userAgent: string,
    });

    get(url: string, data?: any): any;
  }
}
