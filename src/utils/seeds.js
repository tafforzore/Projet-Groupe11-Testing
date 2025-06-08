// const mongoose = require('mongoose');
// const Vehicle = require('../models/vehicle.model');

// const vehicles = [
//   {
//     make: 'Toyota',
//     model: 'Corolla',
//     year: 2022,
//     type: 'car',
//     pricePerDay: 50,
//     isAvailable: true,
//     features: ['GPS', 'Bluetooth'],
//     location: 'Paris',
//     registrationNumber: 'AB-123-CD',
//     mileage: 15000,
//     lastServiceDate: new Date('2023-01-15')
//   },
//   // Ajoutez d'autres véhicules...
// ];

// mongoose.connect('mongodb://admin:password@localhost:27017/vehicleDB?authSource=admin', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(async () => {
//   console.log('Connected to MongoDB for seeding');
//   await Vehicle.deleteMany({});
//   await Vehicle.insertMany(vehicles);
//   console.log('Database seeded!');
//   process.exit(0);
// })
// .catch(err => {
//   console.error('Seeding error:', err);
//   process.exit(1);
// });