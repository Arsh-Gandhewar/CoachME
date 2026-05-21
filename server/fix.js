const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/trainersapp')
  .then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('trainers').updateMany({}, { $set: { verificationStatus: 'verified', isPremium: true } });
    console.log('Updated ' + result.modifiedCount + ' trainers to be verified and premium');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
