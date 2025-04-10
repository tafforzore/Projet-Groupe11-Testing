const mongoose = require('mongoose');
const { Schema } = mongoose;

// Définition du schéma Vehicle
const vehicleSchema = new Schema({
  make: { 
    type: String, 
    required: [true, 'La marque est obligatoire'],
    trim: true
  },
  model: { 
    type: String, 
    required: [true, 'Le modèle est obligatoire'] 
  },
  year: { 
    type: Number, 
    required: true,
    min: [1900, 'L\'année doit être >= 1900'],
    max: [new Date().getFullYear() + 1, 'L\'année ne peut pas être dans le futur']
  },
  type: { 
    type: String, 
    required: true,
    enum: ['car', 'van'],
    lowercase: true
  },
  pricePerDay: { 
    type: Number, 
    required: true,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  features: { 
    type: [String], 
    default: [] 
  },
  location: { 
    type: String, 
    required: true 
  },
  registrationNumber: { 
    type: String, 
    required: true,
    unique: true,
    uppercase: true,
    validate: {
      validator: (v) => /^[A-Z0-9-]{6,12}$/.test(v),
      message: 'Numéro d\'immatriculation invalide (ex: AB-123-CD)'
    }
  },
  mileage: { 
    type: Number, 
    min: 0 
  },
  lastServiceDate: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index pour optimiser les recherches courantes
vehicleSchema.index({ make: 1, model: 1 }); // Recherche par marque/modèle
vehicleSchema.index({ location: 1, isAvailable: 1 }); // Filtrage par disponibilité

// Middleware (ex: log avant sauvegarde)
vehicleSchema.pre('save', function(next) {
  console.log(`Sauvegarde du véhicule: ${this.make} ${this.model}`);
  next();
});

// Export du modèle
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;