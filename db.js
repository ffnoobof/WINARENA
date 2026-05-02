const mongoose = require('mongoose');

function validateDbReady() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not ready');
  }
}

async function connectDatabase(mongoUri) {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(mongoUri, options);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error(`MongoDB not ready after connect: readyState=${mongoose.connection.readyState}`);
  }
}

function ensureDbReady() {
  validateDbReady();
}

async function safeFindOne(model, query, projection) {
  validateDbReady();
  return model.findOne(query, projection);
}

async function safeCreate(document) {
  validateDbReady();
  return document.save();
}

async function safeUpdate(model, query, update, options = {}) {
  validateDbReady();
  return model.findOneAndUpdate(query, update, { new: true, ...options });
}

async function safeDelete(model, query, options = {}) {
  validateDbReady();
  return model.deleteOne(query, options);
}

module.exports = {
  connectDatabase,
  ensureDbReady,
  safeFindOne,
  safeCreate,
  safeUpdate,
  safeDelete,
  mongoose,
};
