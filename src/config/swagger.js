// src/config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Rental API',
      version: '1.0.0',
      description: 'API pour la gestion des véhicules en location',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
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
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};