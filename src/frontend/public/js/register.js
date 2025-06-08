const form = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
        message.style.color = 'red';
        message.textContent = 'Identifiants incorrects';
        return;
    }

    if (!res.ok) {
        message.style.color = 'red';
        message.textContent = result.message || 'Erreur lors de la connexion';
        return;
    }

    const result = await response.json();

    if (response.ok) {
      messageDiv.style.color = 'green';
      messageDiv.textContent = 'Inscription réussie !';
      setTimeout(() => window.location.href = '/vehicules', 1000);
    } else {
      messageDiv.style.color = 'red';
      messageDiv.textContent = result.message || 'Erreur lors de l’inscription';

      const { accessToken, refreshToken, expiresIn } = result.tokens;
      const { user } = result.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('expiresIn', expiresIn);

      // Stocker les infos utilisateur si besoin
      localStorage.setItem('user', JSON.stringify(user));


    }
  } catch (err) {
    messageDiv.textContent = 'erreur de connexion, veuillez réessayer';
  }
});
