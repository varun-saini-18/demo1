const express = require('express');

const { userAuth } = require('../middlewares')

const router = express.Router();

const { userController, bookController } = require('../controllers');

// Author routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Book routes
router.post('/books', userAuth, bookController.createBook);
router.get('/books', userAuth, bookController.listBooks);
router.get('/books/:bookId', userAuth, bookController.getBookById);
router.delete('/books/:bookId', userAuth, bookController.deleteBookByID);

module.exports = router;