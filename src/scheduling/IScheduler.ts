export interface IScheduler {
  set(scheduleId: string, minuteOffset: number, timezoneOffset: number): void;
}
