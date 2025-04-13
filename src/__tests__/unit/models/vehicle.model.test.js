const Vehicle = require('../../../models/vehicle.model');
// const { validateVehicle } = require('../vehicle.validator');

describe('Vehicle Model', () => {
  const validVehicle = {
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    type: 'car',
    pricePerDay: 50,
    registrationNumber: 'AB-123-CD'
  };

  it('devrait valider un véhicule correct', () => {
    const vehicle = new Vehicle(validVehicle);
    const error = vehicle.validateSync();
    expect(error).toBeUndefined();
  });

  it('devrait refuser un véhicule sans marque', () => {
    const data = { ...validVehicle, make: undefined };
    const vehicle = new Vehicle(data);
    const error = vehicle.validateSync();
    expect(error.errors.make).toBeDefined();
  });

  // Ajoutez d'autres tests de validation...
});