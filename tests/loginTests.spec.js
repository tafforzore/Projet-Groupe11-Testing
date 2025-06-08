// const { test, expect } = require('@playwright/test');

// test.describe('Page de connexion', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto('/login');
//   });

//   test('Affichage de la page de login', async ({ page }) => {
//     // Vérifier les éléments essentiels
//     await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
//     await expect(page.getByLabel('Email')).toBeVisible();
//     await expect(page.getByLabel('Mot de passe')).toBeVisible();
//     await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
//   });

//   test('Connexion réussie - Redirection vers /vehicles', async ({ page }) => {
//     // Mock de la réponse API
//    await page.route('**/auth/register', async route => {
//     await route.fulfill({
//       status: 201,
//       contentType: 'application/json',
//       body: JSON.stringify({
//         status: "success",
//         tokens: {
//           accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmE1ZjIzNmFmNTQ2Y2I5YmJlMGUzNyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ5Mzk1NTAwLCJleHAiOjE3NDkzOTY0MDB9.XnZk2X9A99Ws6EktsbYly_DmyT5HfWufajt5Uiw7pZY",
//           refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmE1ZjIzNmFmNTQ2Y2I5YmJlMGUzNyIsImlhdCI6MTc0OTM5NTUwMCwiZXhwIjoxNzUwMDAwMzAwfQ.I0Q9F1I6sApsbIDD48bCrV79kW26xYr2-5vJLdv_5cg",
//           expiresIn: "15m"
//         },
//         data: {
//           user: {
//             id: "682a5f236af546cb9bbe0e37",
//             username: "john_doe",
//             email: "john@example.com",
//             role: "user"
//           }
//         }
//       })
//     });
//   });

//     // Remplir le formulaire
//     await page.getByLabel('Email').fill('new@example.com');
//     await page.getByLabel('Mot de passe').fill('password123');

//     // Soumettre le formulaire
//     await page.getByRole('button', { name: 'Se connecter' }).click();

//     // Vérifier la redirection
//     setTimeout(() => {}, 2000); // Attendre un peu pour la redirection
//     await expect(page).toHaveURL('http://localhost:3000/vehicles');
    
//     // Vérifier que le token est stocké
//     const cookies = await page.context().cookies();
//     expect(tokenCookie).toBeTruthy();
//   });

//   test('Connexion réussie - Redirection vers /users pour les admins', async ({ page }) => {
//     // Mock de la réponse API pour admin
//     await page.route('**/auth/login', route => {
//       route.fulfill({
//         status: 200,
//         contentType: 'application/json',
//         body: JSON.stringify({
//           token: 'fake-jwt-token-for-admin-testing',
//           user: {
//             _id: '2',
//             username: 'adminuser',
//             email: 'admin@example.com',
//             role: 'admin'
//           }
//         })
//       });
//     });

//     // Remplir le formulaire
//     await page.getByLabel('Email').fill('admin@example.com');
//     await page.getByLabel('Mot de passe').fill('admin123');

//     // Soumettre le formulaire
//     await page.getByRole('button', { name: 'Se connecter' }).click();

//     // Vérifier la redirection pour admin
//     await expect(page).toHaveURL('http://localhost:3000/users');
//   });

//   test('Échec de connexion - Identifiants incorrects', async ({ page }) => {
//     // Mock de la réponse API pour échec
//     await page.route('**/auth/login', route => {
//       route.fulfill({
//         status: 401,
//         contentType: 'application/json',
//         body: JSON.stringify({
//           message: 'Email ou mot de passe incorrect'
//         })
//       });
//     });

//     // Remplir le formulaire avec des identifiants incorrects
//     await page.getByLabel('Email').fill('wrong@example.com');
//     await page.getByLabel('Mot de passe').fill('wrongpassword');

//     // Soumettre le formulaire
//     await page.getByRole('button', { name: 'Se connecter' }).click();

//     // Vérifier le message d'erreur
//     await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
    
//     // Vérifier qu'on reste sur la page de login
//     await expect(page).toHaveURL('http://localhost:3000/login');
//   });

//   test('Validation du formulaire - Champs requis', async ({ page }) => {
//     // Essayer de soumettre sans remplir les champs
//     await page.getByRole('button', { name: 'Se connecter' }).click();

//     // Vérifier les messages d'erreur
//     await expect(page.getByText('Email est requis')).toBeVisible();
//     await expect(page.getByText('Mot de passe est requis')).toBeVisible();
//   });

//   test('Validation du formulaire - Format email invalide', async ({ page }) => {
//     // Remplir avec un email invalide
//     await page.getByLabel('Email').fill('invalid-email');
//     await page.getByLabel('Mot de passe').fill('password123');

//     // Soumettre le formulaire
//     await page.getByRole('button', { name: 'Se connecter' }).click();

//     // Vérifier le message d'erreur
//     await expect(page.getByText('Email invalide')).toBeVisible();
//   });

//   test('Lien "Mot de passe oublié"', async ({ page }) => {
//     // Cliquer sur le lien
//     await page.getByText('Mot de passe oublié ?').click();
    
//     // Vérifier la redirection
//     await expect(page).toHaveURL('http://localhost:3000/forgot-password');
//   });

//   test('Affichage/masquage du mot de passe', async ({ page }) => {
//     // Remplir le champ mot de passe
//     await page.getByLabel('Mot de passe').fill('secret123');
    
//     // Vérifier que le mot de passe est masqué par défaut
//     await expect(page.getByLabel('Mot de passe')).toHaveAttribute('type', 'password');
    
//     // Cliquer sur le bouton d'affichage
//     await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
    
//     // Vérifier que le mot de passe est visible
//     await expect(page.getByLabel('Mot de passe')).toHaveAttribute('type', 'text');
    
//     // Cliquer à nouveau pour masquer
//     await page.getByRole('button', { name: 'Masquer le mot de passe' }).click();
    
//     // Vérifier que le mot de passe est à nouveau masqué
//     await expect(page.getByLabel('Mot de passe')).toHaveAttribute('type', 'password');
//   });

//   test('Redirection si déjà connecté', async ({ page }) => {
//     // Simuler un utilisateur déjà connecté
//     await page.context().addCookies([{
//       name: 'token',
//       value: 'fake-valid-token',
//       url: 'http://localhost:3000'
//     }]);

//     // Aller à la page de login
//     await page.goto('http://localhost:3000/login');
    
//     // Vérifier la redirection vers la page d'accueil
//     await expect(page).toHaveURL('http://localhost:3000/vehicles');
//   });
// });