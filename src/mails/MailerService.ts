import { IMailerService } from "./IMailerService";
import logger from "../logging/logging";

export class MailerService implements IMailerService {
  async send(data: any): Promise<void> {
    logger.info(`Triggering email send: \n${JSON.stringify(data, null, 4)}`);
  }
}
