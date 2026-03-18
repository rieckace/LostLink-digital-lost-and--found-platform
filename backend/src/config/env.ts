import dotenv from 'dotenv';

// Load environment variables as early as possible.
// This module must be imported before any other modules that read process.env at import-time.
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not set.');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️ Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  }
}
