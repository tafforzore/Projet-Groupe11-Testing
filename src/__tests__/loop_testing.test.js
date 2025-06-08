const { calculateTotal } = require('../controller/loop.controller');

describe('Loop testing - calculateTotal', () => {
  test('0 itération : panier vide', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('1 itération : un seul produit', () => {
    expect(calculateTotal([50])).toBe(50);
  });
  
  test('Plusieurs itérations', () => {
    expect(calculateTotal([10, 20, 30])).toBe(60);
  });
  
  test('Limite haute (stress test)', () => {
    const prices = Array(1000).fill(5);
    expect(calculateTotal(prices)).toBe(5000);
  });
});
