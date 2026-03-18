import { v2 as cloudinary } from 'cloudinary';

const clean = (value: string | undefined) => {
  const v = value?.trim();
  if (!v) return undefined;
  // Some .env files mistakenly include a trailing ';'
  return v.endsWith(';') ? v.slice(0, -1).trim() : v;
};

let configuredKey: string | null = null;

const ensureConfigured = (): boolean => {
  const rawCloudName = clean(process.env.CLOUDINARY_CLOUD_NAME);
  const cloudName = rawCloudName?.replace(/\s+/g, '').toLowerCase();
  const apiKey = clean(process.env.CLOUDINARY_API_KEY);
  const apiSecret = clean(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    configuredKey = null;
    return false;
  }

  const nextKey = `${cloudName}|${apiKey}`;
  if (configuredKey !== nextKey) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    configuredKey = nextKey;
  }

  return true;
};

export const isCloudinaryConfigured = () => ensureConfigured();

export const uploadImageBuffer = async (fileBuffer: Buffer, filename: string) => {
  if (!ensureConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    );
  }

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'lostlink',
        resource_type: 'image',
        filename_override: filename,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
};
