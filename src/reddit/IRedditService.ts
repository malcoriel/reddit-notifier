import { RedditTopInterval } from "./RedditTopInterval";
import { RedditPost } from "./RedditPost";

export type SubredditInfo = { name: string; link: string };

export interface IRedditService {
  getTop(
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]>;
  validateSubredditExists(subreddit: string): Promise<boolean>;

  getSubredditInfo(subreddit: string): SubredditInfo;
}
