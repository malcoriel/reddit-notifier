import { DateTime } from "luxon";

export type Subscription = {
  id: string;
  userId: string;
  subreddits: string[];
  notificationTime?: DateTime;
};
