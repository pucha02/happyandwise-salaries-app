import React from "react";
import "./RegistryTable.css";

const RegistryTable = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    // Сортируем данные по дате (от меньшей к большей)
    const sortedData = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const getStatusClass = (status) => {
        if (status === 'paid') return 'status-paid'; 
        if (status === 'canceled') return 'status-canceled'; 
        return ''; 
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    ✖
                </button>
                <h2>Реєстр витрат</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Ім'я менеджера</th>
                            <th>Послуга</th>
                            <th>Дата внесення витрати</th>
                            <th>Коментар</th>
                            <th>Сума</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.managerName}</td>
                                <td>{row.productName}</td>
                                <td>{new Date(row.createdAt).toLocaleString()}</td>
                                <td>{row.description}</td>
                                <td>{row.amount} грн</td>
                                <td className={getStatusClass(row.status)}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegistryTable;
