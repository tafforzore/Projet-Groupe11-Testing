// test/protect.middleware.test.js

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');  // adapte le chemin
const { protect } = require('../../middlewares/auth.middleware'); // adapte le chemin

jest.mock('../../models/user.model'); // mock du modèle User

describe('Middleware protect', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Route test qui utilise la middleware protect
    app.get('/protected', protect, (req, res) => {
      res.status(200).json({ message: 'Accès autorisé', userId: req.user._id });
    });

    // Middleware pour gérer les erreurs
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({ message: err.message });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('répond 401 si pas de token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Veuillez vous connecter');
  });

  it('répond 401 si token invalide', async () => {
    // Mock jwt.verify pour jeter une erreur
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('Invalid token'); });

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token_invalide');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Session expirée');
  });

  it('répond 401 si utilisateur introuvable', async () => {
    const tokenPayload = { id: 'user_id_test' };

    // Mock jwt.verify pour retourner un id
    jest.spyOn(jwt, 'verify').mockReturnValue(tokenPayload);

    // Mock User.findById pour retourner null (utilisateur non trouvé)
    User.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Utilisateur introuvable');
  });

  it('répond 200 et attache user si token valide', async () => {
    const tokenPayload = { id: 'user_id_test' };

    jest.spyOn(jwt, 'verify').mockReturnValue(tokenPayload);

    const fakeUser = {
      _id: 'user_id_test',
      username: 'john',
      email: 'john@example.com',
      role: 'user'
    };

    User.findById.mockResolvedValue(fakeUser);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Accès autorisé');
    expect(res.body.userId).toBe(fakeUser._id);
  });
});
