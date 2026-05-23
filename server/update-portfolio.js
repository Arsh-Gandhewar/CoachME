const mongoose = require('mongoose');
const images = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop'
];

mongoose.connect('mongodb://localhost:27017/trainersapp')
  .then(async () => {
    console.log('Connected to DB');
    const result = await mongoose.connection.collection('trainers').updateMany(
      {},
      { $set: { portfolioImages: images } }
    );
    console.log('Updated ' + result.modifiedCount + ' trainers.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
