async function verifyAssets() {
  console.log('--- Verifying Server Assets on http://localhost:5000 ---');
  const urls = [
    'http://localhost:5000/',
    'http://localhost:5000/developer-portal/',
    'http://localhost:5000/developer-portal/dev-portal.css',
    'http://localhost:5000/developer-portal/dev-portal.js',
    'http://localhost:5000/api/hospitals',
    'http://localhost:5000/api/dev/stats'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(`[${res.status} ${res.statusText}] ${url} (Length: ${text.length})`);
    } catch (e) {
      console.error(`[ERROR] ${url}:`, e.message);
    }
  }

  // Also check if index.html links to valid assets
  try {
    const rootRes = await fetch('http://localhost:5000/');
    const html = await rootRes.text();
    const scriptMatches = html.match(/src="([^"]+)"/g) || [];
    const linkMatches = html.match(/href="([^"]+)"/g) || [];

    console.log('\n--- Checking Embedded HTML Assets ---');
    for (const m of [...scriptMatches, ...linkMatches]) {
      const path = m.replace(/^(src|href)="/, '').replace(/"$/, '');
      if (path.startsWith('/') && !path.startsWith('//')) {
        const assetUrl = `http://localhost:5000${path}`;
        const assetRes = await fetch(assetUrl);
        console.log(`[${assetRes.status}] Embedded asset: ${assetUrl}`);
      }
    }
  } catch (err) {
    console.error('HTML parse error:', err);
  }
}

verifyAssets();
