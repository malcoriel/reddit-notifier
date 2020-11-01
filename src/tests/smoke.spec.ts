import { redditService, RedditTopInterval } from "../reddit/redditService";
import { usersService } from "../users/usersService";
import { subscriptionsService } from "../subscriptions/subscriptionsService";

describe("reddit-notifier", () => {
  it("can update a user", async () => {
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    await usersService.updateEmailById(user.id, "malcoriel+test@gmail.com");
    const updated = await usersService.findByEmail("malcoriel+test@gmail.com");
    expect(updated).not.toBeUndefined();
  });

  it("can create a user", async () => {
    await usersService.getOrCreate("malcoriel@gmail.com");
    const users = await usersService.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  it("extra: can delete a user", async () => {
    await usersService.getOrCreate("malcoriel@gmail.com");
    const users = await usersService.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
    await usersService.deleteByEmail("malcoriel@gmail.com");
    const newUsers = await usersService.getAll();
    expect(newUsers).not.toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  fit("can create/update a list of favorite subreddits for a user", async () => {
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await subscriptionsService.getOrCreate(user.id);
    await subscriptionsService.addSubreddit(subscription.id, "funny");
    const updatedSub = await subscriptionsService.findByUserId(user.id);
    expect(updatedSub).toEqual(
      expect.objectContaining({
        subreddits: ["funny"],
        userId: user.id,
      })
    );
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
