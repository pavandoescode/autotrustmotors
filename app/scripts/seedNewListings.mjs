import mongoose from 'mongoose';

const uri = "mongodb+srv://autotrustmotors:autotrustmotors@cluster0.wvpfjez.mongodb.net/autotrustmotors";

const inventoryMap = {
  "Maruti Suzuki Swift": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg/960px-Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg",
  "Maruti Suzuki Baleno": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Suzuki_Baleno_front_20071004.jpg/960px-Suzuki_Baleno_front_20071004.jpg",
  "Maruti Suzuki Ertiga": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Suzuki_Ertiga_NC_FL_1.5_GLX_Hybrid_Snow_White_Pearl.jpg/960px-Suzuki_Ertiga_NC_FL_1.5_GLX_Hybrid_Snow_White_Pearl.jpg",
  "Maruti Suzuki Brezza": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  "Hyundai i20": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg/960px-Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg",
  "Hyundai Creta": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/2022_Hyundai_Creta_1.6_Plus_%28Chile%29_front_view.jpg/960px-2022_Hyundai_Creta_1.6_Plus_%28Chile%29_front_view.jpg",
  "Hyundai Verna": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2019_Hyundai_Accent_1.6L%2C_front_10.8.19.jpg/960px-2019_Hyundai_Accent_1.6L%2C_front_10.8.19.jpg",
  "Honda City": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg/960px-2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg",
  "Honda Amaze": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Honda_Amaze_front_view_%28cropped%29.jpg/960px-Honda_Amaze_front_view_%28cropped%29.jpg",
  "Tata Nexon": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Tata_Nexon_Blue_Dual_Tone.jpg/960px-Tata_Nexon_Blue_Dual_Tone.jpg",
  "Tata Tiago": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/2022_Tata_Tiago_XZA%2B_front_20230512.jpg/960px-2022_Tata_Tiago_XZA%2B_front_20230512.jpg",
  "Tata Harrier": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg/960px-Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg",
  "Kia Seltos": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg/960px-Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg",
  "Kia Sonet": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg/960px-2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg",
  "Toyota Innova Crysta": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/2022_Toyota_Kijang_Innova_2.4_G_GUN142R_%2820220302%29.jpg/960px-2022_Toyota_Kijang_Innova_2.4_G_GUN142R_%2820220302%29.jpg",
  "Toyota Fortuner": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg/960px-2015_Toyota_Fortuner_%28New_Zealand%29.jpg",
  "Mahindra XUV700": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png/960px-2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png",
  "Mahindra Thar": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg/960px-Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg",
  "Volkswagen Virtus": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png/960px-2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png",
  "Skoda Slavia": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png/960px-2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png"
};

const fillerImages = [
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1600705607316-042db5ee54c1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502877338535-49af1c30e5f5?q=80&w=1200&auto=format&fit=crop"
];

