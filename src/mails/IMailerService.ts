export interface IMailerService {
  send(data: any): Promise<void>;
}
