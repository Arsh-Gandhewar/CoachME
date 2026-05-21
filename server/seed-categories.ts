import mongoose from 'mongoose';
import Category from './src/models/Category';
import dotenv from 'dotenv';
dotenv.config();

const categories = [
  { name: 'Gym', icon: 'Dumbbell', color: '#FF5722', order: 1 },
  { name: 'Yoga', icon: 'Heart', color: '#7C4DFF', order: 2 },
  { name: 'Swimming', icon: 'Waves', color: '#00BCD4', order: 3 },
  { name: 'Badminton', icon: 'Target', color: '#4CAF50', order: 4 },
  { name: 'Martial Arts', icon: 'Swords', color: '#F44336', order: 5 },
  { name: 'Dance', icon: 'Music', color: '#E91E63', order: 6 },
  { name: 'Cricket', icon: 'Trophy', color: '#FF9800', order: 7 },
  { name: 'Football', icon: 'CircleDot', color: '#2196F3', order: 8 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB for seeding categories...');
    
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.name.toLowerCase().replace(/\s+/g, '-') },
        { ...cat, slug: cat.name.toLowerCase().replace(/\s+/g, '-') },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
