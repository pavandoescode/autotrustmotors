export const CLOUDINARY_ROOT_FOLDERS = ['projects', 'users', 'assets'] as const;

export type CloudinaryRootFolder = (typeof CLOUDINARY_ROOT_FOLDERS)[number];

export interface CloudinaryFolderOptions {
  rootFolder?: CloudinaryRootFolder;
  subfolder?: string;
}

export interface CloudinaryDeliveryOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill' | 'fit' | 'pad' | 'scale' | 'thumb';
  quality?: string | number;
  format?: string;
  dpr?: string | number;
  gravity?: string;
}

const DEFAULT_CLOUDINARY_FOLDER_PREFIX = 'luxury-motors';

export function isCloudinaryRootFolder(value: unknown): value is CloudinaryRootFolder {
  return typeof value === 'string' && CLOUDINARY_ROOT_FOLDERS.includes(value as CloudinaryRootFolder);
}

export function isCloudinaryUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

function normalizePathSegments(value: string): string[] {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter(Boolean);
}

function getCloudinaryFolderPrefix(): string {
  const configuredPrefix =
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_PREFIX ||
    process.env.CLOUDINARY_FOLDER_PREFIX ||
    DEFAULT_CLOUDINARY_FOLDER_PREFIX;
  const normalized = normalizePathSegments(configuredPrefix).join('/');
  return normalized || DEFAULT_CLOUDINARY_FOLDER_PREFIX;
}

function getPublicCloudName(src?: string): string {
  const configuredCloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').trim();
  if (configuredCloudName) {
    return configuredCloudName;
  }

  if (!src || !isCloudinaryUrl(src)) {
    return '';
  }

  try {
    const segments = new URL(src).pathname.split('/').filter(Boolean);
    return segments[0] || '';
  } catch {
    return '';
  }
}

function looksLikeTransformationSegment(segment: string): boolean {
  return segment.includes(',') || /^(?:[a-z]{1,3}_[^/]+)$/.test(segment);
}

function stripFileExtension(value: string): string {
  return value.replace(/\.[a-zA-Z0-9]+$/, '');
}

function encodePublicId(publicId: string): string {
  return publicId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function isCloudinaryPublicId(src: string): boolean {
  return (
    typeof src === 'string' &&
    !src.startsWith('/') &&
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('data:') &&
    !src.startsWith('blob:')
  );
}

export function buildCloudinaryFolderPath({
  rootFolder = 'assets',
  subfolder,
}: CloudinaryFolderOptions = {}): string {
  const subfolderPath = subfolder ? normalizePathSegments(subfolder).join('/') : '';
  return [getCloudinaryFolderPrefix(), rootFolder, subfolderPath].filter(Boolean).join('/');
}

export function extractCloudinaryPublicId(src: string): string | null {
  if (!isCloudinaryUrl(src)) {
    return isCloudinaryPublicId(src) ? stripFileExtension(src) : null;
  }

  try {
    const pathnameSegments = new URL(src).pathname.split('/').filter(Boolean);
    const uploadIndex = pathnameSegments.findIndex((segment) => segment === 'upload');
    if (uploadIndex === -1) {
      return null;
    }

    const assetSegments = pathnameSegments.slice(uploadIndex + 1);
    while (assetSegments.length > 0 && looksLikeTransformationSegment(assetSegments[0])) {
      assetSegments.shift();
    }

    const versionIndex = assetSegments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = versionIndex >= 0 ? assetSegments.slice(versionIndex + 1) : assetSegments;

    if (publicIdSegments.length === 0) {
      return null;
    }

    const lastIndex = publicIdSegments.length - 1;
    publicIdSegments[lastIndex] = stripFileExtension(publicIdSegments[lastIndex]);

    return publicIdSegments.join('/');
  } catch {
    return null;
  }
}

export function buildCloudinaryDeliveryUrl(
  src: string,
  {
    width,
    height,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto',
    gravity,
  }: CloudinaryDeliveryOptions = {}
): string {
  const publicId = extractCloudinaryPublicId(src);
  const cloudName = getPublicCloudName(src);

  if (!publicId || !cloudName) {
    return src;
  }

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    `dpr_${dpr}`,
    width ? `w_${Math.round(width)}` : null,
    height ? `h_${Math.round(height)}` : null,
    crop ? `c_${crop}` : null,
    gravity ? `g_${gravity}` : null,
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${encodeURIComponent(
    cloudName
  )}/image/upload/${transformations}/${encodePublicId(publicId)}`;
}
