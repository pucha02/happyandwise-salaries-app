import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { startOfDay, endOfDay } from 'date-fns';
import './SalaryCalculator.css';
import RegistryTable from '../RegistryTable/RegistryTable';

function SalaryCalculatorWithLocalStorage() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState('');
    const [salary, setSalary] = useState(null);
    const [allSalaries, setAllSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [modalData, setModalData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const processOrders = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.get('http://13.60.182.76/api/fetch-orders');
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
        console.log(ordersJSON)
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
        const start = startOfDay(new Date(startDate));
        const endDates = endOfDay(new Date(endDate));
        const paymentTable = [];
        const paymentTableModal = [];
    
        if (!managerId) {
            const managerSalaries = {};
            orders.forEach(order => {
                if (!order.manager || !order.manager.id) return;
    
                const managerId = parseInt(order.manager.id, 10);
                const filteredExpenses = order.expenses.filter(expense => {
                    const expenseDate = new Date(expense.created_at);
                    return expenseDate >= start && expenseDate <= endDates && expense.status !== 'canceled';
                });
    
                filteredExpenses.forEach(expense => {
                    paymentTable.push({
                        managerName: order.manager.full_name || `Менеджер ${managerId}`,
                        description: expense.description,
                        createdAt: expense.created_at,
                        amount: expense.amount,
                    });
                });
    
                const filteredExpensesSum = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
                if (!managerSalaries[managerId]) {
                    managerSalaries[managerId] = 0;
                }
                managerSalaries[managerId] += filteredExpensesSum;
            });
    
            return { salaries: managerSalaries, table: paymentTable };
        }
    
        const managerIdNumber = parseInt(managerId, 10);
        const filteredOrders = orders.filter(order => {
            if (!order.manager || parseInt(order.manager.id, 10) !== managerIdNumber) {
                return false;
            }
    
            return order.expenses.some(expense => {
                const expenseDate = new Date(expense.created_at);
                return expenseDate >= start && expenseDate <= endDates && expense.status !== 'canceled';
            });
        });
    
        filteredOrders.forEach(order => {
            order.expenses.forEach(expense => {
                const expenseDate = new Date(expense.created_at);
                if (expenseDate >= start && expenseDate <= endDates && expense.status !== 'canceled') {
                    paymentTable.push({
                        managerName: order.manager.full_name,
                        description: expense.description,
                        createdAt: expense.created_at,
                        amount: expense.amount,
                        status: expense.status,
                    });
                }
    
                if (expenseDate >= start && expenseDate <= endDates) {
                    order.products.forEach(product => {
                        paymentTableModal.push({
                            managerName: order.manager.full_name,
                            productName: product.name,
                            description: expense.description,
                            createdAt: expense.created_at,
                            amount: expense.amount,
                            status: expense.status,
                        });
                    });
                }
            });
        });
    
        const totalSalary = paymentTable.reduce((total, row) => total + row.amount, 0);
    
        return { salary: totalSalary, table: paymentTableModal };
    };
    



    const handleCalculate = () => {
        const orders = getOrdersFromLocalStorage();

        if (!orders || orders.length === 0) {
            setMessage('Немає даних для розрахунків.');
            return;
        }

        if (!selectedManager) {
            const { salaries, table } = calculateSalary(null, startDate, endDate);
            const salariesList = Object.entries(salaries).map(([id, salary]) => {
                const manager = managers.find(m => parseInt(m.id, 10) === parseInt(id, 10));
                return { id, name: manager?.full_name || `Менеджер ${id}`, salary };
            });
            setAllSalaries(salariesList);
            setSalary(null);
            console.log(table)
            setModalData(table);
        } else {
            const { salary, table } = calculateSalary(selectedManager, startDate, endDate);
            setSalary(salary);
            setAllSalaries([]);
            setModalData(table);
            console.log(table)
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);


    const handleRefresh = async () => {
        setLoading(true);
        setMessage('');

        try {
            await processOrders();
            setMessage('Дані успішно оновлено.');
            window.location.reload();
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
                <label htmlFor="start-date" className="label">Дата початку:</label>
                <DatePicker
                    id="start-date"
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    className="input-field"
                    dateFormat="dd-MM-yyyy"
                />
            </div>
            <div className="form-group">
                <label htmlFor="end-date" className="label">Дата кінця:</label>
                <DatePicker
                    id="end-date"
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    className="input-field"
                    dateFormat="dd-MM-yyyy"
                />
            </div>
            <div className="form-group">
                <label htmlFor="manager" className="label">Менеджер:</label>
                <select
                    id="manager"
                    value={selectedManager}
                    onChange={e => setSelectedManager(e.target.value)}
                    className="input-field"
                >
                    <option value="">Всі</option>
                    {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                            {manager.full_name}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={handleCalculate} className="button calculate-btn">Розрахувати</button>

            {salary !== null && selectedManager && (
                <div className="salary-result">
                    <p>Зарплата менеджера: {salary} грн</p>
                    <button onClick={handleOpenModal} className="button register-btn">Реєстр</button>
                </div>
            )}

            {allSalaries.length > 0 && (
                <div className="salary-list">
                    <h3>Зарплати всіх менеджерів:</h3>
                    {allSalaries.map(({ id, name, salary }) => (
                        <div key={id} className="salary-list-item">
                            {name}: {salary} грн
                            {/* <button onClick={handleOpenModal} className="button register-btn">Реєстр</button> */}
                        </div>
                    ))}
                </div>
            )}

            <div className="refresh-container">
                <button onClick={handleRefresh} disabled={loading} className="button refresh-btn">
                    {loading ? 'Оновлення...' : 'Оновити дані'}
                </button>
            </div>

            {message && <p className="message">{message}</p>}
            <RegistryTable isOpen={isModalOpen} onClose={handleCloseModal} data={modalData} totalSalary={modalData
        .filter(item => item.status !== 'canceled')
        .reduce((total, item) => total + item.amount, 0)}/>
        </div>


    );
}

export default SalaryCalculatorWithLocalStorage;
