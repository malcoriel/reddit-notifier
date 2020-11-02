import { RedditService } from "../reddit/RedditService";
import { config } from "../typedConfig/typedConfig";
import { MailerService } from "../mails/MailerService";
import { IMailerService } from "../mails/IMailerService";
import { IUsersService } from "../users/IUsersService";
import { SubscriptionsService } from "../subscriptions/SubscriptionsService";
import { UsersService } from "../users/UsersService";
import { IRedditService } from "../reddit/IRedditService";

let redditService: IRedditService;
let mailerService: IMailerService;
let subscriptionService: SubscriptionsService;
let usersService: IUsersService;

export const getRedditService = (singleton?: boolean) => {
  const makeNew = () => new RedditService(config.getTyped("root").redditApp);
  if (singleton) {
    redditService = redditService || makeNew();
    return redditService;
  }
  return makeNew();
};

export const getMailerService = (singleton?: boolean) => {
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

interface GetSubscriptionsServiceParams {
  mailer?: IMailerService;
  users?: IUsersService;
  reddit?: IRedditService;
  singleton?: boolean;
}

export const getSubscriptionsService = ({
  mailer,
  users,
  reddit,
  singleton,
}: GetSubscriptionsServiceParams) => {
  const makeNew = () =>
    new SubscriptionsService(
      reddit || getRedditService(singleton),
      mailer || getMailerService(singleton),
      users || getUsersService(singleton)
    );

  if (singleton) {
    subscriptionService = subscriptionService || makeNew();
    return subscriptionService;
  }

  return makeNew();
};
