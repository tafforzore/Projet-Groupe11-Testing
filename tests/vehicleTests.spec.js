const { test, expect } = require('@playwright/test');

// Configuration commune
test.beforeEach(async ({ page }) => {
  await page.goto('/vehicules');
  // Supposons que nous ayons déjà une session valide
  await page.context().addCookies([{
    name: 'token',
    value: 'fake-valid-token-for-testing',
    url: 'http://localhost:3000'
  }]);
});

test('Afficher la liste des véhicules', async ({ page }) => {
  // Mock API response
  await page.route('**/vehicles', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          type: 'car',
          pricePerDay: 50,
          registrationNumber: 'AB-123-CD',
          location: 'Paris',
          isAvailable: true,
          features: ['GPS', 'Climatisation']
        }
      ])
    });
  });

  await page.reload();
  await expect(page.getByText('Toyota')).toBeVisible();
  await expect(page.getByText('2020')).toBeVisible();
});

test('Ajouter un nouveau véhicule', async ({ page }) => {
  // Mock API response
  await page.route('**/vehicles', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: '2',
        make: 'Renault',
        model: 'Clio',
        year: 2021,
        type: 'car',
        pricePerDay: 40,
        registrationNumber: 'EF-456-GH',
        location: 'Lyon',
        isAvailable: true,
        features: []
      })
    });
  });

  await page.getByRole('button', { name: 'Ajouter un véhicule' }).click();
  
  // Remplir le formulaire
  await page.getByLabel('Marque *').fill('Renault');
  await page.getByLabel('Modèle *').fill('Clio');
  await page.getByLabel('Année *').fill('2021');
  await page.getByLabel('Type *').selectOption('car');
  await page.getByLabel('Prix par jour (FCFA) *').fill('40');
  await page.getByLabel('Numéro d\'immatriculation *').fill('EF-456-GH');
  await page.getByLabel('Localisation *').fill('Lyon');
  
  // Ajouter un équipement
  await page.getByPlaceholder('Ajouter un équipement').fill('GPS');
  await page.locator('button#addFeatureBtn').click();

  
  // Sauvegarder
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier la notification
  page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert'); 
      expect(dialog.message()).toBe('Véhicule ajouté avec succès');
    });
});

test('Modifier un véhicule existant', async ({ page }) => {
  // Mock GET response
  await page.route('**/vehicles', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          type: 'car',
          pricePerDay: 50,
          registrationNumber: 'AB-123-CD',
          location: 'Paris',
          isAvailable: true,
          features: ['GPS']
        }
      ])
    });
  });

  // Mock PUT response
  await page.route('**/vehicles/1', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: '1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021, // Année modifiée
        type: 'car',
        pricePerDay: 55, // Prix modifié
        registrationNumber: 'AB-123-CD',
        location: 'Paris',
        isAvailable: true,
        features: ['GPS', 'Climatisation'] // Équipement ajouté
      })
    });
  });

  await page.reload();
  await page.getByRole('button', { name: 'Modifier' }).first().click();
  
  // Modifier les champs
  await page.getByLabel('Année *').fill('2021');
  await page.getByLabel('Prix par jour (FCFA) *').fill('55');
  
  // Ajouter un équipement
  await page.getByPlaceholder('Ajouter un équipement').fill('Climatisation');
  await page.locator('button#addFeatureBtn').click();
  // Sauvegarder
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier la notification
  page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert'); 
      expect(dialog.message()).toBe('Véhicule modifié avec succès');
    });
});

test('Supprimer un véhicule', async ({ page }) => {
  // Mock GET response
  await page.route('**/vehicles', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          type: 'car',
          pricePerDay: 50,
          registrationNumber: 'AB-123-CD',
          location: 'Paris',
          isAvailable: true
        }
      ])
    });
  });

  // Mock DELETE response
  await page.route('**/vehicles/1', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Véhicule supprimé' })
    });
  });

  await page.reload();
  await page.getByRole('button', { name: 'Supprimer' }).first().click();
  
  // Confirmer la suppression
  await page.getByRole('button', { name: 'Confirmer' }).click();
  
  // Vérifier la notification
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert'); 
      expect(dialog.message()).toBe('Véhicule supprimé avec succès');
    });
});

test('Filtrer les véhicules', async ({ page }) => {
  // Mock initial response
  await page.route('**/vehicles', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          type: 'car',
          pricePerDay: 50,
          registrationNumber: 'AB-123-CD',
          location: 'Paris',
          isAvailable: true
        },
        {
          _id: '2',
          make: 'Ford',
          model: 'Transit',
          year: 2019,
          type: 'van',
          pricePerDay: 70,
          registrationNumber: 'EF-456-GH',
          location: 'Lyon',
          isAvailable: false
        }
      ])
    });
  });

  await page.reload();
  
  // Filtrer par type
  await page.selectOption('#typeFilter', 'car');
  await expect(page.getByText('Toyota Corolla')).toBeVisible();
  await expect(page.getByText('Ford Transit')).not.toBeVisible();
  
  // Filtrer par disponibilité
  await page.selectOption('#typeFilter', '');
  await page.selectOption('#availabilityFilter', 'true');
  await expect(page.getByText('Toyota Corolla')).toBeVisible();
  await expect(page.getByText('Ford Transit')).not.toBeVisible();
  
  // Filtrer par prix maximum
  await page.selectOption('#typeFilter', 'car');
  await page.selectOption('#availabilityFilter', '');
  await page.getByPlaceholder('Prix max/jour').fill('60');
  await expect(page.getByText('Toyota Corolla')).toBeVisible();
  await expect(page.getByText('Ford Transit')).not.toBeVisible();
  
  // Recherche textuelle
  await page.getByPlaceholder('Rechercher...').fill('Toyota');
  await expect(page.getByText('Toyota Corolla')).toBeVisible();
  await expect(page.getByText('Ford Transit')).not.toBeVisible();
});

test('Validation du formulaire véhicule', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter un véhicule' }).click();
  
  // Essayer de soumettre sans remplir les champs obligatoires
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier les messages d'erreur
  page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert'); 
      expect(dialog.message()).toBe('Veuillez remplir tous les champs obligatoires');
    await dialog.dismiss();
    });
  // Vérifier que les champs obligatoires sont marqués  
  // Remplir avec des données invalides
  await page.getByLabel('Année *').fill('1899');
  await page.getByLabel('Prix par jour (FCFA) *').fill('-10');
  await page.getByLabel('Numéro d\'immatriculation *').fill('INVALID');
  
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert'); 
      expect(dialog.message()).toBe('Veuillez remplir tous les champs obligatoires');
    });
});