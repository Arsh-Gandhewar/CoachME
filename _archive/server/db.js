const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create Trainers table
      db.run(`CREATE TABLE IF NOT EXISTS trainers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        specializations TEXT,
        experience INTEGER,
        rating REAL,
        reviewCount INTEGER,
        price INTEGER,
        priceUnit TEXT,
        location TEXT,
        city TEXT,
        distance REAL,
        verified BOOLEAN,
        premium BOOLEAN,
        bio TEXT,
        certifications TEXT,
        languages TEXT,
        sessionTypes TEXT,
        availability TEXT,
        achievements TEXT,
        gallery TEXT,
        reviews TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Create Bookings table
      db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        trainer_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'pending',
        amount INTEGER,
        payment_intent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(trainer_id) REFERENCES trainers(id)
      )`);

      // Create Chats table
      db.run(`CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        trainer_id INTEGER,
        message TEXT,
        sender TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(trainer_id) REFERENCES trainers(id)
      )`);

      // Seed trainers if empty
      db.get('SELECT COUNT(*) as count FROM trainers', (err, row) => {
        if (!err && row.count === 0) {
          seedTrainers();
        }
      });
    });
  }
});

function seedTrainers() {
  const trainersFilePath = path.resolve(__dirname, '../src/data/trainers.js');
  try {
    const fileContent = fs.readFileSync(trainersFilePath, 'utf8');
    const scriptToEval = fileContent.replace(/export\s+\{.*\}\s*;/g, '') + '; return trainers;';
    const trainersData = new Function(scriptToEval)();

    const stmt = db.prepare(`INSERT INTO trainers (
      name, category, specializations, experience, rating, reviewCount, price, priceUnit,
      location, city, distance, verified, premium, bio, certifications, languages, sessionTypes,
      availability, achievements, gallery, reviews
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    trainersData.forEach(t => {
      stmt.run(
        t.name, t.category, JSON.stringify(t.specializations || []), t.experience, t.rating, t.reviewCount,
        t.price, t.priceUnit, t.location, t.city, t.distance, t.verified ? 1 : 0, t.premium ? 1 : 0,
        t.bio, JSON.stringify(t.certifications || []), JSON.stringify(t.languages || []), JSON.stringify(t.sessionTypes || []),
        JSON.stringify(t.availability || {}), JSON.stringify(t.achievements || []), JSON.stringify(t.gallery || []), JSON.stringify(t.reviews || [])
      );
    });
    stmt.finalize();
    console.log('Seeded mock trainers.');
  } catch (error) {
    console.error('Error seeding trainers:', error);
  }
}

module.exports = db;
