import { v4 as uuid } from "uuid";
import _, { Dictionary } from "lodash";
type User = {
  email: string;
  id: string;
};
const storage: Record<string, User> = {};
let byEmail: Dictionary<User> = {};

class NonExistentEntityError implements Error {
  constructor(public message: string) {
    this.message = message;
  }

  name = "NON_EXISTENT_ENTITY";
}

const usersService = {
  reindex() {
    byEmail = _.keyBy(Object.values(storage), "email");
  },

  async create(email: string): Promise<User> {
    const id = uuid();
    const newUser = {
      email,
      id,
    };
    storage[id] = newUser;
    usersService.reindex();
    return newUser;
  },
  async getOrCreate(email: string): Promise<User> {
    let user = await usersService.findByEmail(email);
    if (!user) {
      user = await this.create(email);
    }
    return user;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return byEmail[email];
  },

  async getAll() {
    return Object.values(storage);
  },
  async updateEmailById(id: string, newEmail: string): Promise<User> {
    const existing = storage[id];
    if (!existing) {
      throw new NonExistentEntityError(`User by id ${id} does not exist`);
    }
    existing.email = newEmail;
    usersService.reindex();
    return existing;
  },
};

export { usersService };
