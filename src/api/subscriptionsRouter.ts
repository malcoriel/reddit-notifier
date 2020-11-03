import { handle } from "./handle";
import { BadArgumentError } from "../errors/BadArgumentError";
import { Router } from "express";
import * as locator from "../locator/locator";

const subscriptionsService = locator.getSubscriptionsService({
  singleton: true,
});
const subscriptionsRouter = Router();

const updateEnabledIfNeeded = async (
  enableRaw: string,
  subscriptionId: string
) => {
  let enable: boolean | undefined;
  if (enableRaw === "true") {
    enable = true;
  } else if (enableRaw === "false") {
    enable = false;
  }
  if (typeof enable === "boolean") {
    await subscriptionsService.setNotificationEnabled(subscriptionId, enable);
  }
};

const updateTimeIfNeeded = async (
  timeRaw: string | undefined,
  subscriptionId: string
) => {
  if (typeof timeRaw === "string") {
    await subscriptionsService.setNotificationTime(subscriptionId, timeRaw);
  }
};

const updateSubredditsIfNeeded = async (
  subreddits: string[],
  subscriptionId: string
) => {
  if (subreddits && subreddits.length > 0) {
    for await (const subreddit of subreddits) {
      await subscriptionsService.addSubreddit(subscriptionId, subreddit);
    }
  }
};

subscriptionsRouter
  .get(
    "/",
    handle(async () => {
      const subscriptions = await subscriptionsService.getAll();
      return { subscriptions };
    })
  )
  .post(
    "/",
    handle(async (req) => {
      const { forUserId } = req.body;
      if (!forUserId) {
        throw new BadArgumentError(`forUserId is required`);
      }
      const subscription = await subscriptionsService.getOrCreate(forUserId);
      return { subscription };
    })
  )
  .get(
    "/:subscriptionId",
    handle(async (req) => {
      const { subscriptionId } = req.params;
      const subscription = await subscriptionsService.getById(subscriptionId);
      return { subscription };
    })
  )
  .post(
    "/:subscriptionId/trigger",
    handle(async (req) => {
      const { subscriptionId } = req.params;
      await subscriptionsService.triggerEmail(subscriptionId);
      return {};
    })
  )
  .put(
    "/:subscriptionId",
    handle(async (req) => {
      const { subscriptionId } = req.params;

      const { enable: enableRaw, time: timeRaw, subreddits } = req.body;
      await updateEnabledIfNeeded(enableRaw, subscriptionId);
      await updateTimeIfNeeded(timeRaw, subscriptionId);
      await updateSubredditsIfNeeded(subreddits, subscriptionId);
      let subscription = await subscriptionsService.getById(subscriptionId);
      return { subscription };
    })
  );

export { subscriptionsRouter };
