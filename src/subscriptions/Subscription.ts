export type Subscription = {
  id: string;
  userId: string;
  subreddits: string[];
  notificationMinuteOffsetUTC?: number;
};
