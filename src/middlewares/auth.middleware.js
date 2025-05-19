  const jwt = require('jsonwebtoken');
  const User = require('../models/user.model');
  const AppError = require('../utils/appError');

  exports.protect = async (req, res, next) => {
    try {
      let token;
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(new AppError('Veuillez vous connecter', 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next(new AppError('Utilisateur introuvable', 401));
      }

      req.user = currentUser;
      next();
    } catch (err) {
      next(new AppError('Session expirée', 401));
    }
  };