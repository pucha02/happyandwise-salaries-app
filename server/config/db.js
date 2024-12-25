import mongoose from 'mongoose';
const mongoUri = 'mongodb+srv://happyandwisebot:eXIjqBpLsvyxbymy@cluster0.npvxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export default connectDB;