// src/routes/vehicle.routes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('./../controller/vehicle.controller');
const authMiddleware = require('../middlewares/auth.middleware'); 

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Gestion des véhicules
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Liste tous les véhicules
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Liste des véhicules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get('/', authMiddleware.protect, vehicleController.getAllVehicles);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Récupère un véhicule par ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Véhicule trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Véhicule non trouvé
 */
router.get('/:id', authMiddleware.protect, vehicleController.getVehicleById);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Crée un nouveau véhicule
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Véhicule créé
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware.protect, vehicleController.createVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Met à jour un véhicule
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Véhicule mis à jour
 *       404:
 *         description: Véhicule non trouvé
 */
router.put('/:id', authMiddleware.protect, vehicleController.updateVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Supprime un véhicule
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Véhicule supprimé
 *       404:
 *         description: Véhicule non trouvé
 */
router.delete('/:id', authMiddleware.protect, vehicleController.deleteVehicle);

/**
 * @swagger
 * /vehicles/registration/{registration}:
 *   get:
 *     summary: Récupère un véhicule par son numéro d'enregistrement
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: registration
 *         required: true
 *         schema:
 *           type: string
 *         description: Numéro d'immatriculation du véhicule
 *     responses:
 *       200:
 *         description: Véhicule trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Aucun véhicule trouvé avec ce numéro d'enregistrement
 *       500:
 *         description: Erreur serveur
 */
router.get('/registration/:registration', authMiddleware.protect, vehicleController.getVehicleByRegistration);

/**
 * @swagger
 * /vehicles/max-price/{maxPrice}:
 *   get:
 *     summary: Récupère les véhicules avec un prix de location inférieur ou égal au prix maximum
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: maxPrice
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *         description: Prix maximum de location
 *     responses:
 *       200:
 *         description: Liste des véhicules filtrés par prix
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Prix maximum invalide (doit être un nombre positif)
 *       404:
 *         description: Aucun véhicule trouvé dans la fourchette de prix
 *       500:
 *         description: Erreur serveur
 */
router.get('/max-price/:maxPrice', authMiddleware.protect, vehicleController.getVehiclesByMaxPrice);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Vérification de l'état de l'API
 */

/**
 * @swagger
 * /vehicles/health:
 *   get:
 *     summary: Vérifie l'état du service Vehicle
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service opérationnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 database:
 *                   type: string
 */
router.get('/health', vehicleController.getHealthStatus);

module.exports = router;