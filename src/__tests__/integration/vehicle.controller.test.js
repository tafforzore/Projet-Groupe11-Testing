const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app'); // Express app
const Vehicle = require('../../models/vehicle.model');
const User = require('../../models/user.model');

let token;
let userId;
let testVehicleData;
let vehicleId;

beforeAll(async () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  const email = `user_${randomString}@example.com`;

  const user = await User.create({
    username: 'testuser',
    email,
    password: 'Test1234!',
    role: 'user'
  });

  userId = user._id;

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });

  testVehicleData = {
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    type: "car",
    pricePerDay: 50,
    isAvailable: true,
    features: ["GPS", "Air Conditioning"],
    location: "Paris",
    registrationNumber: "XYZ123",
    mileage: 15000,
    lastServiceDate: "2023-01-15"
  };
});

// afterAll(async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
// });

describe('Vehicle Routes (auth required)', () => {

  test('GET /vehicles → should return all vehicles (200)', async () => {
    const res = await request(app)
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /vehicles → should create a vehicle (201)', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(testVehicleData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.registrationNumber).toBe(testVehicleData.registrationNumber);
    vehicleId = res.body._id;
  });

  test('GET /vehicles/:id → should return vehicle by ID (200)', async () => {
    const res = await request(app)
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(vehicleId);
    expect(res.body.registrationNumber).toBe(testVehicleData.registrationNumber);
  });

  test('PUT /vehicles/:id → should update vehicle price (200)', async () => {
    const newPrice = 60;
    const res = await request(app)
      .put(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pricePerDay: newPrice });

    expect(res.statusCode).toBe(200);
    expect(res.body.pricePerDay).toBe(newPrice);
  });

  test('GET /vehicles/registration/:registration → should return vehicle by registration number (200)', async () => {
    const res = await request(app)
      .get(`/vehicles/registration/${testVehicleData.registrationNumber}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.registrationNumber).toBe(testVehicleData.registrationNumber);
  });

  // test('GET /vehicles/max-price/100 → should return vehicles with price <= 100 (200)', async () => {
  //   const res = await request(app)
  //     .get('/vehicles/max-price/100')
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(Array.isArray(res.body)).toBe(true);
  //   for (const vehicle of res.body) {
  //     expect(vehicle.pricePerDay).toBeLessThanOrEqual(100);
  //   }
  // });

  // test('GET /vehicles/health → should return service status (200)', async () => {
  //   const res = await request(app)
  //     .get('/vehicles/health')
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.status).toBe('UP');
  //   expect(res.body).toHaveProperty('timestamp');
  //   expect(res.body).toHaveProperty('version');
  //   expect(res.body).toHaveProperty('database');
  // });

  test('DELETE /vehicles/:id → should delete vehicle (204)', async () => {
    const res = await request(app)
      .delete(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Optionally confirm it's really deleted
    const check = await Vehicle.findById(vehicleId);
    expect(check).toBeNull();
  });
});
