require('dotenv').config();


process.env.MONGO_URL = process.env.MONGO_URL;
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URL;
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
