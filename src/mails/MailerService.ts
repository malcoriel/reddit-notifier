export interface IMailerService {
  send(data: any): void;
}

export class MailerService implements IMailerService {
  send(data: any): void {
    console.log("Triggering email send:", data);
  }
}
