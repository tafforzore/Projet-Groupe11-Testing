const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Rental API',
      version: '1.0.0',
      description: 'API pour la gestion des véhicules en location avec authentification JWT',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez le token JWT sous la forme: Bearer <token>'
        }
      },
      schemas: {
        Vehicle: {
          type: 'object',
          properties: {
            make: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Corolla' },
            year: { type: 'number', example: 2023 },
            type: { type: 'string', enum: ['car', 'van'], example: 'car' },
            pricePerDay: { type: 'number', example: 50 },
            isAvailable: { type: 'boolean', default: true },
            features: { type: 'array', items: { type: 'string' }, example: ['GPS'] },
            location: { type: 'string', example: 'Paris' },
            registrationNumber: { type: 'string', example: 'AB-123-CD' },
            mileage: { type: 'number', example: 15000 },
            lastServiceDate: { type: 'string', format: 'date', example: '2023-01-15' }
          },
          required: ['make', 'model', 'year', 'type', 'pricePerDay', 'registrationNumber']
        },
        User: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'securePassword123' },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
          },
          required: ['username', 'email', 'password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOi...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
                expiresIn: { type: 'string', example: '15m' }
              }
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '65a1b2c3d4e5f6g7h8i9j0k' },
                username: { type: 'string', example: 'john_doe' },
                email: { type: 'string', example: 'john@example.com' },
                role: { type: 'string', example: 'user' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Message d\'erreur descriptif' },
            code: { type: 'number', example: 400 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token invalide ou non fourni',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                status: 'error',
                message: 'Veuillez vous connecter',
                code: 401
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'Vehicle Rental API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: -1 // Masque les schémas par défaut
      }
    })
  );
};