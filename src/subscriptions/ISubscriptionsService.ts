import { Subscription } from "./Subscription";
import { DateTime } from "luxon";

export interface ISubscriptionsService {
  getOrCreate(forUserId: string): Promise<Subscription>;
  create(forUserId: string): Promise<Subscription>;
  addSubreddit(subId: string, subredditName: string): Promise<void>;
  findByUserId(userId: string): Promise<Subscription | undefined>;
  getByUserId(userId: string): Promise<Subscription>;
  findById(subId: string): Promise<Subscription | undefined>;
  getById(subId: string): Promise<Subscription>;
  setNotificationTime(subId: string, isoTime: string): Promise<Subscription>;
  offsetFromParsed(parsed: DateTime): number;
  dateTimeFromString(isoDateTime: string): DateTime;
  offsetFromTimeParts(hours: number, minutes: number): number;
  setNotificationEnabled(subId: string, value: boolean): Promise<Subscription>;
  getStatus(subId: string): Promise<boolean>;
  triggerEmailForUser(userId: string): Promise<void>;
  getNewPostsForSubscription(sub: Subscription): Promise<any>;
}
