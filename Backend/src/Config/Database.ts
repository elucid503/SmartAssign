import mongoose from 'mongoose';

export const ConnectDatabase = async (): Promise<void> => {
  try {
    const MongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    
    await mongoose.connect(MongoUri);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('📦 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('📦 MongoDB error:', error);
});

export default mongoose;
