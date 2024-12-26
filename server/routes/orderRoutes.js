import express from 'express';
import { moveOrdersToDb } from '../controllers/ordersController.js';

const router = express.Router();

router.post('/move-orders-to-db', moveOrdersToDb)

export default router