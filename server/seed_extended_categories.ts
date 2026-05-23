import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/trainersapp';

const categories = [
  { name: 'Gym', slug: 'gym', isActive: true, order: 1 },
  { name: 'Yoga', slug: 'yoga', isActive: true, order: 2 },
  { name: 'Swimming', slug: 'swimming', isActive: true, order: 3 },
  { name: 'Badminton', slug: 'badminton', isActive: true, order: 4 },
  { name: 'Martial Arts', slug: 'martial-arts', isActive: true, order: 5 },
  { name: 'Dance', slug: 'dance', isActive: true, order: 6 },
  { name: 'Cricket', slug: 'cricket', isActive: true, order: 7 },
  { name: 'Football', slug: 'football', isActive: true, order: 8 },
  { name: 'Tennis', slug: 'tennis', isActive: true, order: 9 },
  { name: 'Basketball', slug: 'basketball', isActive: true, order: 10 },
  { name: 'Running', slug: 'running', isActive: true, order: 11 },
  { name: 'Cycling', slug: 'cycling', isActive: true, order: 12 },
  { name: 'Golf', slug: 'golf', isActive: true, order: 13 },
  { name: 'Nutrition', slug: 'nutrition', isActive: true, order: 14 },
  { name: 'Meditation', slug: 'meditation', isActive: true, order: 15 },
  { name: 'Physiotherapy', slug: 'physiotherapy', isActive: true, order: 16 },
];

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB');
    
    const categorySchema = new mongoose.Schema({
      name: String,
      slug: String,
      icon: String,
      isActive: Boolean,
      order: Number
    }, { strict: false });
    
    const Category = mongoose.model('Category', categorySchema);
    
    // Clear existing to avoid duplicates
    await Category.deleteMany({});
    
    const result = await Category.insertMany(categories);
    console.log(`Successfully seeded ${result.length} extended categories!`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  });
