import { RedditService } from "../reddit/RedditService";
import { UsersService } from "../users/UsersService";
import { SubscriptionsService } from "../subscriptions/SubscriptionsService";
import { RedditTopInterval } from "../reddit/RedditTopInterval";
import { config } from "../typedConfig/typedConfig";
import { IMailerService, MailerService } from "../mails/MailerService";
import { IUsersService } from "../users/IUsersService";

describe("reddit-notifier", () => {
  const getRedditService = () =>
    new RedditService(config.getTyped("root").redditApp);

  const getMailerService = () => new MailerService();

  const getSubscriptionsService = (
    mailer?: IMailerService,
    users?: IUsersService
  ) => {
    return new SubscriptionsService(
      getRedditService(),
      mailer || getMailerService(),
      users || getUsersService()
    );
  };
  const getUsersService = () => new UsersService();

  it("can update a user", async () => {
    const service = getUsersService();
    const user = await service.getOrCreate("malcoriel@gmail.com");
    await service.updateEmailById(user.id, "malcoriel+test@gmail.com");
    const updated = await service.findByEmail("malcoriel+test@gmail.com");
    expect(updated).not.toBeUndefined();
  });

  it("can create a user", async () => {
    const service = getUsersService();
    await service.getOrCreate("malcoriel@gmail.com");
    const users = await service.getAll();
    expect(users).toContainEqual(
      expect.objectContaining({ email: "malcoriel@gmail.com" })
    );
  });

  it("extra: can delete a user", async () => {
    const service = getUsersService();
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
    const service = getSubscriptionsService();
    const usersService = getUsersService();
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
    const service = getSubscriptionsService();
    const usersService = getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    await expect(
      service.addSubreddit(subscription.id, "non_existent_funny")
    ).rejects.toMatchObject({ message: /does not exist/ });
  });

  it("can set the email send time", async () => {
    const service = getSubscriptionsService();
    const usersService = getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    expect(subscription.notificationMinuteOffsetUTC).toEqual(480);
    await service.setNotificationTime(subscription.id, "19:21:09+01:00");
    const updatedSub = await service.findById(subscription.id);
    expect(updatedSub.notificationMinuteOffsetUTC).toEqual(1101);
  });

  it("can turn on/off the email for a user", async () => {
    const service = getSubscriptionsService();
    const usersService = getUsersService();
    const user = await usersService.getOrCreate("malcoriel@gmail.com");
    const subscription = await service.getOrCreate(user.id);
    expect(subscription.enabled).toEqual(true);
    await service.setNotificationEnabled(subscription.id, false);
    let updatedSub = await service.findById(subscription.id);
    expect(updatedSub.enabled).toEqual(false);
    await service.setNotificationEnabled(subscription.id, true);
    updatedSub = await service.findById(subscription.id);
    expect(updatedSub.enabled).toEqual(true);
  });

  fit("can trigger a news email", async () => {
    const mockMailer = {
      send: jest.fn(),
    };
    const usersService = getUsersService();
    const service = getSubscriptionsService(mockMailer, usersService);
    const user1 = await usersService.getOrCreate(
      "malcoriel@gmail.com",
      "Valeriy"
    );
    const subscription1 = await service.getOrCreate(user1.id);
    await service.addSubreddit(subscription1.id, "funny");
    await service.addSubreddit(subscription1.id, "worldnews");
    await service.triggerEmailForUser(user1.id);
    expect(mockMailer.send).toBeCalledWith({
      subject: "Reddit Newsletter",
      title: "Reddit Newsletter",
      userName: "Valeriy",
      recipient: "Valeriy <malcoriel@gmail.com>",
      newPosts: [
        {
          name: "funny",
          link: "https://reddit.com/r/funny/top",
          posts: [
            {
              title: "wow",
              upvotes: "45k",
              imageUrl: "https://imgur.com/example.jpg",
              url: "https://reddit.com/r/funny/wow",
            },
            {
              title: "wow",
              upvotes: "45k",
              imageUrl: "https://imgur.com/example.jpg",
              url: "https://reddit.com/r/funny/wow",
            },
          ],
        },
        {
          name: "World News",
          link: "https://reddit.com/r/worldnews/top",
          posts: [
            {
              title: "wow",
              upvotes: "45k",
              imageUrl: "https://imgur.com/example.jpg",
              url: "https://reddit.com/r/funny/wow",
            },
            {
              title: "wow",
              upvotes: "45k",
              imageUrl: "https://imgur.com/example.jpg",
              url: "https://reddit.com/r/funny/wow",
            },
          ],
        },
      ],
    });
  });

  it("can validate a subreddit exists", async () => {
    const service = getRedditService();
    const exists = await service.validateSubredditExists("funny");
    expect(exists).toBe(true);
    const doesNotExist = await service.validateSubredditExists(
      "non_existent_funny"
    );
    expect(doesNotExist).toBe(false);
  });

  it("can get last 3 most-voted posts from a subreddit", async () => {
    const service = getRedditService();
    const posts = await service.getTop("funny", 3, RedditTopInterval.AllTime);
    expect(posts.length).toBe(3);
    expect(posts[0].title).toContain("My cab driver tonight was so excited");
  });
});
