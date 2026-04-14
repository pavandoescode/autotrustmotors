import https from 'https';
import fs from 'fs';
import path from 'path';

const imageMap = {
    'Maruti Suzuki Swift': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg/960px-Suzuki_Swift_%282024%29_hybrid_DSC_6076.jpg',
    'Maruti Suzuki Baleno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Suzuki_Baleno_front_20071004.jpg/960px-Suzuki_Baleno_front_20071004.jpg',
    'Maruti Suzuki Ertiga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Suzuki_Ertiga_NC_FL_1.5_GLX_Hybrid_Snow_White_Pearl.jpg/960px-Suzuki_Ertiga_NC_FL_1.5_GLX_Hybrid_Snow_White_Pearl.jpg',
    'Maruti Suzuki Brezza': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'Hyundai i20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg/960px-Hyundai_i20_%28III%2C_Facelift%29_%E2%80%93_f_11102025.jpg',
    'Hyundai Creta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/2022_Hyundai_Creta_1.6_Plus_%28Chile%29_front_view.jpg/960px-2022_Hyundai_Creta_1.6_Plus_%28Chile%29_front_view.jpg',
    'Hyundai Verna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2019_Hyundai_Accent_1.6L%2C_front_10.8.19.jpg/960px-2019_Hyundai_Accent_1.6L%2C_front_10.8.19.jpg',
    'Honda City': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg/960px-2022_Honda_City_ZX_i-VTEC_%28India%29_front_view_%28cropped%29.jpg',
    'Honda Amaze': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Honda_Amaze_front_view_%28cropped%29.jpg/960px-Honda_Amaze_front_view_%28cropped%29.jpg',
    'Tata Nexon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Tata_Nexon_Blue_Dual_Tone.jpg/960px-Tata_Nexon_Blue_Dual_Tone.jpg',
    'Tata Tiago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/2022_Tata_Tiago_XZA%2B_front_20230512.jpg/960px-2022_Tata_Tiago_XZA%2B_front_20230512.jpg',
    'Tata Harrier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg/960px-Tata_Buzzard_Sport%2C_GIMS_2019%2C_Le_Grand-Saconnex_%28GIMS0651%29.jpg',
    'Kia Seltos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg/960px-Kia_Seltos_SP2_PE_Snow_White_Pearl_%2817%29_%28cropped%29.jpg',
    'Kia Sonet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg/960px-2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg',
    'Toyota Innova Crysta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/2022_Toyota_Kijang_Innova_2.4_G_GUN142R_%2820220302%29.jpg/960px-2022_Toyota_Kijang_Innova_2.4_G_GUN142R_%2820220302%29.jpg',
    'Toyota Fortuner': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg/960px-2015_Toyota_Fortuner_%28New_Zealand%29.jpg',
    'Mahindra XUV700': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png/960px-2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png',
    'Mahindra Thar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg/960px-Mahindra_Thar_SUV_in_%22Red_Rage%22_color_at_Ashiana_Brahmanda%2C_East_Singbhum_India_%28Ank_Kumar%2C_Infosys_limited%29_02_%28cropped%29.jpg',
    'Volkswagen Virtus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png/960px-2022_Volkswagen_Virtus_1.5_GT_%28India%29_front_view_02.png',
    'Skoda Slavia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png/960px-2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png'
};

const dlDir = path.join(process.cwd(), 'public', 'vehicles');
if (!fs.existsSync(dlDir)) {
  fs.mkdirSync(dlDir, { recursive: true });
}

async function download(url, filename) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch: ' + res.statusText);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Error downloading', url, err);
  }
}

async function run() {
  for (const [name, url] of Object.entries(imageMap)) {
    const filename = path.join(dlDir, name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.jpg');
    console.log('Downloading ' + name + '...');
    await download(url, filename);
  }
  console.log('Download complete!');
}

run();
