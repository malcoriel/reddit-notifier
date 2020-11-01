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

  create: function (email: string): User {
    const id = uuid();
    const newUser = {
      email,
      id,
    };
    storage[id] = newUser;
    usersService.reindex();
    return newUser;
  },
  getOrCreate(email: string): User {
    let user = usersService.findByEmail(email);
    if (!user) {
      user = this.create(email);
    }
    return user;
  },

  findByEmail(email: string): User | undefined {
    return byEmail[email];
  },

  getAll() {
    return Object.values(storage);
  },
  updateEmailById(id: string, newEmail: string): User {
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
