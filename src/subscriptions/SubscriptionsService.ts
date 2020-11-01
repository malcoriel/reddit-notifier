import { v4 as uuid } from "uuid";
import _, { Dictionary } from "lodash";
import { NonExistentEntityError } from "../errors/NonExistentEntityError";
import { Subscription } from "./Subscription";
import { IRedditService } from "../reddit/IRedditService";
import { DateTime } from "luxon";
import { BadArgumentError } from "../errors/BadArgumentError";

class SubscriptionsService {
  private storage: Record<string, Subscription> = {};
  private byUserId: Dictionary<Subscription> = {};

  constructor(private redditService: IRedditService) {}

  async getOrCreate(forUserId: string): Promise<Subscription> {
    let sub = this.byUserId[forUserId];
    if (!sub) {
      let id = uuid();
      sub = { id, userId: forUserId, subreddits: [] };
      this.storage[id] = sub;
      this.reindex();
    }
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
  async findByUserId(userId: string) {
    return this.byUserId[userId];
  }

  async findById(subId: string) {
    return this.storage[subId];
  }

  async getById(subId: string): Promise<Subscription> {
    const existing = this.findById(subId);
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
    const parsed = DateTime.fromISO(isoTime).toUTC();
    if (!parsed.isValid) {
      throw new BadArgumentError(`Time string ${isoTime} is not in ISO format`);
    }
    const time = parsed.hour * 60 + parsed.minute;
    const existing = await this.getById(subId);
    existing.notificationMinuteOffsetUTC = time;
    this.storage[existing.id] = existing;
    this.reindex();
    return existing;
  }
}

export { SubscriptionsService };
