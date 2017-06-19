const express = require('express'); // import express
const router = express.Router(); // extract router from express
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


const { catchErrors } = require('../handlers/errorHandlers');
// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/Stores',catchErrors(storeController.getStores));
router.get('/Stores/page/:page',catchErrors(storeController.getStores));

router.get('/Add',authController.isLoggedIn,storeController.addStore);

router.post('/Add',
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.createStore));

router.get('/Stores/:id/edit',catchErrors(storeController.editStore));

router.post('/Add/:id',
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.updateStore));

router.get('/store/:slug',catchErrors(storeController.getStoreBySlug));

router.get('/tags' ,catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag' ,catchErrors(storeController.getStoresByTag));

router.get('/login', userController.login);
router.get('/register',userController.register);
router.post('/register',
	userController.validateRegister,
	catchErrors(userController.createUser),
	authController.login);

router.get("/logout", authController.logout);
router.post('/login',authController.login);

router.get('/account',authController.isLoggedIn, userController.account);
router.post('/account',catchErrors(userController.updateAccount));
router.post('/account/forgot' ,catchErrors(authController.forgot));
router.get('/account/reset/:resetPasswordToken',catchErrors(authController.resetPassword));
router.post('/account/reset/:resetPasswordToken',authController.matchPassword,catchErrors(authController.updatePassword));

router.get('/api/search',catchErrors(storeController.searchStores));
router.get('/api/stores/near',catchErrors(storeController.mapStores));
router.get('/map',storeController.mapPage);

router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore));
router.get('/hearts',authController.isLoggedIn,catchErrors(storeController.getStoresByHearts));

router.post('/reviews/:id',authController.isLoggedIn,catchErrors(reviewController.addReview));

router.get('/top',catchErrors(storeController.getTopStores));

module.exports = router;

