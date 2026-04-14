import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: 'dujztseub', 
    api_key: '845385392112651', 
    api_secret: 'vOCcMDBfR1pbmT_4s-cT_cCPgOM' 
});

const uri = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors";

// A safe, simple Unsplash URL to fallback if Wikimedia fails to upload from Cloudinary
const safeFallback = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop";

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const vehicles = await db.collection('vehicles').find({}).toArray();
  console.log(`Found ${vehicles.length} vehicles.`);

  // We map the remote URL to the uploaded Cloudinary URL so we don't upload the same image repeatedly.
  // E.g., the filler unsplash images are shared across multiple vehicles.
  const uploadCache = {};

  let countUpdated = 0;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const newImages = [];
    let changed = false;

    for (let img of v.images) {
      if (!img.includes('res.cloudinary.com')) {
        // Needs upload
        changed = true;
        if (uploadCache[img]) {
          newImages.push(uploadCache[img]);
        } else {
          try {
            console.log(`Uploading ${img} to Cloudinary...`);
            const result = await cloudinary.uploader.upload(img, {
               folder: "luxury-motors/assets/vehicles"
            });
            uploadCache[img] = result.secure_url;
            newImages.push(result.secure_url);
            console.log(`Successfully uploaded: ${result.secure_url}`);
          } catch (e) {
            console.error(`Failed to upload ${img}: ${e.message}`);
            // Fallback to safe Unsplash image if blocked by server
            if (!uploadCache[safeFallback]) {
              console.log(`Uploading fallback ${safeFallback}...`);
              const fbResult = await cloudinary.uploader.upload(safeFallback, {
                 folder: "luxury-motors/assets/vehicles"
              });
              uploadCache[safeFallback] = fbResult.secure_url;
            }
            newImages.push(uploadCache[safeFallback]);
          }
        }
      } else {
        newImages.push(img);
      }
    }

    if (changed) {
      await db.collection('vehicles').updateOne(
        { _id: v._id },
        { $set: { images: newImages } }
      );
      countUpdated++;
      console.log(`Vehicle ${v._id} updated with Cloudinary URLs.`);
    }
  }

  console.log(`Finished processing. Updated ${countUpdated} vehicles.`);
  await mongoose.disconnect();
}

run().catch(console.error);
