import Order from "../models/Order.js";

export const getManagers = async (req, res) => {
    try {
        const managers = await Order.distinct("manager", { "manager.id": { $ne: null } });
        res.json(managers);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}
