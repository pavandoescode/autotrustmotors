import https from 'https';

const getWikiImage = (query) => {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=800`;
    https.get(url, { headers: { 'User-Agent': 'Node Script/1.0' } }, (res) => {
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

async function test() {
  console.log(await getWikiImage('Maruti Suzuki Swift'));
  console.log(await getWikiImage('Hyundai Creta'));
  console.log(await getWikiImage('Honda City'));
}

test();
