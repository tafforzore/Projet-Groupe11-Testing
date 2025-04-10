const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
// const vehicleRoutes = require('./routes/vehicle.routes');
require('dotenv').config();
const setupSwagger = require('./swagger');


const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));
setupSwagger(app);

// Routes
// app.use('/vehicles', vehicleRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = app;