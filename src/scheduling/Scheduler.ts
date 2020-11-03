import { IScheduler } from "./IScheduler";
import { CronJob } from "cron";
import logger from "../logging/logging";
import { ISubscriptionsService } from "../subscriptions/ISubscriptionsService";

class Scheduler implements IScheduler {
  private job?: CronJob;

  constructor(private subscriptionsService: ISubscriptionsService) {}

  private isExecuting: boolean = false;
  private async executeOnce() {
    if (this.isExecuting) {
      return;
    }
    try {
      this.isExecuting = true;
      logger.info("checking subscriptions...");
      await this.subscriptionsService.checkSubscriptions();
      logger.info("done checking subscriptions by schedule");
    } catch (e) {
      logger.error(`failed to check subscriptions`, e);
    } finally {
      this.isExecuting = false;
    }
  }

  init(): void {
    this.job = new CronJob(
      "0 * * * * *",
      () => {
        this.executeOnce();
      },
      null,
      false,
      "UTC"
    );
    this.job.start();
    logger.info("cronjob started");
  }

  stop(): void {
    if (this.job) {
      this.job.stop();
    }
  }
}

export { Scheduler };
