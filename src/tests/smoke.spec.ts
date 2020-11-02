import { RedditTopInterval } from "../reddit/RedditTopInterval";
import * as locator from "../locator/locator";

describe("reddit-notifier", () => {
  it("can update a user", async () => {
    const service = locator.getUsersService();
    const user = await service.getOrCreate("malcoriel@gmail.com");
    await service.updateEmailById(user.id, "malcoriel+test@gmail.com");
    const updated = await service.findByEmail("malcoriel+test@gmail.com");
    expect(updated).not.toBeUndefined();
  });

  it("can create a user", async () => {
    const service = locator.getUsersService();
    await service.getOrCreate("malcoriel@gmail.com");
    const users = await service.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  it("extra: can delete a user", async () => {
    const service = locator.getUsersService();
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
    const service = locator.getSubscriptionsService({});
    const usersService = locator.getUsersService();
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

  it("refuses to add a non-existent subreddit", async () => {
    const service = locator.getSubscriptionsService({});
    const usersService = locator.getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    await expect(
      service.addSubreddit(subscription.id, "non_existent_funny")
    ).rejects.toMatchObject({ message: /does not exist/ });
  });

  it("can set the email send time", async () => {
    const service = locator.getSubscriptionsService({});
    const usersService = locator.getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    expect(subscription.notificationMinuteOffsetUTC).toEqual(480);
    await service.setNotificationTime(subscription.id, "19:21:09+01:00");
    const updatedSub = await service.getById(subscription.id);
    expect(updatedSub.notificationMinuteOffsetUTC).toEqual(1101);
  });

  it("can turn on/off the email for a user", async () => {
    const service = locator.getSubscriptionsService({});
    const usersService = locator.getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    expect(subscription.enabled).toEqual(true);
    await service.setNotificationEnabled(subscription.id, false);
    let updatedSub = await service.getById(subscription.id);
    expect(updatedSub.enabled).toEqual(false);
    await service.setNotificationEnabled(subscription.id, true);
    updatedSub = await service.getById(subscription.id);
    expect(updatedSub.enabled).toEqual(true);
  });

  it("can trigger a news email", async () => {
    const mockMailer = {
      send: jest.fn(),
    };
    const usersService = locator.getUsersService();
    const subscriptionsService = locator.getSubscriptionsService({
      mailer: mockMailer,
      users: usersService,
    });
    const user = await usersService.getOrCreate(
      "malcoriel@gmail.com",
      "Valeriy"
    );
    await subscriptionsService.getOrCreate(user.id);
    await subscriptionsService.triggerEmailForUser(user.id);
    expect(mockMailer.send).toBeCalledWith({
      subject: "Reddit Newsletter",
      title: "Reddit Newsletter",
      userName: "Valeriy",
      recipient: "Valeriy <malcoriel@gmail.com>",
      newPosts: [],
    });
  });

  it("can format new posts correctly", async () => {
    const usersService = locator.getUsersService();
    const service = locator.getSubscriptionsService({});
    const user1 = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription1 = await service.getOrCreate(user1.id);
    await service.addSubreddit(subscription1.id, "funny");
    await service.addSubreddit(subscription1.id, "worldnews");
    const posts = await service.getNewPostsForSubscription(subscription1);
    expect(posts).toEqual([
      {
        name: "funny",
        link: "https://reddit.com/r/funny/top",
        posts: [
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: expect.stringContaining("https"),
            url: expect.stringContaining("https://reddit.com/r/funny"),
          },
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: expect.stringContaining("https"),
            url: expect.stringContaining("https://reddit.com/r/funny"),
          },
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: expect.stringContaining("https"),
            url: expect.stringContaining("https://reddit.com/r/funny"),
          },
        ],
      },
      {
        name: "World News",
        link: "https://reddit.com/r/worldnews/top",
        posts: [
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: null,
            url: expect.stringContaining("https://reddit.com/r/worldnews"),
          },
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: null,
            url: expect.stringContaining("https://reddit.com/r/worldnews"),
          },
          {
            title: expect.stringContaining(""),
            upvotes: expect.stringContaining("k"),
            imageUrl: null,
            url: expect.stringContaining("https://reddit.com/r/worldnews"),
          },
        ],
      },
    ]);
  });

  it("can validate a subreddit exists", async () => {
    const service = locator.getRedditService();
    const exists = await service.validateSubredditExists("funny");
    expect(exists).toBe(true);
    const doesNotExist = await service.validateSubredditExists(
      "non_existent_funny"
    );
    expect(doesNotExist).toBe(false);
  });

  it("can get last 3 most-voted posts from a subreddit", async () => {
    const service = locator.getRedditService();
    const posts = await service.getTop("funny", 3, RedditTopInterval.AllTime);
    expect(posts.length).toBe(3);
    expect(posts[0].title).toContain("My cab driver tonight was so excited");
  });

  fit("can trigger a scheduled newsletter", async () => {
    const usersService = locator.getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscriptionsService = locator.getSubscriptionsService({
      users: usersService,
    });
    const subscription = await subscriptionsService.getOrCreate(user.id);
    jest.useFakeTimers();
    const spy = jest.spyOn(subscriptionsService, "triggerEmailForUser");
    await subscriptionsService.setNotificationTime(subscription.id, "10:00Z");
    // time resolution is 1 minute, so 61 seconds should guarantee the trigger
    jest.advanceTimersByTime(61000);
    expect(spy).toHaveBeenCalledWith(user.id);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
