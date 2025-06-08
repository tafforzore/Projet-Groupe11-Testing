document.addEventListener('DOMContentLoaded', function() {
  // Éléments du DOM
  const vehicleList = document.getElementById('vehicleList');
  const addVehicleBtn = document.getElementById('addVehicleBtn');
  const vehicleModal = document.getElementById('vehicleModal');
  const confirmModal = document.getElementById('confirmModal');
  const vehicleForm = document.getElementById('vehicleForm');
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const availabilityFilter = document.getElementById('availabilityFilter');
  const maxPriceFilter = document.getElementById('maxPriceFilter');
  

  const token = localStorage.getItem('accessToken');


  // Variables d'état
  let vehicles = [];
  let currentVehicleId = null;
  let features = [];
  
  // Initialisation
  fetchVehicles();
  setupEventListeners();
  
  // Fonctions
  
  function setupEventListeners() {
    // Boutons modaux
    addVehicleBtn.addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);
    
    // Gestion des équipements
    document.getElementById('addFeatureBtn').addEventListener('click', addFeature);
    
    // Sauvegarde du véhicule
    document.getElementById('saveVehicleBtn').addEventListener('click', saveVehicle);
    
    // Filtres
    searchInput.addEventListener('input', filterVehicles);
    typeFilter.addEventListener('change', filterVehicles);
    availabilityFilter.addEventListener('change', filterVehicles);
    maxPriceFilter.addEventListener('input', filterVehicles);
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
  
  function fetchVehicles() {
    fetch('/vehicles', {
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
        if (!response.ok) {
            throw new Error('Erreur HTTP');
        }
        return response.json();
    })
    .then(data => {
        vehicles = data;
        renderVehicleList(vehicles);
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des véhicules:', error);
        alert('Une erreur est survenue lors de la récupération des véhicules');
    });
    }

  
  function renderVehicleList(vehiclesToRender) {
    vehicleList.innerHTML = '';
    
    if (vehiclesToRender.length === 0) {
      vehicleList.innerHTML = '<p>Aucun véhicule trouvé.</p>';
      return;
    }
    
    vehiclesToRender.forEach(vehicle => {
      const vehicleCard = document.createElement('div');
      vehicleCard.className = 'vehicle-card';
      
      const availabilityClass = vehicle.isAvailable ? 'available' : 'unavailable';
      const availabilityText = vehicle.isAvailable ? 'Disponible' : 'Non disponible';
      
      vehicleCard.innerHTML = `
        <div class="vehicle-image">
          <i class="fas fa-${vehicle.type === 'car' ? 'car' : 'truck'}"></i>
        </div>
        <div class="vehicle-details">
          <h3 class="vehicle-title">${vehicle.make} ${vehicle.model}</h3>
          <p class="vehicle-info">${vehicle.year} • ${vehicle.type === 'car' ? 'Voiture' : 'Camionnette'}</p>
          <p class="vehicle-info">${vehicle.registrationNumber}</p>
          <p class="vehicle-price">${vehicle.pricePerDay.toFixed(2)} FCFA/jour</p>
          <p class="vehicle-info">Localisation: ${vehicle.location}</p>
          <span class="vehicle-availability ${availabilityClass}">${availabilityText}</span>
          
          <div class="vehicle-actions">
            <button class="btn btn-primary edit-btn" data-id="${vehicle._id}">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="btn btn-danger delete-btn" data-id="${vehicle._id}">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      `;
      
      vehicleList.appendChild(vehicleCard);
    });
    
    // Ajout des écouteurs d'événements pour les boutons d'action
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => openDeleteModal(e.target.dataset.id));
    });
  }
  
  function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un véhicule';
    document.getElementById('vehicleId').value = '';
    vehicleForm.reset();
    features = [];
    renderFeatures();
    
    // Réinitialiser la disponibilité à true par défaut
    document.getElementById('isAvailable').checked = true;
    
    vehicleModal.style.display = 'flex';
  }
  
  function openEditModal(vehicleId) {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    if (!vehicle) return;
    
    document.getElementById('modalTitle').textContent = 'Modifier le véhicule';
    document.getElementById('vehicleId').value = vehicle._id;
    document.getElementById('make').value = vehicle.make;
    document.getElementById('model').value = vehicle.model;
    document.getElementById('year').value = vehicle.year;
    document.getElementById('type').value = vehicle.type;
    document.getElementById('pricePerDay').value = vehicle.pricePerDay;
    document.getElementById('mileage').value = vehicle.mileage || '';
    document.getElementById('registrationNumber').value = vehicle.registrationNumber;
    document.getElementById('location').value = vehicle.location;
    document.getElementById('isAvailable').checked = vehicle.isAvailable;
    
    if (vehicle.lastServiceDate) {
      const lastServiceDate = new Date(vehicle.lastServiceDate);
      document.getElementById('lastServiceDate').value = lastServiceDate.toISOString().split('T')[0];
    } else {
      document.getElementById('lastServiceDate').value = '';
    }
    
    features = [...vehicle.features];
    renderFeatures();
    
    vehicleModal.style.display = 'flex';
  }
  
  function openDeleteModal(vehicleId) {
    currentVehicleId = vehicleId;
    confirmModal.style.display = 'flex';
  }
  
  function closeModal() {
    vehicleModal.style.display = 'none';
  }
  
  function closeConfirmModal() {
    confirmModal.style.display = 'none';
  }
  
  function addFeature() {
    const featureInput = document.getElementById('newFeature');
    const feature = featureInput.value.trim();
    
    if (feature && !features.includes(feature)) {
      features.push(feature);
      renderFeatures();
      featureInput.value = '';
    }
  }
  
  function removeFeature(index) {
    features.splice(index, 1);
    renderFeatures();
  }
  
  function renderFeatures() {
    const container = document.getElementById('featuresContainer');
    container.innerHTML = '';
    
    features.forEach((feature, index) => {
      const tag = document.createElement('div');
      tag.className = 'feature-tag';
      tag.innerHTML = `
        ${feature}
        <button type="button" onclick="removeFeature(${index})">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(tag);
    });
  }
  
  function saveVehicle() {
    const vehicleId = document.getElementById('vehicleId').value;
    const isEdit = !!vehicleId;
    
    const vehicleData = {
      make: document.getElementById('make').value,
      model: document.getElementById('model').value,
      year: parseInt(document.getElementById('year').value),
      type: document.getElementById('type').value,
      pricePerDay: parseFloat(document.getElementById('pricePerDay').value),
      mileage: parseInt(document.getElementById('mileage').value) || undefined,
      registrationNumber: document.getElementById('registrationNumber').value,
      location: document.getElementById('location').value,
      isAvailable: document.getElementById('isAvailable').checked,
      features: features,
      lastServiceDate: document.getElementById('lastServiceDate').value || undefined
    };
    
    // Validation simple
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.type || 
        !vehicleData.pricePerDay || !vehicleData.registrationNumber || !vehicleData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const url = isEdit ? `/vehicles/${vehicleId}` : '/vehicles';
    const method = isEdit ? 'PUT' : 'POST';
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        },
      body: JSON.stringify(vehicleData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(() => {
      closeModal();
      fetchVehicles();
      alert(`Véhicule ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert(error.message || 'Une erreur est survenue');
    });
  }
  
  function deleteVehicle() {
    fetch(`/vehicles/${currentVehicleId}`, {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401) { 
            alert('Session expirée. Veuillez vous reconnecter.');
            window.location.href = '/login';
            return;
        }
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
            return
        }
        closeConfirmModal();
        fetchVehicles();
        alert('Véhicule supprimé avec succès');
         
    })
    .then(() => {
       
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue lors de la suppression');
    });
}

  
  function filterVehicles() {
    const searchTerm = searchInput.value.toLowerCase();
    const typeValue = typeFilter.value;
    const availabilityValue = availabilityFilter.value;
    const maxPriceValue = maxPriceFilter.value ? parseFloat(maxPriceFilter.value) : null;
    
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.make.toLowerCase().includes(searchTerm) || 
        vehicle.model.toLowerCase().includes(searchTerm) ||
        vehicle.registrationNumber.toLowerCase().includes(searchTerm);
      
      const matchesType = typeValue ? vehicle.type === typeValue : true;
      const matchesAvailability = availabilityValue ? vehicle.isAvailable.toString() === availabilityValue : true;
      const matchesPrice = maxPriceValue ? vehicle.pricePerDay <= maxPriceValue : true;
      
      return matchesSearch && matchesType && matchesAvailability && matchesPrice;
    });
    
    renderVehicleList(filtered);
  }
  
  function logout() {
    // Implémentez la logique de déconnexion ici
    fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    })
    .then(() => {
      window.location.href = '/login';
    })
    .catch(error => {
      console.error('Erreur lors de la déconnexion:', error);
    });
  }
  
  // Exposer certaines fonctions au scope global pour les boutons dans les templates
  window.removeFeature = removeFeature;
  
  // Confirmation de suppression
  document.getElementById('confirmBtn').addEventListener('click', deleteVehicle);
});