import mongoose from 'mongoose';

const uri = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors";

async function deleteAll() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  console.log('Deleting all vehicles...');
  const result = await db.collection('vehicles').deleteMany({});
  console.log(`Deleted ${result.deletedCount} vehicles.`);
  
  await mongoose.disconnect();
}

deleteAll().catch(err => {
    console.error(err);
    process.exit(1);
});
