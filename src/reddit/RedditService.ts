import RedditClient from "reddit";
import _ from "lodash";
import { RedditPost } from "./RedditPost";
import { RedditTopInterval } from "./RedditTopInterval";
import { IRedditService } from "./IRedditService";
import { IRedditAppConfig } from "../typedConfig/IAppConfig";

// Available: hour, day, week, month, year, all
const intervalToType = new Map<RedditTopInterval, string>([
  [RedditTopInterval.AllTime, "all"],
  [RedditTopInterval.Last24Hours, "day"],
]);

class RedditService implements IRedditService {
  private client: RedditClient;
  constructor(private redditAppConfig: IRedditAppConfig) {
    const userAgent =
      "Reddit-notifier/1.0.0 (https://github.com/malcoriel/reddit-notifier)";
    this.client = new RedditClient({
      username: this.redditAppConfig.botUser,
      password: this.redditAppConfig.botPassword,
      appId: this.redditAppConfig.id,
      appSecret: this.redditAppConfig.secret,
      userAgent,
    });
  }
  /**
   * @caveats reddit API does not support its 'limit' param properly for this endpoint, so count can only be 0-25
   */
  async getTop(
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]> {
    const redditType = intervalToType.get(interval);
    // reddit ignores limit param for some reason, but omitting it causes incorrect sorting of posts
    let url = `/r/${subreddit}/top/?t=${redditType}&limit=${count}`;
    const res = await this.client.get(url);

    let posts = _.get(res, "data.children", []).map((raw: any) =>
      _.get(raw, "data", {})
    ) as RedditPost[];

    posts = posts.slice(0, count);

    return posts;
  }
  async validateSubredditExists(subreddit: string): Promise<boolean> {
    try {
      await this.client.get(
        `/api/search_reddit_names?query=${subreddit}&exact=true`
      );
      return true;
    } catch (e) {
      // unfortunately, the HTTP error is masked by reddit.js, so there's no .statusCode
      if (e.message.indexOf("Status code: 404") > -1) {
        return false;
      }
      throw e;
    }
  }
}

export { RedditService };
