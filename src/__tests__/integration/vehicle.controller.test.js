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
    registrationNumber: randomString,
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
    expect(res.body.registrationNumber.toLowerCase()).toBe(testVehicleData.registrationNumber.toLowerCase());
    vehicleId = res.body._id;
  });

  test('POST /vehicles → should create a vehicle (400)', async () => {
    const res = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(
        {
          year: 2023,
          pricePerDay: 50,
          isAvailable: true,
          features: ["GPS", "Air Conditioning"],
          location: "Paris",
          registrationNumber: "############",
          mileage: 15000,
          lastServiceDate: "2023-01-15"
        }
      );

    expect(res.statusCode).toBe(400);
  });

  test('GET /vehicles/:id → should return vehicle by ID (200)', async () => {
    const res = await request(app)
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(vehicleId);
    expect(res.body.registrationNumber.toLowerCase()).toBe(testVehicleData.registrationNumber.toLowerCase());
  });

  test('GET /vehicles/:id → should return vehicle by ID (404)', async () => {
    const res = await request(app)
      .get(`/vehicles/6845cef08c437924ed1af4c7`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /vehicles/:id → should return vehicle by ID (500)', async () => {
    const res = await request(app)
      .get(`/vehicles/undefined`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
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
    expect(res.body.registrationNumber.toLowerCase()).toBe(testVehicleData.registrationNumber.toLowerCase());
  });

  test('GET /vehicles/max-price/100 → should return vehicles with price <= 100 (404)', async () => {
    const res = await request(app)
      .get('/vehicles/max-price/1096-n-n-n-n-n0')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('GET /vehicles/max-price/100 → should return vehicles with price <= 100 (400)', async () => {
    const res = await request(app)
      .get('/vehicles/max-price/-100')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  // test('GET /vehicles/health → should return service status (200)', async () => {
  //   const res = await request(app)
  //     .get('/vehicles/health')
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(res.statusCode).toBe(200);
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
