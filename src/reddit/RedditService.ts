import RedditClient from "reddit";
import { config } from "../typedConfig/typedConfig";
import _ from "lodash";
import { RedditPost } from "./RedditPost";
import { RedditTopInterval } from "./RedditTopInterval";

// Available: hour, day, week, month, year, all
const intervalToType = new Map<RedditTopInterval, string>([
  [RedditTopInterval.AllTime, "all"],
  [RedditTopInterval.Last24Hours, "day"],
]);

class RedditService {
  private client: RedditClient;
  constructor() {
    const redditApp = config.getTyped("redditApp");

    const userAgent =
      "Reddit-notifier/1.0.0 (https://github.com/malcoriel/reddit-notifier)";
    this.client = new RedditClient({
      username: redditApp.botUser,
      password: redditApp.botPassword,
      appId: redditApp.id,
      appSecret: redditApp.secret,
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
  async validateSubredditExists(subreddit: string) {
    try {
      await this.client.get(
        `/api/search_reddit_names?query=${subreddit}&exact=true`
      );
      return true;
    } catch (e) {
      if (e.message.indexOf("Status code: 404") > -1) {
        return false;
      }
      throw e;
    }
  }
}

export { RedditService };
