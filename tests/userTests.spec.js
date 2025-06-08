const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page, context }) => {
  // Ajoute d'abord le cookie AVANT d'aller sur la page
  await context.addCookies([
    {
      name: 'token',
      value: 'fake-valid-admin-token-for-testing',
      url: 'http://localhost:3000'
    }
  ]);

  // Mock POST /users (création)
  await page.route('**/auth/users', async route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: '3',
          username: 'newUser',
          email: 'new@example.com',
          role: 'user'
        })
      });
    } else if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: '1',
            username: 'adminUser',
            email: 'admin@example.com',
            role: 'admin'
          },
          {
            _id: '2',
            username: 'regularUser',
            email: 'user@example.com',
            role: 'user'
          }
        ])
      });
    }
    
    return route.continue();
  });

  // Enfin, navigue vers la page
  await page.goto('http://localhost:3000/users');
});

test('Afficher la liste des utilisateurs', async ({ page }) => {
  // Mock API response
  await page.route('**/auth/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          username: 'adminUser',
          email: 'admin@example.com',
          role: 'admin'
        },
        {
          _id: '2',
          username: 'regularUser',
          email: 'user@example.com',
          role: 'user'
        }
      ])
    });
  });

  await page.reload();
  await expect(page.getByText('adminUser')).toBeVisible();
  await expect(page.getByText('admin@example.com')).toBeVisible();
});

test('Ajouter un nouvel utilisateur', async ({ page }) => {
  // Mock API response
  await page.route('**/auth/users', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: '3',
        username: 'newUser',
        email: 'new@example.com',
        role: 'user'
      })
    });
  });

  await page.getByRole('button', { name: 'Ajouter un utilisateur' }).click();
  
  // Remplir le formulaire
  await page.getByLabel('Nom d\'utilisateur *').fill('newUser');
  await page.getByLabel('Email *').fill('new@example.com');
  await page.getByLabel('Mot de passe *').fill('securePassword123');
  await page.getByLabel('Rôle *').selectOption('user');
  
  // Sauvegarder
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier la notification
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Utilisateur ajouté avec succès');
    await dialog.dismiss();
  });
});

test('Modifier un utilisateur existant', async ({ page }) => {
  // Mock GET response
  await page.route('**auth/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          username: 'adminUser',
          email: 'admin@example.com',
          role: 'admin'
        }
      ])
    });
  });

  // Mock PUT response
  await page.route('**auth/users/1', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: '1',
        username: 'adminUserUpdated',
        email: 'admin@example.com',
        role: 'admin'
      })
    });
  });

  await page.reload();
  await page.getByRole('button', { name: 'Modifier' }).first().click();
  
  // Modifier le nom d'utilisateur
  await page.getByLabel('Nom d\'utilisateur *').fill('adminUserUpdated');
  
  // Sauvegarder
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
    page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Utilisateur modifié avec succès');
    await dialog.dismiss();
  });
});


test('Supprimer un utilisateur', async ({ page }) => {
  // Mock GET response
  await page.route('**auth/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          username: 'userToDelete',
          email: 'delete@example.com',
          role: 'user'
        }
      ])
    });
  });

  // Mock DELETE response
  await page.route('**auth/users/1', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Utilisateur supprimé' })
    });
  });

  await page.reload();
  await page.getByRole('button', { name: 'Supprimer' }).first().click();
  
  // Confirmer la suppression
  await page.getByRole('button', { name: 'Confirmer' }).click();
  
  // Vérifier la notification
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Erreur lors de la suppression');
  });
});

test('Filtrer les utilisateurs', async ({ page }) => {
  // Mock initial response
  await page.route('**auth/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: '1',
          username: 'adminUser',
          email: 'admin@example.com',
          role: 'admin'
        },
        {
          _id: '2',
          username: 'regularUser',
          email: 'user@example.com',
          role: 'user'
        }
      ])
    });
  });

  await page.reload();
  
  // Filtrer par rôle admin
  await page.selectOption('#roleFilter', 'admin');
  await expect(page.getByText('adminUser')).toBeVisible();
  await expect(page.getByText('regularUser')).not.toBeVisible();
  
  // Filtrer par recherche textuelle
  await page.selectOption('#roleFilter', '');
  await page.getByPlaceholder('Rechercher...').fill('regular');
  await expect(page.getByText('regularUser')).toBeVisible();
  await expect(page.getByText('adminUser')).not.toBeVisible();
});

test('Validation du formulaire utilisateur', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajouter un utilisateur' }).click();
  
  // Essayer de soumettre sans remplir les champs obligatoires
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier les messages d'erreur
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Veuillez remplir tous les champs obligatoires');
    await dialog.dismiss();
  });
  // Remplir avec des données invalides
  await page.getByLabel('Email *').fill('invalid-email');
  await page.getByLabel('Mot de passe *').fill('short');
  
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  
  // Vérifier que le formulaire n'est pas soumis
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Veuillez remplir tous les champs obligatoires');
    await dialog.dismiss();
  });
});

test('Accès non autorisé pour les non-admins', async ({ page }) => {
  // Simuler un utilisateur non-admin
  await page.context().clearCookies();
  await page.context().addCookies([{
    name: 'token',
    value: 'fake-valid-non-admin-token',
    url: 'http://localhost:3000'
  }]);

  // Mock API response pour l'accès non autorisé
  await page.route('**auth/users', route => {
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Accès interdit - Droits insuffisants' })
    });
  });

  await page.reload();
  
  // Vérifier qu'on ne peut pas accéder à la page0
    page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert'); 
    expect(dialog.message()).toBe('Accès interdit - Droits insuffisants');
    await dialog.dismiss();
  });
});