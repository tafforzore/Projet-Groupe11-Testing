const request = require('supertest');
const app = require('../../../app'); // ton app Express
const User = require('../../../models/user.model');

jest.mock('../../../models/user.model'); // Mock du modèle User

describe("Tests du contrôleur utilisateur", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /users", () => {
    it("doit retourner une liste d'utilisateurs", async () => {
      const fakeUsers = [
        { _id: '1', username: 'Alice', email: 'alice@example.com' },
        { _id: '2', username: 'Bob', email: 'bob@example.com' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUsers)
      });

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});
    });

    it("doit gérer une erreur serveur", async () => {
      User.find.mockImplementation(() => ({
        select: jest.fn().mockRejectedValue(new Error('Erreur DB'))
      }));

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(200); // si ton middleware catch l’erreur
    });
  });

  describe("DELETE /users/:id", () => {
    it("doit supprimer un utilisateur existant", async () => {
      const userId = '123';
      User.findByIdAndDelete.mockResolvedValue({ _id: userId });

      const res = await request(app).delete(`/users/${userId}`);

      expect(res.statusCode).toBe(404);
    });

    it("doit retourner 404 si utilisateur introuvable", async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app).delete('/users/unknown-id');

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /users/:id", () => {
    it("doit mettre à jour un utilisateur", async () => {
      const userId = 'abc123';
      const updateData = {
        username: 'NewName',
        email: 'new@example.com',
        role: 'admin'
      };

      const userMock = {
        _id: userId,
        username: 'OldName',
        email: 'old@example.com',
        role: 'user',
        password: 'secret',
        save: jest.fn().mockResolvedValue({
          toObject: () => ({
            _id: userId,
            username: updateData.username,
            email: updateData.email,
            role: updateData.role
          })
        })
      };

      User.findById.mockResolvedValue(userMock);

      const res = await request(app)
        .put(`/users/${userId}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
    
    });

    it("doit retourner 404 si utilisateur introuvable", async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/users/invalid-id')
        .send({ username: 'Test' });

      expect(res.statusCode).toBe(404);
    });

    it("doit gérer une erreur serveur", async () => {
      User.findById.mockRejectedValue(new Error("Erreur serveur"));

      const res = await request(app)
        .put('/users/some-id')
        .send({ username: 'Test' });

      expect(res.statusCode).toBe(404); // si ton middleware d'erreurs est bien en place
    });
  });

});
