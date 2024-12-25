import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js';
import managersRoutes from './routes/managersRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import salariesRoutes from './routes/salariesRoutes.js'

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Подключение к MongoDB
connectDB()

app.use('/api/managers', managersRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/salaries', salariesRoutes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));