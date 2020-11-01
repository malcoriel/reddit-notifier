import RedditClient from "reddit";
import { config } from "../typedConfig/typedConfig";
import _ from "lodash";

const redditApp = config.getTyped("redditApp");

const userAgent =
  "Reddit-notifier/1.0.0 (https://github.com/malcoriel/reddit-notifier)";
const client = new RedditClient({
  username: redditApp.botUser,
  password: redditApp.botPassword,
  appId: redditApp.id,
  appSecret: redditApp.secret,
  userAgent,
});

enum RedditTopInterval {
  Unknown,
  AllTime,
  Last24Hours,
}

type RedditPost = {
  title: string;
};

// Available: hour, day, week, month, year, all
const intervalToType = new Map<RedditTopInterval, string>([
  [RedditTopInterval.AllTime, "all"],
  [RedditTopInterval.Last24Hours, "day"],
]);

const redditService = {
  /**
   * Get top posts from a subreddit.
   * @caveats reddit API does not support its 'limit' param properly for this endpoint, so count can only be 0-25
   * @param subreddit - a subreddit name without /r
   * @param count - 0-25 slice the amount of returned posts.
   * @param interval - filter interval, see RedditTopInterval
   */
  async getTop(
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]> {
    const redditType = intervalToType.get(interval);
    // reddit ignores limit param for some reason, but omitting it causes incorrect sorting of posts
    let url = `/r/${subreddit}/top/?t=${redditType}&limit=${count}`;
    const res = await client.get(url);

    let posts = _.get(res, "data.children", []).map((raw: any) =>
      _.get(raw, "data", {})
    ) as RedditPost[];

    posts = posts.slice(0, count);

    return posts;
  },
  async validateSubredditExists(subreddit: string) {
    try {
      await client.get(
        `/api/search_reddit_names?query=${subreddit}&exact=true`
      );
      return true;
    } catch (e) {
      if (e.message.indexOf("Status code: 404") > -1) {
        return false;
      }
      throw e;
    }
  },
};

export { redditService, RedditTopInterval };