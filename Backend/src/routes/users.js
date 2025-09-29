import express from 'express';
import { getUsers, banUser, deleteUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getUsers);
router.put('/:id/ban', auth, banUser);
router.delete('/:id', auth, deleteUser);

export default router;
