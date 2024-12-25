import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { endOfDay } from 'date-fns';
import './SalaryCalculator.css'

function SalaryCalculator() {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/managers/get-managers');
                setManagers(response.data);
            } catch (error) {
                console.error('Error fetching managers:', error);
            }
        };

        fetchManagers();
    }, []);

    const fetchSalaries = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/salaries/get-salaries', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    managerId: selectedManager
                }
            });
            setSalaries(response.data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        setMessage('');
    
        try {
            const response = await axios.post('http://localhost:5000/api/orders/move-orders-to-db');
            setMessage(response.data);    
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            setMessage('Ошибка при обновлении данных.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container'>
            <h1>Salary Calculator</h1>
            <div>
                <label>Start Date:</label>
                <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
            </div>
            <div>
                <label>End Date:</label>
                <DatePicker selected={endDate} onChange={date => setEndDate(date)} />
            </div>
            <div>
                <label>Manager:</label>
                <select value={selectedManager} onChange={e => setSelectedManager(e.target.value)}>
                    <option value="">Select a Manager</option>
                    {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                            {manager.full_name}
                        </option>
                    ))}
                </select>
            </div>
            <button onClick={fetchSalaries}>Calculate</button>
            <ul>
                {salaries.map(salary => (
                    <li key={salary._id}>{salary._id}: {salary.totalAmount}</li>
                ))}
            </ul>

            <div>
                <button onClick={handleRefresh} disabled={loading}>
                    {loading ? 'Оновлення...' : 'Оновити дані'}
                </button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default SalaryCalculator;