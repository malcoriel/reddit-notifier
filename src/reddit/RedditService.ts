import RedditClient from "reddit";
import _ from "lodash";
import { RedditPost } from "./RedditPost";
import { RedditTopInterval } from "./RedditTopInterval";
import { IRedditService, SubredditInfo } from "./IRedditService";
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
    let posts = await this.getRawTopPosts(interval, subreddit, count);
    posts = posts.slice(0, count);
    return posts as RedditPost[];
  }

  // could've been 'internal' if such thing existed in TS
  async getRawTopPosts(
    interval: RedditTopInterval,
    subreddit: string,
    count: number
  ): Promise<any[]> {
    const redditType = intervalToType.get(interval);
    // reddit ignores limit param for some reason, but omitting it causes incorrect sorting of posts
    let url = `/r/${subreddit}/top/?t=${redditType}&limit=${count}`;
    const res = await this.client.get(url);

    return _.get(res, "data.children", []).map((raw: any) =>
      this.mapRawPost(_.get(raw, "data", {}))
    );
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

  async getSubredditInfo(subreddit: string): Promise<SubredditInfo> {
    const res = await this.client.get(`/r/${subreddit}/about`);
    const data = _.get(res, "data", {});
    return {
      name: data.title || "Unknown subreddit",
      link: `https://reddit.com${data.url}top`,
    };
  }

  private mapRawPost(raw: any): RedditPost {
    return {
      url: `https://reddit.com${raw.permalink}`,
      imageUrl: raw.url_overriden_by_dest || raw.thumbnail || null,
      title: raw.title || "Some post",
      upvotes: raw.ups ? this.formatUpvotes(raw.ups) : "?",
    };
  }

  private formatUpvotes(upvotes: number): string {
    if (upvotes > 999) {
      return Math.floor(upvotes / 1000) + "k";
    }
    return upvotes.toString();
  }
}

export { RedditService };
