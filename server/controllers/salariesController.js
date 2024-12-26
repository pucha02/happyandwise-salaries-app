import Order from "../models/Order.js";

export const getSalaries = async (req, res) => {
    const { startDate, endDate, managerId } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).send({ error: 'Invalid date range' });
    }

    try {
        const match = {
            "expenses.created_at": {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (managerId) {
            match["manager.id"] = parseInt(managerId, 10);
        }

        const salaries = await Order.aggregate([
            { $unwind: "$expenses" },
            { $match: match },
            {
                $group: {
                    _id: "$manager.full_name",
                    totalAmount: { $sum: "$expenses.amount" }
                }
            },
            
            { $sort: { expenseDate: 1 } } // Sort by date if needed
        ]);

        res.json(salaries);
        console.log(salaries);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// export const getSalaries = async (req, res) => {
//     const { startDate, endDate, managerId } = req.query;

//     if (!startDate || !endDate) {
//         return res.status(400).send({ error: 'Invalid date range' });
//     }

//     try {
//         const match = {
//             "expenses.created_at": {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             }
//         };

//         if (managerId) {
//             match["manager.id"] = parseInt(managerId, 10);
//         }

//         const salaries = await Order.aggregate([
//             { $unwind: "$expenses" },
//             { $match: match },
//             {
//                 $project: {
//                     _id: 0, // Exclude the MongoDB document ID
//                     managerName: "$manager.full_name",
//                     expenseDate: "$expenses.created_at",
//                     amount: "$expenses.amount"
//                 }
//             },
//             { $sort: { expenseDate: 1 } } // Sort by date if needed
//         ]);

//         res.json(salaries);
//         console.log(salaries);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// };
