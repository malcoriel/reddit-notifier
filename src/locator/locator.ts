import { RedditService } from "../reddit/RedditService";
import { config } from "../typedConfig/typedConfig";
import { MailerService } from "../mails/MailerService";
import { IMailerService } from "../mails/IMailerService";
import { IUsersService } from "../users/IUsersService";
import { SubscriptionsService } from "../subscriptions/SubscriptionsService";
import { UsersService } from "../users/UsersService";
import { IRedditService } from "../reddit/IRedditService";
import { ISubscriptionsService } from "../subscriptions/ISubscriptionsService";
import { Scheduler } from "../scheduling/Scheduler";
import { IScheduler } from "../scheduling/IScheduler";

let redditService: IRedditService;
let mailerService: IMailerService;
let subscriptionService: SubscriptionsService;
let usersService: IUsersService;
let scheduler: IScheduler;

interface GetSubscriptionsServiceParams {
  mailer?: IMailerService;
  users?: IUsersService;
  reddit?: IRedditService;
  singleton?: boolean;
  getCurrentMinutes?: () => number;
}

interface GetSchedulerParams extends GetSubscriptionsServiceParams {
  subscriptions?: ISubscriptionsService;
}

export const getScheduler = ({
  singleton,
  mailer,
  users,
  reddit,
  subscriptions,
}: GetSchedulerParams) => {
  const makeNew = () =>
    new Scheduler(
      subscriptions ||
        getSubscriptionsService({ singleton, mailer, users, reddit })
    );
  if (singleton) {
    scheduler = scheduler || makeNew();
    return scheduler;
  }
  return makeNew();
};

export const getRedditService = (singleton?: boolean): IRedditService => {
  const makeNew = () => new RedditService(config.getTyped("root").redditApp);
  if (singleton) {
    redditService = redditService || makeNew();
    return redditService;
  }
  return makeNew();
};

export const getMailerService = (singleton?: boolean): IMailerService => {
  const makeNew = () => new MailerService();
  if (singleton) {
    mailerService = mailerService || makeNew();
    return mailerService;
  }
  return makeNew();
};

export const getUsersService = (singleton?: boolean): IUsersService => {
  const makeNew = () => new UsersService();
  if (singleton) {
    usersService = usersService || makeNew();
    return usersService;
  }
  return makeNew();
};

export const getSubscriptionsService = ({
  mailer,
  users,
  reddit,
  singleton,
  getCurrentMinutes,
}: GetSubscriptionsServiceParams): ISubscriptionsService => {
  const makeNew = () =>
    new SubscriptionsService(
      reddit || getRedditService(singleton),
      mailer || getMailerService(singleton),
      users || getUsersService(singleton),
      getCurrentMinutes || undefined
    );

  if (singleton) {
    subscriptionService = subscriptionService || makeNew();
    return subscriptionService;
  }

  return makeNew();
};
