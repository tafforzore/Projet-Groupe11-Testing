const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('./../utils/appError');

// Enregistrement
exports.register = async ( req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username) return res.status(400).json({ message: "Username requis" });
    if (!email) return res.status(400).json({ message: "Email requis" });
    if (!password) return res.status(400).json({ message: "Mot de passe requis" });
    if (!role) return res.status(400).json({ message: "Role requis" });

    const user = await User.create(req.body);
    const { accessToken, refreshToken } = user.generateAuthTokens();
    
    // Sauvegarder le refreshToken en DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendAuthResponse(res, 201, accessToken, refreshToken, user);
  } catch (err) {
    next(err);
  }
};

// Connexion
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email et mot de passe requis', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Identifiants incorrects', 401));
    }

    const { accessToken, refreshToken } = user.generateAuthTokens();
    
    // Mettre à jour le refreshToken en DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendAuthResponse(res, 200, accessToken, refreshToken, user);
  } catch (err) {
    next(err);
  }
};


// Rafraîchissement du token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token requis', 400));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Refresh token invalide', 403));
    }

    const { accessToken, refreshToken: newRefreshToken } = user.generateAuthTokens();
    
    // Mettre à jour le refreshToken en DB
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendAuthResponse(res, 200, accessToken, newRefreshToken, user);
  } catch (err) {
    next(new AppError('Invalid token', 403));
  }
};

// Fonction utilitaire pour les réponses
const sendAuthResponse = (res, statusCode, accessToken, refreshToken, user) => {
  res.status(statusCode).json({
    status: 'success',
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    },
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  });
};

exports.logout = async (req, res, next) => {
    try {
      // Invalider le refresh token
      req.user.refreshToken = undefined;
      await req.user.save({ validateBeforeSave: false });
  
      res.status(200).json({
        status: 'success',
        message: 'Déconnexion réussie'
      });
    } catch (err) {
      next(err);
    }
  };

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    res.json(users)
    // res.status(200).json({
    //   status: 'success',
    //   data: {
    //     users
    //   }
    // });
  } catch (err) {
    next(err);
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mise à jour des champs
    user.username = req.body.username ?? user.username;
    user.email = req.body.email ?? user.email;
    user.role = req.body.role ?? user.role;

    if (req.body.password && req.body.password.trim() !== '') {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    
    // Ne pas renvoyer le mot de passe
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    
    res.json(userResponse);
  } catch (err) {
    next(err);
  }
}
