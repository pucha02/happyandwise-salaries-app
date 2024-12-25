import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: Number,
    expenses: [
        {
            id: Number,
            destination_id: Number,
            destination_type: String,
            amount: Number,
            source_currency: String,
            actual_amount: Number,
            actual_currency: String,
            is_expense: Boolean,
            status: String,
            payment_date: Date,
            created_at: Date,
            updated_at: Date
        }
    ],
    manager: {
        id: Number,
        first_name: String,
        last_name: String,
        email: String,
        username: String,
        phone: String,
        role_id: Number,
        avatar_id: Number,
        status: String,
        last_logged_at: Date,
        created_at: Date,
        updated_at: Date,
        full_name: String
    },
    created_at: Date,
    updated_at: Date
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order