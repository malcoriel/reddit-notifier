import { handle } from "./handle";
import { BadArgumentError } from "../errors/BadArgumentError";
import { Router } from "express";
import * as locator from "../locator/locator";

const subscriptionsService = locator.getSubscriptionsService({
  singleton: true,
});
const subscriptionsRouter = Router();
subscriptionsRouter
  .post(
    "/",
    handle(async (req) => {
      const { forUserId } = req.body;
      if (!forUserId) {
        throw new BadArgumentError(`forUserId is required`);
      }
      const user = await subscriptionsService.create(forUserId);
      return { user };
    })
  )
  .get(
    "/:subscriptionId",
    handle(async (req) => {
      const { subscriptionId } = req.params;
      const { email } = req.body;
      if (!email) {
        throw new BadArgumentError(`email is required`);
      }
      const subscription = await subscriptionsService.getById(subscriptionId);
      return { subscription };
    })
  )
  .post(
    "/:subscriptionId/trigger",
    handle(async (req) => {
      const { subscriptionId } = req.params;
      const { email } = req.body;
      if (!email) {
        throw new BadArgumentError(`email is required`);
      }
      await subscriptionsService.triggerEmailForUser(subscriptionId);
      return {};
    })
  )
  .put(
    "/:subscriptionId",
    handle(async (req) => {
      const { enable: enableRaw } = req.body;
      let enable: boolean | undefined;
      if (enableRaw === "true") {
        enable = true;
      } else if (enableRaw === "false") {
        enable = false;
      }
      const { subscriptionId } = req.params;
      if (typeof enable === "boolean") {
        await subscriptionsService.setNotificationEnabled(
          subscriptionId,
          enable
        );
      }
      return { enable };
    })
  );

export { subscriptionsRouter };
