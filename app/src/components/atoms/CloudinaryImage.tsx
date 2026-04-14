'use client';

import Image, { type ImageLoaderProps, type ImageProps } from 'next/image';
import {
  buildCloudinaryDeliveryUrl,
  isCloudinaryUrl,
  type CloudinaryDeliveryOptions,
} from '@/lib/cloudinary-shared';

interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  src: string;
  transformation?: Omit<CloudinaryDeliveryOptions, 'width'>;
}

export default function CloudinaryImage({
  src,
  transformation,
  alt,
  ...props
}: CloudinaryImageProps) {
  if (!isCloudinaryUrl(src)) {
    const isUnsplash = src.includes('unsplash.com');
    return <Image src={src} alt={alt} unoptimized={isUnsplash} {...props} />;
  }

  const loader = ({ src: loaderSrc, width, quality }: ImageLoaderProps) =>
    buildCloudinaryDeliveryUrl(loaderSrc, {
      ...transformation,
      width,
      quality: quality ?? transformation?.quality,
    });

  return <Image src={src} alt={alt} loader={loader} {...props} />;
}
