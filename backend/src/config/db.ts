import { connectMongo } from '../lib/mongo';
import { ensureAdminUser } from '../services/ensureAdmin';

export const connectDB = async (): Promise<void> => {
  await connectMongo();
  try {
    await ensureAdminUser();
  } catch (err) {
    console.warn('⚠️ Failed to ensure admin user:', err);
  }
};
