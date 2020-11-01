import { v4 as uuid } from "uuid";

import _, { Dictionary } from "lodash";
import { NonExistentEntityError } from "../errors/NonExistentEntityError";

type Subscription = {
  id: string;
  userId: string;
  subreddits: string[];
};

const storage: Record<string, Subscription> = {};
let byUserId: Dictionary<Subscription> = {};

const subscriptionsService = {
  async getOrCreate(forUserId: string): Promise<Subscription> {
    let sub = byUserId[forUserId];
    if (!sub) {
      let id = uuid();
      sub = { id, userId: forUserId, subreddits: [] };
      storage[id] = sub;
      subscriptionsService.reindex();
    }
    return sub;
  },
  reindex() {
    byUserId = _.keyBy(storage, "userId");
  },
  async addSubreddit(subId: string, subredditName: string) {
    const existing = storage[subId];
    if (!existing) {
      throw new NonExistentEntityError(
        `Subscription id ${subId} does not exist`
      );
    }
    existing.subreddits.push(subredditName);
    existing.subreddits = _.uniq(existing.subreddits);
  },
  async findByUserId(userId: string) {
    return byUserId[userId];
  },
};

export { subscriptionsService };
