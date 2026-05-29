const mongoose = require('mongoose');

async function resetDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/little-seeds-wiki');
    console.log('Connected to little-seeds-wiki.');
    
    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully! Clean slate ready.');
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset DB:', err);
    process.exit(1);
  }
}

resetDB();
