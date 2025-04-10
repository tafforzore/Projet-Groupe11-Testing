// src/routes/vehicle.routes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('./../controller/vehicle.controller');

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
router.get('/', vehicleController.getAllVehicles);

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
router.get('/:id', vehicleController.getVehicleById);

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
router.post('/', vehicleController.createVehicle);

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
router.put('/:id', vehicleController.updateVehicle);

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
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;