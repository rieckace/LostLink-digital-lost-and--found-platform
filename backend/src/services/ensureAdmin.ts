import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';

export async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await UserModel.findOne({ email: normalizedEmail }).exec();
  if (existing) {
    if ((existing as any).role !== 'admin') {
      (existing as any).role = 'admin';
      await existing.save();
    }
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await UserModel.create({
    name: 'Admin',
    email: normalizedEmail,
    password: hashedPassword,
    role: 'admin',
  });
}
