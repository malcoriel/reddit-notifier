import { IMailerService } from "./IMailerService";
import logger from "../logging/logging";

export class MailerService implements IMailerService {
  send(data: any): void {
    logger.info("Triggering email send:", data);
  }
}
