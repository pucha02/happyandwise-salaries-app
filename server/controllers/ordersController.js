import Order from "../models/Order.js";
import axios from "axios";

// KeyCRM API
const keycrmBaseUrl = "https://openapi.keycrm.app/v1/order?limit=50&include=expenses%2Cmanager";
const keyCrmToken = "MWJlODYwNDRmMzc2ZTA0MWEwNTE5ODFkNzIwMDU5MWNjMDU0MjM2YQ";


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOrders(url = keycrmBaseUrl) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${keyCrmToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении данных:", error.message);
        throw error; // Прокидываем ошибку наверх
    }
}

async function processOrders() {
    let nextPageUrl = keycrmBaseUrl;

    while (nextPageUrl) {
        console.log(`Fetching data from ${nextPageUrl}...`);
        const data = await fetchOrders(nextPageUrl);

        if (!data || !data.data || data.data.length === 0) {
            console.log('Нет данных для обработки. Завершение.');
            break;
        }

        const orders = data.data.map(order => ({
            orderId: order.id,
            expenses: order.expenses,
            manager: order.manager || null,
            created_at: order.created_at,
            updated_at: order.updated_at
        }));

        // Сохраняем данные в MongoDB (упрощенный пакетный метод)
        await Order.bulkWrite(
            orders.map(order => ({
                updateOne: {
                    filter: { orderId: order.orderId },
                    update: { $set: order },
                    upsert: true
                }
            }))
        );

        console.log(`Processed ${orders.length} orders.`);

        // Переходим на следующую страницу
        nextPageUrl = data.next_page_url || null;
        if (nextPageUrl) {
            await delay(1000); // Задержка в миллисекундах
        }
    }

    console.log('Обработка завершена.');
}

export const moveOrdersToDb = async (req, res) => {
    try {
        // Удаляем все записи из коллекции
        await Order.deleteMany({});
        console.log('Все старые записи удалены.');

        // Заново получаем данные и добавляем их в базу
        await processOrders();
        res.status(200).send('Данные успешно обновлены.');
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        res.status(500).send('Ошибка при обновлении данных.');
    }
}
