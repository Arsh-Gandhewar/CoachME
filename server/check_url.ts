import mongoose from 'mongoose';
import User from './src/models/User';
import { env } from './src/config/env';

async function run() {
  await mongoose.connect(env.MONGO_URI);
  const user = await User.findOne({ email: 'rohit@test.com' });
  console.log('Rohit profile image URL:', user?.profileImage);
  process.exit(0);
}
run();
