import express from 'express';
import { getSalaries } from '../controllers/salariesController.js';

const router = express.Router();

router.get('/get-salaries', getSalaries)

export default router