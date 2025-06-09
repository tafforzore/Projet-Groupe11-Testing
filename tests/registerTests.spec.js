const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/register');
});

test('Affichage de la page d\'inscription', async ({ page }) => {
  // Vérifier les éléments de base
  await expect(page).toHaveTitle('Propelize - Inscription');
  await expect(page.locator('h1')).toHaveText('Créer un compte');
  
  // Vérifier les champs du formulaire
  await expect(page.locator('label[for="username"]')).toHaveText('Nom d\'utilisateur');
  await expect(page.locator('label[for="email"]')).toHaveText('Adresse Email');
  await expect(page.locator('label[for="password"]')).toHaveText('Mot de passe');
  await expect(page.locator('label[for="role"]')).toHaveText('Rôle');
  
  // Vérifier les champs obligatoires
  await expect(page.locator('#username')).toHaveAttribute('required', '');
  await expect(page.locator('#email')).toHaveAttribute('required', '');
  await expect(page.locator('#password')).toHaveAttribute('required', '');
  await expect(page.locator('#role')).toHaveAttribute('required', '');
  
  // Vérifier les options du rôle
  await expect(page.locator('#role option')).toHaveCount(3);
  await expect(page.locator('#role option:nth-child(1)')).toHaveText('-- Choisir un rôle --');
  await expect(page.locator('#role option:nth-child(2)')).toHaveText('Admin');
  await expect(page.locator('#role option:nth-child(3)')).toHaveText('Utilisateur');
  
  // Vérifier le bouton de soumission
  await expect(page.locator('button[type="submit"]')).toHaveText('S\'inscrire');
});

test('Inscription réussie', async ({ page }) => {
  // Mock de la réponse API
  const randomString = Math.random().toString(36).substring(2, 10);
  await page.route('**/auth/register', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        status: "success",
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
          expiresIn: '3600'
        },
        data: {
          user: {
            _id: '1',
            username: 'testuser',
            email: randomString+'@example.com',
            role: 'user'
          }
        }
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#username', randomString);
  await page.fill('#email', randomString+'@example.com');
  await page.fill('#password', 'password123');
  await page.selectOption('#role', 'user');

  // Intercepter la requête
  const [response] = await Promise.all([
    page.waitForResponse('**/auth/register'),
    page.click('button[type="submit"]')
  ]);

  // Vérifier la réponse
  expect(response.status()).toBe(201);
  
  // Vérifier le message de succès
  await expect(page.locator('#message')).toHaveText('Inscription réussie !');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(0, 128, 0)'); // green
  
});

test('Inscription échouée - Email déjà utilisé', async ({ page }) => {
  // Mock de la réponse API pour email existant
  await page.route('**/auth/register', route => {
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Cet email est déjà utilisé'
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#username', 'existinguser');
  await page.fill('#email', 'existing@example.com');
  await page.fill('#password', 'password123');
  await page.selectOption('#role', 'user');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');

  // Vérifier le message d'erreur
  await expect(page.locator('#message')).toHaveText('erreur de connexion, veuillez réessayer');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(255, 0, 0)'); // red
});

test('Validation côté client - Champs vides', async ({ page }) => {
  // Ne pas remplir les champs
  await page.click('button[type="submit"]');

  // Vérifier que les messages de validation HTML5 sont présents
  const usernameInput = page.locator('#username');
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  const roleSelect = page.locator('#role');
  
  await expect(usernameInput).toHaveJSProperty('validity.valid', false);
  await expect(emailInput).toHaveJSProperty('validity.valid', false);
  await expect(passwordInput).toHaveJSProperty('validity.valid', false);
  await expect(roleSelect).toHaveJSProperty('validity.valid', false);
  
  // Vérifier qu'aucune requête n'a été envoyée
  const requests = [];
  page.on('request', request => requests.push(request.url));
  await page.click('button[type="submit"]');
  expect(requests.filter(url => url.includes('auth/register'))).toHaveLength(0);
});

test('Stockage des tokens après inscription réussie', async ({ page }) => {
  // Mock de la réponse API
  await page.route('**/auth/register', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
          expiresIn: '3600'
        },
        data: {
          user: {
            _id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#username', 'testuser');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.selectOption('#role', 'user');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500); // Attendre le traitement

  // Vérifier le localStorage
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
  const expiresIn = await page.evaluate(() => localStorage.getItem('expiresIn'));
  const user = await page.evaluate(() => localStorage.getItem('user'));

  expect(accessToken).toBe('fake-access-token');
  expect(refreshToken).toBe('fake-refresh-token');
  expect(expiresIn).toBe('3600');
});

test('Validation email invalide', async ({ page }) => {
  // Remplir avec un email invalide
  await page.fill('#email', 'invalid-email');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // Vérifier que l'email est marqué comme invalide
  const emailInput = page.locator('#email');
  await expect(emailInput).toHaveJSProperty('validity.valid', false);
  
  // Vérifier qu'aucune requête n'a été envoyée
  const requests = [];
  page.on('request', request => requests.push(request.url));
  await page.click('button[type="submit"]');
  expect(requests.filter(url => url.includes('auth/register'))).toHaveLength(0);
});

test('Erreur serveur', async ({ page }) => {
  // Mock d'une erreur serveur
  await page.route('**/auth/register', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Erreur interne du serveur'
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#username', 'testuser');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.selectOption('#role', 'user');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');

  // Vérifier le message d'erreur
  await expect(page.locator('#message')).toHaveText('erreur de connexion, veuillez réessayer');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(255, 0, 0)');
});