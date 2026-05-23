const mongoose = require('mongoose');

// Using a publicly accessible sample PDF for testing the resume button
const resumePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

mongoose.connect('mongodb://localhost:27017/trainersapp')
  .then(async () => {
    console.log('Connected to DB');
    const result = await mongoose.connection.collection('trainers').updateMany(
      {},
      { $set: { resume: resumePdfUrl } }
    );
    console.log('Updated ' + result.modifiedCount + ' trainers with a mock resume PDF.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
