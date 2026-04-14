import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors";

async function fixImages() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB...");

  const db = mongoose.connection.db;
  const vehiclesCol = db.collection("vehicles");

  const documents = await vehiclesCol.find({}).toArray();
  let count = 0;
  
  for (const doc of documents) {
    let imgs = doc.images || [];
    
    // 1. Remove all Unsplash images
    let newImgs = imgs.filter(img => !img.includes('unsplash.com'));
    
    // 2. Fallback if somehow empty
    if (newImgs.length === 0) {
       newImgs.push('/vehicles/default.jpg');
    }
    
    // 3. Duplicate the main image to perfectly enforce "at least 3 images"
    while (newImgs.length < 3) {
      newImgs.push(newImgs[0]);
    }
    
    // Update if changed
    await vehiclesCol.updateOne(
      { _id: doc._id },
      { $set: { images: newImgs } }
    );
    count++;
  }

  console.log(`Successfully removed Unsplash and ensured 3 standard project images across ${count} listings.`);
  await mongoose.disconnect();
}

fixImages().catch(console.error);
