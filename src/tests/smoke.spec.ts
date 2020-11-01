import { reddit, RedditTopInterval } from "../reddit/reddit";

describe("reddit-notifier", () => {
  it("can create a user", () => {
    expect(true).toBe(false);
  });

  it("can update a user", () => {
    expect(true).toBe(false);
  });

  it("extra: can list users", () => {
    expect(true).toBe(false);
  });

  it("extra: can delete a user", () => {
    expect(true).toBe(false);
  });

  it("can create/set a list of favorite subreddits for a user", () => {
    expect(true).toBe(false);
  });

  it("can set the email send time", () => {
    expect(true).toBe(false);
  });

  it("can turn on the email for a user", () => {
    expect(true).toBe(false);
  });

  it("can turn off the email for a user", () => {
    expect(true).toBe(false);
  });

  it("can trigger a news email at the specified time", () => {
    expect(true).toBe(false);
  });

  it("can list subreddits", () => {
    expect(true).toBe(false);
  });

  fit("can get last 3 most-voted posts from a subreddit", async () => {
    const posts = await reddit.getTop("funny", 3, RedditTopInterval.AllTime);
    expect(posts.length).toBe(3);
    expect(posts[0].title).toContain("My cab driver tonight was so excited");
  });
});
