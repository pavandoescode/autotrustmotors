import 'server-only';

import { v2 as cloudinary } from 'cloudinary';
import {
  buildCloudinaryFolderPath,
  type CloudinaryFolderOptions,
} from '@/lib/cloudinary-shared';

export interface UploadImageOptions extends CloudinaryFolderOptions {
  fileName?: string;
  overwrite?: boolean;
  tags?: string[];
}

export interface UploadedImageAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

const configuredCloudName =
  (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();

cloudinary.config({
  cloud_name: configuredCloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizePublicId(value: string): string {
  return value
    .trim()
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^-+|-+$/g, '');
}

function assertCloudinaryConfiguration() {
  if (
    !configuredCloudName ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary is not configured. Check your Cloudinary environment variables.');
  }
}

export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadImageOptions = {}
): Promise<UploadedImageAsset> {
  assertCloudinaryConfiguration();

  const folder = buildCloudinaryFolderPath(options);
  const publicId = options.fileName ? sanitizePublicId(options.fileName) : undefined;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          public_id: publicId,
          overwrite: options.overwrite ?? false,
          use_filename: !publicId,
          unique_filename: !publicId,
          tags: options.tags,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload did not return a result.'));
            return;
          }

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      )
      .end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  assertCloudinaryConfiguration();
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
