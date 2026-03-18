import mongoose from 'mongoose';

let isConnected = false;

export const connectMongo = async () => {
  if (isConnected) return;

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE_URL is not set');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);
  isConnected = true;

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
  });
};
