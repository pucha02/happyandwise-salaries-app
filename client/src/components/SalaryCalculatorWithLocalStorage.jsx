import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { startOfDay, endOfDay } from 'date-fns';
import './SalaryCalculator.css';

function SalaryCalculatorWithLocalStorage() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState('');
    const [salary, setSalary] = useState(null);
    const [allSalaries, setAllSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const processOrders = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.get('http://localhost:5000/api/fetch-orders');
            localStorage.setItem('orders', JSON.stringify(response.data)); // Сохраняем данные в localStorage
            setMessage('Дані успішно оновлені');
        } catch (error) {
            console.error('Ошибка при отриманні даних:', error);
            setMessage('Помилка під час оновлення даних.');
        } finally {
            setLoading(false);
        }
    };

    const getOrdersFromLocalStorage = () => {
        const ordersJSON = localStorage.getItem('orders');
        if (!ordersJSON) {
            console.warn('Дані про замовлення відсутні в localStorage.');
            return [];
        }
        try {
            return JSON.parse(ordersJSON);
        } catch (error) {
            console.error('Помилка парсингу даних з localStorage:', error);
            return [];
        }
    };

    const calculateSalary = (managerId, startDate, endDate) => {
        const orders = getOrdersFromLocalStorage();
        const start = startOfDay(new Date(startDate)); // Начало дня
        const endDates = endOfDay(new Date(endDate));  // Конец дня
    
        console.log("Отримані замовлення:", orders);
        console.log("Період:", { start, endDates });
    
        if (!managerId) {
            // Расчет зарплаты для всех менеджеров
            const managerSalaries = {};
            orders.forEach(order => {
                if (!order.manager || !order.manager.id) return;
    
                const managerId = parseInt(order.manager.id, 10);
                const filteredExpenses = order.expenses.filter(expense => {
                    const expenseDate = new Date(expense.created_at);
                    return expenseDate >= start && expenseDate <= endDates;
                });
    
                // Вывод подходящих расходов в консоль
                console.log(`Відповідні витрати для замовлення ${order.orderId} (менеджер ${managerId}):`, filteredExpenses);
    
                const filteredExpensesSum = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
                if (!managerSalaries[managerId]) {
                    managerSalaries[managerId] = 0;
                }
                managerSalaries[managerId] += filteredExpensesSum;
            });
    
            return managerSalaries; // Вернем объект с зарплатами всех менеджеров
        }
    
        // Расчет зарплаты для конкретного менеджера
        const managerIdNumber = parseInt(managerId, 10);
        const filteredOrders = orders.filter(order => {
            if (!order.manager || parseInt(order.manager.id, 10) !== managerIdNumber) {
                return false;
            }
    
            return order.expenses.some(expense => {
                const expenseDate = new Date(expense.created_at);
                return expenseDate >= start && expenseDate <= endDates;
            });
        });
    
        // Вывод подходящих расходов в консоль
        filteredOrders.forEach(order => {
            const filteredExpenses = order.expenses.filter(expense => {
                const expenseDate = new Date(expense.created_at);
                return expenseDate >= start && expenseDate <= endDates;
            });
            console.log(`Відповідні витрати для замовлення ${order.orderId} (менеджер ${managerIdNumber}):`, filteredExpenses);
        });
    
        return filteredOrders.reduce((total, order) => {
            const filteredExpensesSum = order.expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.created_at);
                    return expenseDate >= start && expenseDate <= endDates;
                })
                .reduce((sum, expense) => sum + expense.amount, 0);
    
            return total + filteredExpensesSum;
        }, 0);
    };

    const handleCalculate = () => {
        const orders = getOrdersFromLocalStorage();
    
        if (!orders || orders.length === 0) {
            setMessage('Немає даних для розрахунків.');
            return;
        }
    
        if (!selectedManager) {
            const managerSalaries = calculateSalary(null, startDate, endDate);
            const salariesList = Object.entries(managerSalaries).map(([id, salary]) => {
                const manager = managers.find(m => parseInt(m.id, 10) === parseInt(id, 10));
                return { id, name: manager?.full_name || `Менеджер ${id}`, salary };
            });
            setAllSalaries(salariesList); // Заполняем список зарплат
            setSalary(null); // Сбрасываем индивидуальную зарплату
        } else {
            const totalSalary = calculateSalary(selectedManager, startDate, endDate);
            setSalary(totalSalary); // Устанавливаем зарплату выбранного менеджера
            setAllSalaries([]); // Очищаем список зарплат
        }
    };
    

    const handleRefresh = async () => {
        setLoading(true);
        setMessage('');

        try {
            await processOrders();
            setMessage('Дані успішно оновлено.');
            window.location.reload(); // Обновляем страницу
        } catch (error) {
            setMessage('Помилка під час оновлення даних.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const orders = getOrdersFromLocalStorage();
        const uniqueManagers = Array.from(
            new Set(orders.map(order => order.manager?.id))
        )
            .filter(id => id)
            .map(id => {
                const manager = orders.find(order => order.manager?.id === id)?.manager;
                return { id: manager.id, full_name: manager.full_name };
            });

        setManagers(uniqueManagers);
    }, []);

    return (
        <div className="salary-calculator-container">
    <h1 className="title">Salary Calculator</h1>
    <div className="form-group">
        <label htmlFor="start-date" className="label">Start Date:</label>
        <DatePicker
            id="start-date"
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="input-field"
        />
    </div>
    <div className="form-group">
        <label htmlFor="end-date" className="label">End Date:</label>
        <DatePicker
            id="end-date"
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="input-field"
        />
    </div>
    <div className="form-group">
        <label htmlFor="manager" className="label">Manager:</label>
        <select
            id="manager"
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value)}
            className="input-field"
        >
            <option value="">Select a Manager</option>
            {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                    {manager.full_name}
                </option>
            ))}
        </select>
    </div>
    <button onClick={handleCalculate} className="button calculate-btn">Calculate</button>

    {/* Вывод зарплаты для одного менеджера */}
    {salary !== null && selectedManager && (
        <div className="salary-result">
            <p>Зарплата менеджера: {salary}</p>
        </div>
    )}

    {/* Вывод зарплаты для всех менеджеров */}
    {allSalaries.length > 0 && (
        <div className="salary-list">
            <h3>Зарплати всіх менеджерів:</h3>
            {allSalaries.map(({ id, name, salary }) => (
                <div key={id} className="salary-list-item">
                    {name}: {salary}
                </div>
            ))}
        </div>
    )}

    <div className="refresh-container">
        <button onClick={handleRefresh} disabled={loading} className="button refresh-btn">
            {loading ? 'Оновлення...' : 'Оновити дані'}
        </button>
    </div>

    {/* Сообщение об ошибке или обновлении */}
    {message && <p className="message">{message}</p>}
</div>

    
    );
}

export default SalaryCalculatorWithLocalStorage;
