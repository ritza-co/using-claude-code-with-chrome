class UserStore {
  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  create(userData) {
    const user = {
      id: this.currentId++,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    };

    this.users.set(user.id, user);
    return user;
  }

  getAll() {
    return Array.from(this.users.values());
  }
}

module.exports = new UserStore();
