import mongoose from 'mongoose';
import User from './src/models/User';
import { env } from './src/config/env';

async function run() {
  await mongoose.connect(env.MONGO_URI);
  const user = await User.findOne({ email: 'rohit@test.com' }); // Assuming email is rohit@test.com
  console.log('Rohit profile image:', user?.profileImage);

  // If we want to check all users named Rohit
  const rohits = await User.find({ name: { $regex: /rohit/i } });
  for (const r of rohits) {
    console.log(`Rohit (${r.email}):`, r.profileImage);
  }
  
  process.exit(0);
}

run();
