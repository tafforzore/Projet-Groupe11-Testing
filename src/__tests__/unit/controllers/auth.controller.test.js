const request = require('supertest');
const app = require('../../../app');
const User = require('../../../models/user.model');
const jwt = require('jsonwebtoken');

jest.mock('../../../models/user.model'); // Mock du modèle User
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  // Ajoutez d'autres méthodes jwt si nécessaire
}));

describe("test de authentification avec mocks", () => {
  
  describe("register", () => {

    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    };

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

    it('should return 400 if required fields are missing', async () => {
      const tests = [
        { field: 'username', data: { ...validUserData, username: undefined } },
        { field: 'email', data: { ...validUserData, email: undefined } },
        { field: 'password', data: { ...validUserData, password: undefined } },
        { field: 'role', data: { ...validUserData, role: undefined } }
      ];

      for (const test of tests) {
        const res = await request(app)
          .post('/auth/register')
          .send(test.data);

        expect(res.statusCode).toBe(400);
      }
    });

    it('should handle database errors', async () => {
      User.create.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("login", () => {

     const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };


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

    it('should login user successfully', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        email: validLoginData.email,
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthTokens: jest.fn().mockReturnValue({
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.tokens.accessToken).toBe('mockAccessToken');
      expect(res.body.tokens.refreshToken).toBe('mockRefreshToken');
      expect(User.findOne).toHaveBeenCalledWith({ email: validLoginData.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(validLoginData.password);
    });  
    
     it('should return 401 if credentials are invalid', async () => {
      // Cas 1: Utilisateur non trouvé
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      let res = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(res.statusCode).toBe(401);

      // Cas 2: Mot de passe incorrect
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      res = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(res.statusCode).toBe(401);
    });

    it("répond 500 en cas d'erreur serveur", async () => {
      // Mock User.findOne pour simuler une erreur
      User.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Erreur de base de données'))
      });

      const loginData = {
        email: "john@example.com",
        password: "securePassword123",
      };

      const res = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(res.statusCode).toEqual(500);
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

    it('should handle database errors', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const res = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(res.statusCode).toBe(500);
    });
  });

   describe('refreshToken', () => {
    const validRefreshToken = 'validRefreshToken';

    it('should refresh tokens successfully', async () => {
      const decodedToken = { id: '123' };
      const mockUser = {
        _id: '123',
        refreshToken: validRefreshToken,
        generateAuthTokens: jest.fn().mockReturnValue({
          accessToken: 'newAccessToken',
          refreshToken: 'newRefreshToken'
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      jwt.verify.mockReturnValue(decodedToken);
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.tokens.accessToken).toBe('newAccessToken');
      expect(res.body.tokens.refreshToken).toBe('newRefreshToken');
      expect(jwt.verify).toHaveBeenCalledWith(
        validRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if refresh token is missing', async () => {
      const res = await request(app)
        .post('/auth/refresh-token')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should return 403 if refresh token is invalid', async () => {
      // Cas 1: Token invalide
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      let res = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: 'invalidToken' });

      expect(res.statusCode).toBe(403);

      // Cas 2: User non trouvé
      const decodedToken = { id: '123' };
      jwt.verify.mockReturnValue(decodedToken);
      User.findById.mockResolvedValue(null);

      res = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(res.statusCode).toBe(403);

      // Cas 3: Token ne correspond pas
      const mockUser = {
        _id: '123',
        refreshToken: 'differentToken'
      };
      User.findById.mockResolvedValue(mockUser);

      res = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(res.statusCode).toBe(403);
    });

    it('should handle database errors', async () => {
      const decodedToken = { id: '123' };
      jwt.verify.mockReturnValue(decodedToken);
      User.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/auth/refresh-token')
        .send({ refreshToken: validRefreshToken });

      expect(res.statusCode).toBe(403);
    });
  });
});


