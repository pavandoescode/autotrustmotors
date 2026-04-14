import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const mongoUriMatch = envContent.match(/MONGODB_URI="(.*)"/);
const uri = mongoUriMatch ? mongoUriMatch[1] : null;

if (!uri) {
  console.error("No MONGODB_URI found");
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function main() {
  await mongoose.connect(uri);
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('123456', salt);

  const existingAdmin = await Admin.findOne({ email: 'admin@autotrustmotors.in' });
  if (existingAdmin) {
    existingAdmin.password = hashedPassword;
    await existingAdmin.save();
    console.log('Admin user updated!');
  } else {
    await Admin.create({
      email: 'admin@autotrustmotors.in',
      password: hashedPassword
    });
    console.log('Admin user created!');
  }
  await mongoose.disconnect();
}

main().catch(console.error);
