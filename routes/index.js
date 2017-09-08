const express = require('express');

const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

//
// # Stores
//
router.get('/', storeController.getStores);
router.get('/stores', storeController.getStores);
router.get('/stores/page/:page', storeController.getStores);
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore),
);
router.post(
  '/update/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore),
);
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug/', catchErrors(storeController.getStoreBySlug));
// ### Get top stores
router.get('/top', storeController.getTopStores);

// ## Tags 
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

// ## Store Map
router.get('/map', storeController.mapPage);

//
// # Auth / User
//
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);
router.get('/logout', authController.logout);
router.post('/account/forgot', authController.forgot);
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

//
// # Reviews
//
router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

//
// # MISC
//
router.get('/hearts', storeController.getHeartedStores);

//
// # API
//
router.get('/api/stores/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', authController.isLoggedIn, catchErrors(storeController.heartStore));

module.exports = router;
