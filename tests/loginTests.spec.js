const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Naviguer vers la page de login avant chaque test
  await page.goto('http://localhost:3000/login');
});

test('Affichage de la page de login', async ({ page }) => {
  // Vérifier les éléments de base
  await expect(page).toHaveTitle('Propelize - Connexion');
  await expect(page.locator('h1')).toHaveText('Connexion');
  await expect(page.locator('label[for="email"]')).toHaveText('Email');
  await expect(page.locator('label[for="password"]')).toHaveText('Mot de passe');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toHaveText('Se connecter');
});

test('Connexion réussie', async ({ page }) => {
  // Mock de la réponse API
  await page.route('**/auth/login', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token'
        },
        data: {
          user: {
            _id: '1',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');

  // Intercepter la redirection
  const [response] = await Promise.all([
    page.waitForResponse('**/auth/login'),
    page.click('button[type="submit"]')
  ]);

  // Vérifier la réponse
  expect(response.status()).toBe(200);
  
  // Vérifier le message de succès
  await expect(page.locator('#message')).toHaveText('Connexion réussie !');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(0, 128, 0)'); // green
  
  // Vérifier la redirection (simulée ici car nous ne pouvons pas vraiment naviguer dans les tests)
  await page.waitForTimeout(1000); // Attendre le timeout de redirection
});

test('Connexion échouée - Identifiants incorrects', async ({ page }) => {
  // Mock de la réponse API pour identifiants incorrects
  await page.route('**/auth/login', route => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Identifiants incorrects'
      })
    });
  });

  // Remplir le formulaire avec des mauvaises informations
  await page.fill('#email', 'wrong@example.com');
  await page.fill('#password', 'wrongpassword');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');

  // Vérifier le message d'erreur
  await expect(page.locator('#message')).toHaveText('Identifiants incorrects');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(255, 0, 0)'); // red
});

test('Connexion échouée - Erreur serveur', async ({ page }) => {
  // Mock d'une erreur serveur
  await page.route('**/auth/login', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Erreur interne du serveur'
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');

  // Vérifier le message d'erreur
  await expect(page.locator('#message')).toHaveText('Erreur de connexion, veuillez réessayer');
  await expect(page.locator('#message')).toHaveCSS('color', 'rgb(255, 0, 0)');
});

test('Validation du formulaire - Champs vides', async ({ page }) => {
  // Ne pas remplir les champs
  await page.click('button[type="submit"]');

  // Vérifier que les champs sont marqués comme invalides
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  
  await expect(emailInput).toHaveAttribute('required', '');
  await expect(passwordInput).toHaveAttribute('required', '');
  
  // Vérifier qu'aucune requête n'a été envoyée
  const requests = [];
  page.on('request', request => requests.push(request.url));
  await page.click('button[type="submit"]');
  expect(requests.filter(url => url.includes('auth/login'))).toHaveLength(0);
});

test('Stockage des tokens après connexion réussie', async ({ page }) => {
  // Mock de la réponse API
  await page.route('**/auth/login', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token'
        },
        data: {
          user: {
            _id: '1',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })
    });
  });

  // Remplir le formulaire
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');

  // Évaluer le localStorage avant connexion
  const initialLocalStorage = await page.evaluate(() => JSON.stringify(localStorage));
  expect(initialLocalStorage).not.toContain('fake-access-token');

  // Soumettre le formulaire
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500); // Attendre le traitement

  // Vérifier le localStorage après connexion
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
  const user = await page.evaluate(() => localStorage.getItem('user'));

  expect(accessToken).toBe('fake-access-token');
  expect(refreshToken).toBe('fake-refresh-token');
  expect(JSON.parse(user).email).toBe('test@example.com');
});

test('Affichage des erreurs de validation côté client', async ({ page }) => {
  // Email invalide
  await page.fill('#email', 'invalid-email');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // Vérifier que l'email est marqué comme invalide
  const emailInput = page.locator('#email');
  await expect(emailInput).toHaveAttribute('type', 'email');
  await expect(emailInput).toHaveAttribute('required', '');
  
  // Vérifier qu'aucune requête n'a été envoyée
  const requests = [];
  page.on('request', request => requests.push(request.url));
  await page.click('button[type="submit"]');
  expect(requests.filter(url => url.includes('auth/login'))).toHaveLength(0);
});