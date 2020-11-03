import { v4 as uuid } from "uuid";
import _, { Dictionary } from "lodash";
import { NonExistentEntityError } from "../errors/NonExistentEntityError";
import { Subscription } from "./Subscription";
import { IRedditService } from "../reddit/IRedditService";
import { DateTime } from "luxon";
import { BadArgumentError } from "../errors/BadArgumentError";
import { IUsersService } from "../users/IUsersService";
import pMap from "p-map";
import { RedditTopInterval } from "../reddit/RedditTopInterval";
import { IMailerService } from "../mails/IMailerService";
import { ISubscriptionsService } from "./ISubscriptionsService";
import logger from "../logging/logging";

const defaultGetCurrentMinutes = (): number => {
  let dateTime = DateTime.utc();
  return dateTime.hour * 60 + dateTime.minute;
};

class SubscriptionsService implements ISubscriptionsService {
  private storage: Record<string, Subscription> = {};
  private byUserId: Dictionary<Subscription> = {};

  constructor(
    private redditService: IRedditService,
    private mailerService: IMailerService,
    private usersService: IUsersService,
    private getCurrentMinutes: () => number = defaultGetCurrentMinutes
  ) {}

  async getOrCreate(forUserId: string): Promise<Subscription> {
    let sub = this.byUserId[forUserId];
    if (!sub) {
      sub = await this.create(forUserId);
    }
    return sub;
  }

  async create(forUserId: string): Promise<Subscription> {
    let id = uuid();
    let sub = {
      id,
      userId: forUserId,
      subreddits: [],
      notificationMinuteOffsetUTC: this.offsetFromParsed(
        this.dateTimeFromString("08:00Z")
      ),
      enabled: true,
    };
    this.storage[id] = sub;
    this.reindex();
    return sub;
  }

  reindex() {
    this.byUserId = _.keyBy(this.storage, "userId");
  }
  async addSubreddit(subId: string, subredditName: string) {
    const existing = await this.getById(subId);
    const subredditExists = await this.redditService.validateSubredditExists(
      subredditName
    );
    if (!subredditExists) {
      throw new NonExistentEntityError(
        `Subreddit named ${subredditName} does not exist`
      );
    }
    existing.subreddits.push(subredditName);
    existing.subreddits = _.uniq(existing.subreddits);
  }
  async findByUserId(userId: string): Promise<Subscription> {
    return this.byUserId[userId];
  }

  async getByUserId(userId: string): Promise<Subscription> {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      throw new NonExistentEntityError(
        `Subscription for user id ${userId} not found`
      );
    }
    return existing;
  }

  async findById(subId: string): Promise<Subscription> {
    return this.storage[subId];
  }

  async getById(subId: string): Promise<Subscription> {
    const existing = await this.findById(subId);
    if (!existing) {
      throw new NonExistentEntityError(
        `Subscription id ${subId} does not exist`
      );
    }
    return existing;
  }

  async setNotificationTime(
    subId: string,
    isoTime: string
  ): Promise<Subscription> {
    const parsed = this.dateTimeFromString(isoTime);
    if (!parsed.isValid) {
      throw new BadArgumentError(`Time string ${isoTime} is not in ISO format`);
    }
    const time = this.offsetFromParsed(parsed);
    const existing = await this.getById(subId);
    existing.notificationMinuteOffsetUTC = time;
    return existing;
  }

  offsetFromParsed(parsed: DateTime) {
    return this.offsetFromTimeParts(parsed.hour, parsed.minute);
  }

  dateTimeFromString(isoDateTime: string) {
    return DateTime.fromISO(isoDateTime).toUTC();
  }

  offsetFromTimeParts(hours: number, minutes: number) {
    return hours * 60 + minutes;
  }

  async setNotificationEnabled(
    subId: string,
    value: boolean
  ): Promise<Subscription> {
    const existing = await this.getById(subId);
    existing.enabled = value;
    return existing;
  }

  async triggerEmailForUser(userId: string): Promise<void> {
    let subscription = await this.getByUserId(userId);
    return this.trigger(subscription);
  }

  private async trigger(subscription: Subscription): Promise<void> {
    if (!subscription.enabled) {
      return;
    }
    const user = await this.usersService.getById(subscription.userId);
    const newPosts = await this.getNewPostsForSubscription(subscription);
    let firstName = user.firstName || "fellow redditor";
    let lastNameSuffix = user.lastName ? " " + user.lastName : "";
    let fullName = user.firstName
      ? `${user.firstName}${lastNameSuffix}`
      : undefined;
    let recipient = fullName ? `${fullName} <${user.email}>` : user.email;

    await this.mailerService.send({
      subject: "You've got new posts on reddit!",
      title: "Reddit Newsletter",
      userName: firstName,
      recipient: recipient,
      newPosts,
    });
  }

  async getNewPostsForSubscription(sub: Subscription) {
    return pMap(
      sub.subreddits,
      async (subreddit) => {
        const posts = await this.redditService.getTop(
          subreddit,
          3,
          RedditTopInterval.Last24Hours
        );
        const { name, link } = await this.redditService.getSubredditInfo(
          subreddit
        );
        return {
          name,
          link,
          posts,
        };
      },
      { concurrency: 4 }
    );
  }

  async checkSubscriptions(): Promise<void> {
    const subscriptions = await this.getAll();
    const toTrigger = [];
    for (const sub of subscriptions) {
      let currentMinutes = this.getCurrentMinutes();
      logger.info(
        `Subscription for user ${sub.userId}: enabled=${sub.enabled}, offset=${sub.notificationMinuteOffsetUTC}, current=${currentMinutes}`
      );
      if (
        sub.enabled &&
        currentMinutes === sub.notificationMinuteOffsetUTC &&
        sub.subreddits.length > 0
      ) {
        toTrigger.push(() => this.triggerEmailForUser(sub.userId));
      }
    }
    await pMap(toTrigger, (fn) => fn(), { concurrency: 4 });
  }

  async getAll(): Promise<Subscription[]> {
    return Object.values(this.storage);
  }

  async triggerEmail(subscriptionId: string): Promise<void> {
    const subscription = await this.getById(subscriptionId);
    return this.trigger(subscription);
  }
}

export { SubscriptionsService };
