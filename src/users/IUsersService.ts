import { User } from "./User";

export interface IUsersService {
  getById(id: string): User;
  getOrCreate(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  getAll(): Promise<User[]>;
  deleteByEmail(email: string): Promise<User | undefined>;
  updateEmailById(id: string, newEmail: string): Promise<User>;
  create(email: string, firstName?: string, lastName?: string): Promise<User>;
}
