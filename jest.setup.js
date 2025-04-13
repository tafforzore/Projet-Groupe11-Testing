process.env.MONGO_URL = 'mongodb://localhost:27017/vehicle-test';
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
