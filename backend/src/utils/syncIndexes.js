const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const models = require('../models');

// Saare models ke indexes MongoDB mein build karne ka script
const syncAllIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    for (const [name, model] of Object.entries(models)) {
      console.log(`Building indexes for ${name}...`);
      await model.syncIndexes();
      const indexes = await model.collection.getIndexes();
      console.log(`Current indexes on ${name}:`, Object.keys(indexes));
    }

    console.log('\nAll indexes synchronized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Index sync failed:', error.message);
    process.exit(1);
  }
};

syncAllIndexes();
