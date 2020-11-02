import { handle } from "../handle";
import { BadArgumentError } from "../../errors/BadArgumentError";
import { Router } from "express";
import * as locator from "../../locator/locator";

const usersService = locator.getUsersService(true);
const usersRouter = Router();
usersRouter
  .get(
    "/",
    handle(async () => {
      const users = await usersService.getAll();
      return { users };
    })
  )
  .post(
    "/",
    handle(async (req) => {
      const { email, firstName, lastName } = req.body;
      if (!email) {
        throw new BadArgumentError(`email is required`);
      }
      const user = await usersService.create(email, firstName, lastName);
      return { user };
    })
  )
  .put(
    "/:userId",
    handle(async (req) => {
      const { userId } = req.params;
      const { email } = req.body;
      if (!email) {
        throw new BadArgumentError(`email is required`);
      }
      const user = await usersService.updateEmailById(userId, email);
      return { user };
    })
  )
  .get(
    "/:userId",
    handle(async (req) => {
      const { userId } = req.params;
      const user = await usersService.getById(userId);
      return { user };
    })
  );

export { usersRouter };
