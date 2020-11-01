enum RedditTopInterval {
  Unknown,
  AllTime,
  Last24Hours,
}

type RedditPost = {
  title: string;
};

const reddit = {
  async getTop(
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]> {
    return [{ title: "a" }, { title: "b" }, { title: "c" }];
  },
};

export { reddit, RedditTopInterval };
