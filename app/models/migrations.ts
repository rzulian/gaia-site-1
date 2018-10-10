import User from "./user";

export default {
  // Add number of finished games in a user's profile
  "0.1.0": {
    async up() {
      const users = await User.find({'meta.games': {$exists: false}});

      for (const user of users) {
        await user.updateGameStats();
        await user.save();
      }
    }
  }
};
