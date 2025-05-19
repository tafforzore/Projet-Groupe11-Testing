const request = require('supertest');
const app = require('../../../app');
const User = require('../../../models/user.model');

jest.mock('../../../models/user.model'); // Mock du modèle User

describe("test de authentification avec mocks", () => {
  
  describe("register", () => {
    it("repond 201 ok", async () => {
      // Mock de User.create qui simule la création d'un utilisateur
      User.create.mockResolvedValue({
        _id: 'user-id-123',
        username: 'john_doe',
        email: 'john@example.com',
        role: 'user',
        generateAuthTokens: () => ({
          accessToken: 'fakeAccessToken',
          refreshToken: 'fakeRefreshToken',
        }),
        save: jest.fn().mockResolvedValue(true),
      });

      const newUser = {
        username: "john_doe",
        email: "john@example.com",
        password: "securePassword123",
        role: "user",
      };

      const res = await request(app)
        .post('/auth/register')
        .send(newUser);

      expect(res.statusCode).toEqual(201);
    });

    it("repond 400 pour données invalides", async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: "john_doe" }); // données incomplètes

      expect(res.statusCode).toEqual(400);
    });
  });

  describe("login", () => {
    it("repond 200 ok", async () => {
      // Mock de User.findOne pour simuler la recherche d'un utilisateur
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'user-id-123',
          email: 'john@example.com',
          password: 'hashedPassword',
          role: 'user',
          comparePassword: jest.fn().mockResolvedValue(true),
          generateAuthTokens: () => ({
            accessToken: 'fakeAccessToken',
            refreshToken: 'fakeRefreshToken',
          }),
          save: jest.fn().mockResolvedValue(true),
        }),
      });

      const loginData = {
        email: "john@example.com",
        password: "securePassword123",
      };

      const res = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(res.statusCode).toEqual(200);
    });

    it("repond 400 pour données invalides", async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: "john@example.com" }); // password manquant

      expect(res.statusCode).toEqual(400);
    });

    it("repond 401 pour identifiants incorrects", async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          comparePassword: jest.fn().mockResolvedValue(false),
        }),
      });

      const loginData = {
        email: "john@example.com",
        password: "wrongPassword",
      };

      const res = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(res.statusCode).toEqual(401);
    });
  });
});
