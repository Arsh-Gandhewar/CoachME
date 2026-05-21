const express = require('express');
const db = require('../db');

const router = express.Router();

const parseTrainerFields = (trainer) => {
  const jsonFields = ['specializations', 'certifications', 'languages', 'sessionTypes', 'availability', 'achievements', 'gallery', 'reviews'];
  const parsed = { ...trainer };
  jsonFields.forEach(field => {
    if (parsed[field]) {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (e) {
        parsed[field] = parsed[field].startsWith('{') ? {} : [];
      }
    }
  });
  parsed.verified = !!parsed.verified;
  parsed.premium = !!parsed.premium;
  return parsed;
};

router.get('/', (req, res) => {
  const { query, category } = req.query;
  
  let sql = 'SELECT * FROM trainers WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND (name LIKE ? OR location LIKE ? OR city LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const trainers = rows.map(parseTrainerFields);
    res.json(trainers);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM trainers WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Trainer not found' });
    
    res.json(parseTrainerFields(row));
  });
});

module.exports = router;
