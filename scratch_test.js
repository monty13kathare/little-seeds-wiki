const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Connecting to MongoDB at mongodb://127.0.0.1:27017/nexus-docs ...');
    await mongoose.connect('mongodb://127.0.0.1:27017/nexus-docs', {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✅ Successfully connected to local MongoDB!');
    
    // Check list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in nexus-docs database:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
}

test();
