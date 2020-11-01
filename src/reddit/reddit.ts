import RedditClient from "reddit";
import { config } from "../typedConfig";
import _ from "lodash";

const redditApp = config.getTyped("redditApp");

const client = new RedditClient({
  username: redditApp.botUser,
  password: redditApp.botPassword,
  appId: redditApp.id,
  appSecret: redditApp.secret,
  userAgent:
    "Reddit-notifier/1.0.0 (https://github.com/malcoriel/reddit-notifier)",
});

enum RedditTopInterval {
  Unknown,
  AllTime,
  Last24Hours,
}

type RedditPost = {
  title: string;
};

const reddit = {
  getTop: async function (
    subreddit: string,
    count: number,
    interval: RedditTopInterval
  ): Promise<RedditPost[]> {
    // Submit a link to the /r/BitMidi subreddit
    const res = await client.get("/r/funny/top/?t=all&limit=3", {
      sr: "WeAreTheMusicMakers",
      kind: "link",
      resubmit: true,
      title: "BitMidi – 100K+ Free MIDI files",
      url: "https://bitmidi.com",
    });

    const posts = _.get(res, "data.children", []).map((raw: any) =>
      _.get(raw, "data", {})
    ) as RedditPost[];

    return posts;
  },
};

export { reddit, RedditTopInterval };
