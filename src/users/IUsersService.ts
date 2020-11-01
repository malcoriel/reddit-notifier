import { User } from "./User";

export interface IUsersService {
  getById(id: string): User;
}
