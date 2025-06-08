const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const setupSwagger = require('./config/swagger');
require('dotenv').config();
const path = require('path');

const vehicleRoutes = require('./routes/vehicle.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]  
    }
  }
}));


app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend/public')));
setupSwagger(app);

// Routes
app.use('/vehicles', vehicleRoutes);
app.use('/auth', authRoutes);


//route frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
}); 

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/users.html'));
}); 

app.get('/vehicules', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/vehicles.html'));
}); 
app.get('/vehicles/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/vehicle.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/register.html'));
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

console.log(process.env.MONGO_URL)

module.exports = app;