import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your actual credentials from .env.local
cloudinary.config({ 
    cloud_name: 'dujztseub', 
    api_key: '845385392112651', 
    api_secret: 'vOCcMDBfR1pbmT_4s-cT_cCPgOM' 
});

const localUri = "mongodb://localhost:27017/autotrustmotors";
const remoteUri = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors?retryWrites=true&w=majority";

async function run() {
    const localClient = new MongoClient(localUri);
    const remoteClient = new MongoClient(remoteUri);

    try {
        await localClient.connect();
        await remoteClient.connect();

        const localDb = localClient.db("autotrustmotors");
        const remoteDb = remoteClient.db("autotrustmotors");

        console.log("Connected to both databases.");

        // Clear existing data in remote DB specific collections
        await remoteDb.collection("admins").deleteMany({});
        await remoteDb.collection("categories").deleteMany({});
        await remoteDb.collection("vehicles").deleteMany({});
        await remoteDb.collection("leads").deleteMany({});

        // Migrate Admins
        const admins = await localDb.collection("admins").find({}).toArray();
        if (admins.length > 0) {
            await remoteDb.collection("admins").insertMany(admins);
            console.log(`Migrated ${admins.length} admins.`);
        }

        // Migrate Categories
        const categories = await localDb.collection("categories").find({}).toArray();
        if (categories.length > 0) {
            await remoteDb.collection("categories").insertMany(categories);
            console.log(`Migrated ${categories.length} categories.`);
        }
        
        // Migrate Leads
        const leads = await localDb.collection("leads").find({}).toArray();
        if (leads.length > 0) {
            await remoteDb.collection("leads").insertMany(leads);
            console.log(`Migrated ${leads.length} leads.`);
        }

        // Migrate Vehicles
        const vehicles = await localDb.collection("vehicles").find({}).toArray();
        if (vehicles.length > 0) {
            // Map to cache uploaded Cloudinary URLs
            const uploadCache = {};

            for (let i = 0; i < vehicles.length; i++) {
                const vehicle = vehicles[i];
                const updatedImages = [];
                for (let image of vehicle.images) {
                    if (image.startsWith("/vehicles/") || image.startsWith("/uploads/")) {
                        if (uploadCache[image]) {
                            updatedImages.push(uploadCache[image]);
                        } else {
                            const publicPath = path.join(__dirname, "..", "public", image);
                            if (fs.existsSync(publicPath)) {
                                console.log(`Uploading ${publicPath} to Cloudinary...`);
                                try {
                                    const result = await cloudinary.uploader.upload(publicPath, {
                                        folder: "luxury-motors/assets/vehicles"
                                    });
                                    uploadCache[image] = result.secure_url;
                                    updatedImages.push(result.secure_url);
                                } catch (e) {
                                    console.error(`Failed to upload ${publicPath}:`, e.message);
                                    updatedImages.push(image); // fallback
                                }
                            } else {
                                console.warn(`Image file not found: ${publicPath}`);
                                updatedImages.push(image); // fallback
                            }
                        }
                    } else {
                        // Already a full URL
                        updatedImages.push(image);
                    }
                }
                vehicle.images = updatedImages;
                console.log(`Processed vehicle ${i + 1}/${vehicles.length}`);
            }

            // Write updated vehicles to remote
            await remoteDb.collection("vehicles").insertMany(vehicles);
            console.log(`Migrated ${vehicles.length} vehicles with Cloudinary images.`);
        }
        
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await localClient.close();
        await remoteClient.close();
        console.log("Migration finished and connections closed.");
    }
}

run().catch(console.dir);
