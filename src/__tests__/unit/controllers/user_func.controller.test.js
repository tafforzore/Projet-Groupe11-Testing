const request = require('supertest');
const app = require('../../../app');
const User = require('../../../models/user.model');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../../../models/user.model');
jest.mock('jsonwebtoken');

// Mock du middleware protect
jest.mock('../../../middlewares/auth.middleware', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { _id: 'authenticatedUserId', role: 'admin' }; // Ajout du rôle admin pour les tests
    next();
  })
}));

describe('User Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return 200 with users list (admin only)', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', email: 'user1@test.com', role: 'user' },
        { _id: '2', username: 'user2', email: 'user2@test.com', role: 'admin' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      const res = await request(app)
        .get('/auth/users')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(User.find().select).toHaveBeenCalledWith('-password -refreshToken -passwordResetToken -passwordResetExpires');
    });

    it('should return 500 on database error', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const res = await request(app)
        .get('/auth/users')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(500);
    });
  });


    it('should return 500 on database error', async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/auth/users/123')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('PUT /users/:id', () => {
    const updateData = {
      username: 'newname',
      email: 'new@email.com',
      role: 'admin',
      password: 'newpassword'
    };

    it('should return 200 with updated user data', async () => {
      const mockUser = {
        _id: '123',
        username: 'oldname',
        email: 'old@email.com',
        role: 'user',
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue({
          toObject: () => ({
            _id: '123',
            username: 'newname',
            email: 'new@email.com',
            role: 'admin'
          })
        })
      };

      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/auth/users/123')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('newname');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/users/999')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData);

      expect(res.statusCode).toBe(404);
    });

    it('should return 500 on database error', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/auth/users/123')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData);

      expect(res.statusCode).toBe(500);
    });
  });

  // Ajout de tests pour vérifier la protection des routes
  describe('Route protection', () => {
    it('should return 401 without authorization token', async () => {
      // Simuler l'échec du middleware protect
      require('../../../middlewares/auth.middleware').protect.mockImplementationOnce(
        (req, res) => res.status(401).json({ message: 'Non autorisé' })
      );

      const res = await request(app).get('/auth/users');
      expect(res.statusCode).toBe(401);
    });
});
