import express from 'express'
import cors from 'cors'
import axios from 'axios';
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

const keycrmBaseUrl = "https://openapi.keycrm.app/v1/order?limit=50&include=expenses%2Cmanager%2Cproducts.offer";
const keyCrmToken = "MWJlODYwNDRmMzc2ZTA0MWEwNTE5ODFkNzIwMDU5MWNjMDU0MjM2YQ";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Функция получения данных из KeyCRM
const fetchOrders = async (url = keycrmBaseUrl) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${keyCrmToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        throw error;
    }
};

// Endpoint для получения данных
app.get('/api/fetch-orders', async (req, res) => {
    let nextPageUrl = keycrmBaseUrl;
    let allOrders = [];

    try {
        while (nextPageUrl) {
            console.log(`Fetching data from ${nextPageUrl}...`);
            const data = await fetchOrders(nextPageUrl);

            if (!data || !data.data || data.data.length === 0) {
                console.log('Нет данных для обработки. Завершение.');
                break;
            }

            const orders = data.data.map(order => ({
                orderId: order.id,
                products: order.products,
                expenses: order.expenses,
                manager: order.manager || null,
                created_at: order.created_at,
                updated_at: order.updated_at,
            }));

            allOrders.push(...orders);

            console.log(`Fetched ${orders.length} orders.`);
            nextPageUrl = data.next_page_url || null;
            if (nextPageUrl) {
                await delay(1000);
            }
        }

        res.status(200).json(allOrders); // Отправляем все заказы клиенту
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении данных с KeyCRM' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));