import { v4 as uuid } from "uuid";
import _, { Dictionary } from "lodash";
import { NonExistentEntityError } from "../errors/NonExistentEntityError";
import { User } from "./User";

class UsersService {
  private storage: Record<string, User> = {};
  private byEmail: Dictionary<User> = {};

  reindex() {
    this.byEmail = _.keyBy(Object.values(this.storage), "email");
  }

  async create(email: string): Promise<User> {
    const id = uuid();
    const newUser = {
      email,
      id,
    };
    this.storage[id] = newUser;
    this.reindex();
    return newUser;
  }
  async getOrCreate(email: string): Promise<User> {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create(email);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.byEmail[email];
  }

  async getAll() {
    return Object.values(this.storage);
  }
  async updateEmailById(id: string, newEmail: string): Promise<User> {
    const existing = this.storage[id];
    if (!existing) {
      throw new NonExistentEntityError(`User by id ${id} does not exist`);
    }
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
}

export { UsersService };
