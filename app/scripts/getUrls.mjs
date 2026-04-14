import https from 'https';

const getWikiImage = (query) => {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=800`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const inventory = [
  { brand: 'Maruti Suzuki', model: 'Swift', search: 'Suzuki Swift' },
  { brand: 'Maruti Suzuki', model: 'Baleno', search: 'Suzuki Baleno' },
  { brand: 'Maruti Suzuki', model: 'Ertiga', search: 'Suzuki Ertiga' },
  { brand: 'Maruti Suzuki', model: 'Brezza', search: 'Suzuki Vitara Brezza' },
  { brand: 'Hyundai', model: 'i20', search: 'Hyundai i20' },
  { brand: 'Hyundai', model: 'Creta', search: 'Hyundai Creta' },
  { brand: 'Hyundai', model: 'Verna', search: 'Hyundai Accent' }, 
  { brand: 'Honda', model: 'City', search: 'Honda City' },
  { brand: 'Honda', model: 'Amaze', search: 'Honda Amaze' },
  { brand: 'Tata', model: 'Nexon', search: 'Tata Nexon' },
  { brand: 'Tata', model: 'Tiago', search: 'Tata Tiago' },
  { brand: 'Tata', model: 'Harrier', search: 'Tata Harrier' },
  { brand: 'Kia', model: 'Seltos', search: 'Kia Seltos' },
  { brand: 'Kia', model: 'Sonet', search: 'Kia Sonet' },
  { brand: 'Toyota', model: 'Innova Crysta', search: 'Toyota Innova' },
  { brand: 'Toyota', model: 'Fortuner', search: 'Toyota Fortuner' },
  { brand: 'Mahindra', model: 'XUV700', search: 'Mahindra XUV700' },
  { brand: 'Mahindra', model: 'Thar', search: 'Mahindra Thar' },
  { brand: 'Volkswagen', model: 'Virtus', search: 'Volkswagen Virtus' },
  { brand: 'Skoda', model: 'Slavia', search: 'Škoda Slavia' },
];

async function run() {
  const map = {};
  for (const car of inventory) {
    const key = `${car.brand} ${car.model}`;
    const url = await getWikiImage(car.search);
    map[key] = url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  }
  console.log(JSON.stringify(map, null, 2));
}

run();
