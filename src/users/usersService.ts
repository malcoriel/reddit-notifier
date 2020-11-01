import { v4 as uuid } from "uuid";

type User = {
  email: string;
  id: string;
};
const storage: Record<string, User> = {};
const usersService = {
  create(email: string) {
    let id = uuid();
    storage[id] = {
      email,
      id,
    };
  },
  getAll() {
    return Object.values(storage);
  },
};

export { usersService };
