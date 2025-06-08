document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const message = document.getElementById('message');
  message.textContent = '';

  try {
    const res = await fetch('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
    
    const result = await res.json();

    if (res.ok) {
      const { accessToken, refreshToken } = result.tokens;
      const user = result.data.user;

      // Stocker dans localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      message.style.color = 'green';
      message.textContent = 'Connexion réussie !';
      setTimeout(() => window.location.href = '/vehicules', 1000);
    } else {
      message.style.color = 'red';
      message.textContent = result.message || 'Échec de la connexion';
    }
  } catch (err) {
    message.style.color = 'red';
    message.textContent = 'Erreur de connexion, veuillez réessayer';
  }
});
