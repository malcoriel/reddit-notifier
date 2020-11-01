import { RedditService } from "../reddit/RedditService";
import { UsersService } from "../users/UsersService";
import { SubscriptionsService } from "../subscriptions/SubscriptionsService";
import { RedditTopInterval } from "../reddit/RedditTopInterval";

describe("reddit-notifier", () => {
  it("can update a user", async () => {
    const service = new UsersService();
    const user = await service.getOrCreate("malcoriel@gmail.com");
    await service.updateEmailById(user.id, "malcoriel+test@gmail.com");
    const updated = await service.findByEmail("malcoriel+test@gmail.com");
    expect(updated).not.toBeUndefined();
  });

  it("can create a user", async () => {
    const service = new UsersService();
    await service.getOrCreate("malcoriel@gmail.com");
    const users = await service.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  it("extra: can delete a user", async () => {
    const service = new UsersService();
    await service.getOrCreate("malcoriel@gmail.com");
    const users = await service.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
    await service.deleteByEmail("malcoriel@gmail.com");
    const newUsers = await service.getAll();
    expect(newUsers).not.toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  it("can create/update a list of favorite subreddits for a user", async () => {
    const service = new SubscriptionsService();
    const usersService = new UsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    await service.addSubreddit(subscription.id, "funny");
    const updatedSub = await service.findByUserId(user.id);
    expect(updatedSub).toEqual(
      expect.objectContaining({
        subreddits: ["funny"],
        userId: user.id,
      })
    );
  });

  xit("refuses to add a non-existent subreddit", async () => {
    const service = new SubscriptionsService();
    const usersService = new UsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    await expect(
      service.addSubreddit(subscription.id, "non_existent_funny")
    ).rejects.toEqual("123");
  });

  xit("can set the email send time", () => {
    expect(true).toBe(false);
  });

  xit("can turn on the email for a user", () => {
    expect(true).toBe(false);
  });

  xit("can turn off the email for a user", () => {
    expect(true).toBe(false);
  });

  xit("can trigger a news email at the specified time", () => {
    expect(true).toBe(false);
  });

  it("can validate a subreddit exists", async () => {
    const service = new RedditService();
    const exists = await service.validateSubredditExists("funny");
    expect(exists).toBe(true);
    const doesNotExist = await service.validateSubredditExists(
      "non_existent_funny"
    );
    expect(doesNotExist).toBe(false);
  });

  it("can get last 3 most-voted posts from a subreddit", async () => {
    const service = new RedditService();
    const posts = await service.getTop("funny", 3, RedditTopInterval.AllTime);
    expect(posts.length).toBe(3);
    expect(posts[0].title).toContain("My cab driver tonight was so excited");
  });
});
