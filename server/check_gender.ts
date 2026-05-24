import mongoose from 'mongoose';
import User from './src/models/User';
import { env } from './src/config/env';

async function run() {
  await mongoose.connect(env.MONGO_URI);
  const users = await User.find({});
  for (const user of users) {
    console.log(`User: ${user.name}, Gender: ${user.gender}`);
  }
  process.exit(0);
}

run();
