import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors";

const fillerImages = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1600705607316-042db5ee54c1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop"
];

async function update() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB...");

  const db = mongoose.connection.db;
  const vehiclesCol = db.collection("vehicles");

  const documents = await vehiclesCol.find({}).toArray();
  let count = 0;
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const imgs = doc.images || [];
    let newImgs = [...imgs];
    
    // Check if it has fewer than 3 images
    if (newImgs.length < 3) {
      if (newImgs.length === 0) newImgs.push('/vehicles/default.jpg'); // just in case
      newImgs.push(fillerImages[i % 3]);
      if (newImgs.length < 3) {
         newImgs.push(fillerImages[(i + 1) % 3]);
      }
      
      await vehiclesCol.updateOne(
        { _id: doc._id },
        { $set: { images: newImgs } }
      );
      count++;
    }
  }

  console.log(`Updated ${count} vehicle listings to have at least 3 images.`);
  await mongoose.disconnect();
}

update().catch(console.error);
