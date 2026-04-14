import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { isCloudinaryRootFolder, type CloudinaryRootFolder } from '@/lib/cloudinary-shared';

const DEFAULT_UPLOAD_ROOT_FOLDER: CloudinaryRootFolder = 'assets';
const DEFAULT_UPLOAD_SUBFOLDER = 'vehicles';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folderValue = formData.get('folder');
    const subfolderValue = formData.get('subfolder');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    const rootFolder = isCloudinaryRootFolder(folderValue)
      ? folderValue
      : DEFAULT_UPLOAD_ROOT_FOLDER;
    const subfolder =
      typeof subfolderValue === 'string' && subfolderValue.trim()
        ? subfolderValue.trim()
        : DEFAULT_UPLOAD_SUBFOLDER;

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      return uploadImage(buffer, {
        rootFolder,
        subfolder,
        tags: ['vehicle-upload', rootFolder, subfolder.replace(/\//g, '-')],
      });
    });

    const assets = await Promise.all(uploadPromises);
    const urls = assets.map((asset) => asset.secureUrl);

    return NextResponse.json({ success: true, data: urls, assets });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to upload images';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
