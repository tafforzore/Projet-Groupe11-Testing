const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app'); // ton app Express
const Vehicle = require('../../models/vehicle.model');
const User = require('../../models/user.model');

let token;
let userId;

beforeAll(async () => {
  const randomString = Math.random().toString(36).substring(2, 10);
  email =  `user_${randomString}@example.com`;
  // Créer un utilisateur et générer un token
  const user = await User.create({
    username: 'testuser',
    email: email,
    password: 'Test1234!',
    role: 'user'
  });
  userId = user._id;

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });

  console.log(token)
});

// afterAll(async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
// });

describe('Vehicle Routes (avec auth)', () => {
  let vehicleId;

  test('GET /api/vehicles - retourne tous les véhicules', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/vehicles - crée un véhicule', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Corolla",
        year: 2023,
        type: "car",
        pricePerDay: 50,
        isAvailable: true,
        features: [
            "GPS"
        ],
        location: "Paris",
        registrationNumber: "AB-123-CD",
        mileage: 15000,
        lastServiceDate: "2023-01-15"
        });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    vehicleId = res.body._id;
  });

  test('GET /api/vehicles/:id - retourne un véhicule par ID', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', vehicleId);
  });

  test('PUT /api/vehicles/:id - modifie un véhicule', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rentalPrice: 60 });

    expect(res.statusCode).toBe(200);
    expect(res.body.rentalPrice).toBe(60);
  });

  test('GET /api/vehicles/registration/:registration - recherche par immatriculation', async () => {
    const res = await request(app)
      .get('/api/vehicles/registration/XYZ123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.registrationNumber).toBe('XYZ123');
  });

  test('GET /api/vehicles/price/:maxPrice - véhicules en dessous d\'un prix', async () => {
    const res = await request(app)
      .get('/api/vehicles/price/100')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/vehicles/health - vérifie l\'état de l\'API', async () => {
    const res = await request(app)
      .get('/api/vehicles/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('DELETE /api/vehicles/:id - supprime un véhicule', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
