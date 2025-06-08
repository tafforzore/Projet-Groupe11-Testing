document.addEventListener('DOMContentLoaded', function() {
  // Éléments du DOM
  const userList = document.getElementById('userList');
  const addUserBtn = document.getElementById('addUserBtn');
  const userModal = document.getElementById('userModal');
  const confirmModal = document.getElementById('confirmModal');
  const userForm = document.getElementById('userForm');
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const token = localStorage.getItem('accessToken');
  
  // Variables d'état
  let users = [];
  let currentUserId = null;
  
  // Initialisation
  fetchUsers();
  setupEventListeners();
  
  // Fonctions
  
  function setupEventListeners() {
    // Boutons modaux
    addUserBtn.addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Sauvegarde de l'utilisateur
    document.getElementById('saveUserBtn').addEventListener('click', saveUser);
    
    // Filtres
    searchInput.addEventListener('input', filterUsers);
    roleFilter.addEventListener('change', filterUsers);
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
  
  function fetchUsers() {
    fetch('/auth/users', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  
        }
    })
      .then(response => {
        if (response.status === 401) {
            alert('Session expirée. Veuillez vous reconnecter.');      
            // window.location.href = '/login';
            return;
        }
        return response.json()
        })
      .then(data => {
        users = data;
        renderUserList(users);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        alert('Une erreur est survenue lors de la récupération des utilisateurs');
      });
  }
  
  function renderUserList(usersToRender) {
    userList.innerHTML = '';
    
    if (usersToRender.length === 0) {
      userList.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucun utilisateur trouvé</td></tr>';
      return;
    }
    
    usersToRender.forEach(user => {
      const userRow = document.createElement('tr');
      const roleClass = user.role === 'admin' ? 'admin' : 'user';
      
      userRow.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${roleClass}">${user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span></td>
        <td>
          <div class="user-actions">
            <button class="btn btn-primary edit-btn" data-id="${user._id}">
              <i class="fas fa-edit"></i>Modifier
            </button>
            <button class="btn btn-danger delete-btn" data-id="${user._id}">
              <i class="fas fa-trash"></i>Supprimer
            </button>
          </div>
        </td>
      `;
      
      userList.appendChild(userRow);
    });
    
    // Ajout des écouteurs d'événements pour les boutons d'action
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openEditModal(e.target.closest('button').dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openDeleteModal(e.target.closest('button').dataset.id));
    });
  }
  
  function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un utilisateur';
    document.getElementById('userId').value = '';
    userForm.reset();
    
    // Afficher le champ mot de passe et le rendre obligatoire
    document.getElementById('password').closest('.form-group').style.display = 'block';
    document.getElementById('password').required = true;
    
    userModal.style.display = 'flex';
  }
  
  function openEditModal(userId) {
    const user = users.find(u => u._id === userId);
    if (!user) return;
    
    document.getElementById('modalTitle').textContent = 'Modifier l\'utilisateur';
    document.getElementById('userId').value = user._id;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;
    
    // Cacher le champ mot de passe et le rendre non obligatoire
    document.getElementById('password').closest('.form-group').style.display = 'none';
    document.getElementById('password').required = false;
    
    userModal.style.display = 'flex';
  }
  
  function openDeleteModal(userId) {
    currentUserId = userId;
    confirmModal.style.display = 'flex';
  }
  
  function closeModal() {
    userModal.style.display = 'none';
  }
  
  function closeConfirmModal() {
    confirmModal.style.display = 'none';
  }
  
  function saveUser() {
    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;
    
    const userData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value
    };
    
    // Si c'est une création, ajouter le mot de passe
    if (!isEdit) {
      userData.password = document.getElementById('password').value;
    }
    
    // Validation simple
    if (!userData.username || !userData.email || (!isEdit && !userData.password)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const url = isEdit ? `/auth/users/${userId}` : '/auth/register';
    const method = isEdit ? 'PUT' : 'POST';
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  
        },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(() => {
      closeModal();
      fetchUsers();
      alert(`Utilisateur ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue');
    });
  }
  
  function deleteUser() {
    fetch(`/auth/users/${currentUserId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  
        }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      return response.json();
    })
    .then(() => {
      closeConfirmModal();
      fetchUsers();
      alert('Utilisateur supprimé avec succès');
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue lors de la suppression');
    });
  }
  
  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const roleValue = roleFilter.value;
    
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm);
      
      const matchesRole = roleValue ? user.role === roleValue : true;
      
      return matchesSearch && matchesRole;
    });
    
    renderUserList(filtered);
  }
  
  function logout() {
    fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  
        }
    })
    .then(() => {
    //   window.location.href = '/login';
    })
    .catch(error => {
      console.error('Erreur lors de la déconnexion:', error);
    });
  }
  
  // Confirmation de suppression
  document.getElementById('confirmBtn').addEventListener('click', deleteUser);
});