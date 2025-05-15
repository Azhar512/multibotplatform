const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, userController.getUsers);
router.put('/:id/ban', auth, userController.banUser);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;