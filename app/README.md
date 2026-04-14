# Luxury Motors App

## Environment

Copy `.env.example` to `.env.local` and provide:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_CLOUD_NAME` or reuse the public cloud name on the server
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER_PREFIX` (optional, defaults to `luxury-motors`)
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

## Development

```bash
npm run dev
```

## Cloudinary Workflow

- Existing Unsplash-backed vehicle images can be migrated with `npm run migrate:images`.
- Migration uploads the images into Cloudinary under `luxury-motors/projects/vehicle-catalog`, updates `scripts/seed.ts`, and rewrites any stored MongoDB vehicle records that still point to Unsplash.
- New admin uploads go through `/api/upload` and are stored in `luxury-motors/assets/vehicles`.
- Cloudinary delivery URLs are generated with responsive width, `f_auto`, `q_auto`, and `dpr_auto` through the shared image wrapper used by cards, galleries, search suggestions, and admin previews.

## Validation

```bash
npm run verify:images
npm run lint
```
