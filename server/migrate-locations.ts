import mongoose from 'mongoose';
import Trainer from './src/models/Trainer';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');

  const trainers = await Trainer.find({
    $or: [
      { exactLocation: { $exists: false } },
      { 'exactLocation.coordinates': { $size: 0 } },
      { 'exactLocation.coordinates': [0, 0] }
    ]
  });

  console.log(`Found ${trainers.length} trainers needing location updates.`);

  for (const t of trainers) {
    t.exactLocation = { type: 'Point', coordinates: [72.8777, 19.0760] }; // Mumbai fallback
    t.isExactLocationShared = false;
    await t.save();
  }

  console.log('Migration complete.');
  process.exit(0);
};

run().catch(console.error);