const inventory = [
  { brand: 'Maruti Suzuki', model: 'Swift', cat: 'Hatchback', fuel: ['Petrol', 'CNG'], trans: ['Manual', 'AMT'] },
  { brand: 'Maruti Suzuki', model: 'Baleno', cat: 'Hatchback', fuel: ['Petrol'], trans: ['Manual', 'AMT'] },
  { brand: 'Maruti Suzuki', model: 'Ertiga', cat: 'MUV', fuel: ['Petrol', 'CNG'], trans: ['Manual', 'Automatic'] },
  { brand: 'Maruti Suzuki', model: 'Brezza', cat: 'Compact SUV', fuel: ['Petrol'], trans: ['Manual', 'Automatic'] },
  { brand: 'Hyundai', model: 'i20', cat: 'Hatchback', fuel: ['Petrol'], trans: ['Manual', 'Automatic'] },
  { brand: 'Hyundai', model: 'Creta', cat: 'Compact SUV', fuel: ['Petrol', 'Diesel'], trans: ['Manual', 'Automatic', 'CVT'] }, 
  { brand: 'Hyundai', model: 'Verna', cat: 'Sedan', fuel: ['Petrol'], trans: ['Manual', 'Automatic', 'DCT'] },
  { brand: 'Honda', model: 'City', cat: 'Sedan', fuel: ['Petrol'], trans: ['Manual', 'CVT'] },
  { brand: 'Honda', model: 'Amaze', cat: 'Sedan', fuel: ['Petrol'], trans: ['Manual', 'CVT'] },
  { brand: 'Tata', model: 'Nexon', cat: 'Compact SUV', fuel: ['Petrol', 'Diesel', 'Electric'], trans: ['Manual', 'AMT'] },
  { brand: 'Tata', model: 'Tiago', cat: 'Hatchback', fuel: ['Petrol'], trans: ['Manual', 'AMT'] },
  { brand: 'Tata', model: 'Harrier', cat: 'SUV', fuel: ['Diesel'], trans: ['Manual', 'Automatic'] },
  { brand: 'Kia', model: 'Seltos', cat: 'Compact SUV', fuel: ['Petrol', 'Diesel'], trans: ['Manual', 'Automatic', 'DCT', 'iMT'] },
  { brand: 'Kia', model: 'Sonet', cat: 'Compact SUV', fuel: ['Petrol', 'Diesel'], trans: ['Manual', 'Automatic', 'iMT'] },
  { brand: 'Toyota', model: 'Innova Crysta', cat: 'MUV', fuel: ['Diesel', 'Petrol'], trans: ['Manual', 'Automatic'] },
  { brand: 'Toyota', model: 'Fortuner', cat: 'SUV', fuel: ['Diesel', 'Petrol'], trans: ['Manual', 'Automatic'] },
  { brand: 'Mahindra', model: 'XUV700', cat: 'SUV', fuel: ['Petrol', 'Diesel'], trans: ['Manual', 'Automatic'] },
  { brand: 'Mahindra', model: 'Thar', cat: 'SUV', fuel: ['Petrol', 'Diesel'], trans: ['Manual', 'Automatic'] },
  { brand: 'Volkswagen', Virtus: 'Sedan', fuel: ['Petrol'], trans: ['Manual', 'Automatic', 'DCT'] },
  { brand: 'Skoda', model: 'Slavia', cat: 'Sedan', fuel: ['Petrol'], trans: ['Manual', 'Automatic', 'DCT'] },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  // Retrieve categories map
  const categoriesDocs = await db.collection('categories').find({}).toArray();
  const categoryMap = categoriesDocs.reduce((acc, cat) => {
    acc[cat.name] = cat._id;
    return acc;
  }, {});

  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Haryana', 'Tamil Nadu', 'UP', 'Punjab'];
  const generateRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const cars = [];
  let index = 1;
  const targetCount = 26; // At least 25
  
  for(let i=0; i<targetCount; i++) {
     const t = inventory[Math.floor(Math.random() * inventory.length)];
     if(!t.model) t.model = 'Virtus'; // fix Virtus typo in array above
     if(!t.cat) t.cat = 'Sedan';
     
     const year = generateRandomInt(2018, 2024);
     const title = `${t.brand} ${t.model}`;
     
     // 5 Lakh to 30 Lakh only
     const priceBase = generateRandomInt(500000, 2900000);
     const price = Math.round(priceBase / 10000) * 10000;
     const marketPrice = price + generateRandomInt(20000, 80000);
     
     const fuelType = (t.fuel && t.fuel.length) ? t.fuel[Math.floor(Math.random() * t.fuel.length)] : 'Petrol';
     const trans = (t.trans && t.trans.length) ? t.trans[Math.floor(Math.random() * t.trans.length)] : 'Manual';
     
     const ownerEnums = ['1st Owner', '2nd Owner', '3rd Owner'];
     const owner = ownerEnums[Math.floor(Math.random() * 2)]; 
     
     const isElectric = fuelType === 'Electric';
     const mileage = isElectric ? generateRandomInt(5000, 30000) : generateRandomInt(15000, 80000);
     
     const regState = states[Math.floor(Math.random() * states.length)];
     
     const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}-${index++}`;
     
     const primaryImage = inventoryMap[title] || fillerImages[0];
     // Add 2 filler images to have exactly 3 real images
     const imagesArray = [
       primaryImage, 
       fillerImages[generateRandomInt(0, fillerImages.length - 1)],
       fillerImages[generateRandomInt(0, fillerImages.length - 1)]
     ];
     
     const categoryId = categoryMap[t.cat] || new mongoose.Types.ObjectId();
     
     cars.push({
        _id: new mongoose.Types.ObjectId(),
        title,
        slug,
        brand: t.brand,
        model: t.model,
        year,
        price,
        marketPrice,
        fuelType,
        transmission: trans,
        owner,
        mileage,
        registrationState: regState,
        categoryId: categoryId, // must map properly
        images: imagesArray,
        features: ['Air Conditioning', 'Power Steering', 'Power Windows', 'Anti Lock Braking System', 'Central Locking', 'Reverse Camera'],
        status: (Math.random() > 0.90) ? 'Sold' : 'Available',
        createdAt: new Date(),
        updatedAt: new Date()
     });
  }

  await db.collection('vehicles').insertMany(cars);
  console.log(`Seeded ${cars.length} vehicles.`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
