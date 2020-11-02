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
  .get(
    "/:subscriptionId/status",
    handle(async (req) => {
      const { subscriptionId } = req.params;
      const enabled = await subscriptionsService.getStatus(subscriptionId);
      return { enabled: enabled };
    })
  )
  .put(
    "/:subscriptionId/status",
    handle(async (req) => {
      const { enable: enableRaw } = req.body;
      let enable;
      if (enableRaw === "true") {
        enable = true;
      } else if (enableRaw === "false") {
        enable = false;
      } else {
        throw new BadArgumentError(
          `body.enable must be either 'false' or 'true'`
        );
      }
      const { subscriptionId } = req.params;
      await subscriptionsService.setNotificationEnabled(subscriptionId, enable);
      return { enable };
    })
  );

export { subscriptionsRouter };
