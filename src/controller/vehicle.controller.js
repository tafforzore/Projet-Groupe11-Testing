// src/controllers/vehicle.controller.js
const Vehicle = require('../models/vehicle.model');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);

};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: error.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    // if (!updatedVehicle) {
    //   return res.status(404).json({ message: 'Véhicule non trouvé' });
    // }
    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicle by registration number
exports.getVehicleByRegistration = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ registrationNumber: req.params.registration });
    if (!vehicle) {
      return res.status(404).json({ message: 'Véhicule non trouvé avec ce numéro d\'enregistrement' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vehicles with rental price less than or equal to maxPrice
exports.getVehiclesByMaxPrice = async (req, res) => {

    const maxPrice = parseFloat(req.params.maxPrice);
    
    if (isNaN(maxPrice) || maxPrice < 0) {
      return res.status(400).json({ message: 'Le prix maximum doit être un nombre positif' });
    }

    const vehicles = await Vehicle.find({ pricePerDay: { $lte: maxPrice } });
    
    if (vehicles.length === 0) {
      return res.status(404).json({ 
        message: `Aucun véhicule trouvé avec un prix de location inférieur ou égal à ${maxPrice}` 
      });
    }
    
    res.status(200).json(vehicles);

};

exports.getHealthStatus = (req, res) => {
  res.status(200).json();
};