import { IScheduler } from "./IScheduler";

class Scheduler implements IScheduler {
  set(scheduleId: string, minuteOffset: number, timezoneOffset: number): void {}
}

export { Scheduler };
