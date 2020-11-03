import { v4 as uuid } from "uuid";
import _, { Dictionary } from "lodash";
import { NonExistentEntityError } from "../errors/NonExistentEntityError";
import { User } from "./User";
import { IUsersService } from "./IUsersService";
import { BadArgumentError } from "../errors/BadArgumentError";

class UsersService implements IUsersService {
  private storage: Record<string, User> = {};
  private byEmail: Dictionary<User> = {};

  reindex() {
    this.byEmail = _.keyBy(Object.values(this.storage), "email");
  }

  async create(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    await this.ensureNoEmailDuplicates(email);
    const id = uuid();
    const newUser = {
      email,
      id,
      firstName,
      lastName,
    };
    this.storage[id] = newUser;
    this.reindex();
    return newUser;
  }

  async ensureNoEmailDuplicates(email: string): Promise<void> {
    if (this.byEmail[email]) {
      throw new BadArgumentError(
        `User with ${email} already exists. Pick a different one.`
      );
    }
  }

  async getOrCreate(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create(email, firstName, lastName);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.byEmail[email];
  }

  async getAll(): Promise<User[]> {
    return Object.values(this.storage);
  }

  async updateEmailById(id: string, newEmail: string): Promise<User> {
    await this.ensureNoEmailDuplicates(newEmail);
    const existing = await this.getById(id);
    existing.email = newEmail;
    this.reindex();
    return existing;
  }

  async deleteByEmail(email: string): Promise<User | undefined> {
    const existing = this.byEmail[email];
    if (!existing) {
      return undefined;
    }
    delete this.storage[existing.id];
    this.reindex();
    return existing;
  }

  async getById(id: string): Promise<User> {
    let existing = this.storage[id];
    if (!existing) {
      throw new NonExistentEntityError(`User by id ${id} does not exist`);
    }
    return existing;
  }

  async updateNameById(
    userId: string,
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    const existing = await this.getById(userId);
    existing.firstName = firstName;
    return existing;
  }
}

export { UsersService };
