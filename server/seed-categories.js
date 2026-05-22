const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const newCategories = [
  { name: 'Tennis', slug: 'tennis', description: 'Tennis coaching', order: 9 },
  { name: 'Basketball', slug: 'basketball', description: 'Basketball coaching', order: 10 },
  { name: 'Running', slug: 'running', description: 'Running and athletics', order: 11 },
  { name: 'Cycling', slug: 'cycling', description: 'Cycling and biking', order: 12 },
  { name: 'Golf', slug: 'golf', description: 'Golf coaching', order: 13 },
  { name: 'Nutrition', slug: 'nutrition', description: 'Diet and nutrition', order: 14 }
];

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/trainersapp');
    console.log('Connected to DB');
    
    for (const cat of newCategories) {
      await Category.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
      console.log(`Upserted category: ${cat.name}`);
    }
    
    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories', err);
    process.exit(1);
  }
}

seed();
