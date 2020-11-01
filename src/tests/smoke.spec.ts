import { redditService, RedditTopInterval } from "../reddit/redditService";
import { usersService } from "../users/usersService";

describe("reddit-notifier", () => {
  it("can update a user", () => {
    expect(true).toBe(false);
  });

  fit("can create a user", async () => {
    await usersService.create("malcoriel@gmail.com");
    const users = usersService.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
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

  it("can validate a subreddit exists", async () => {
    const exists = await redditService.validateSubredditExists("funny");
    expect(exists).toBe(true);
    const doesNotExist = await redditService.validateSubredditExists(
      "funnyqweqweqwe"
    );
    expect(doesNotExist).toBe(false);
  });

  it("can get last 3 most-voted posts from a subreddit", async () => {
    const posts = await redditService.getTop(
      "funny",
      3,
      RedditTopInterval.AllTime
    );
    expect(posts.length).toBe(3);
    expect(posts[0].title).toContain("My cab driver tonight was so excited");
  });
});
