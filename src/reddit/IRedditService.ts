import { RedditTopInterval } from "./RedditTopInterval";
import { RedditPost } from "./RedditPost";

export interface IRedditService {
  getTop(
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]>;
  validateSubredditExists(subreddit: string): Promise<boolean>;
}
