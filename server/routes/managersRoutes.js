import express from 'express';
import { getManagers } from '../controllers/managersController.js';

const router = express.Router();

router.get('/get-managers', getManagers)

export default router