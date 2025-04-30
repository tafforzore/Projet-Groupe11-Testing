const request = require('supertest');
const app = require('../../../app'); // Assurez-vous que le chemin est correct
const Vehicle = require('../../../models/vehicle.model');
const mongoose = require('mongoose');


describe('Vehicle Controller', () => {
  let testVehicle;

  beforeAll(async () => {
    // Connexion à la DB de test
    await mongoose.connect(process.env.MONGO_URL);
  });

  beforeEach(async () => {
    testVehicle = await Vehicle.create({
      make: 'Test',
      model: 'Model',
      year: 2023,
      type: 'car',
      pricePerDay: 100,
      registrationNumber: 'TEST-123'
    });
  });

  afterEach(async () => {
    await Vehicle.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /vehicles', () => {
    it('devrait retourner tous les véhicules', async () => {
      const res = await request(app).get('/vehicles');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /vehicles', () => {
    it('devrait créer un nouveau véhicule', async () => {
      const newVehicle = {
        make: 'Nouveau',
        model: 'Véhicule',
        year: 2024,
        type: 'van',
        pricePerDay: 75,
        location: 'Paris',
        registrationNumber: 'NEW-456'
      };

      const res = await request(app)
        .post('/vehicles')
        .send(newVehicle);

      expect(res.statusCode).toEqual(201);
      expect(res.body.make).toEqual('Nouveau');
    });
  });

  // Ajoutez les tests pour GET/:id, PUT, DELETE...
});