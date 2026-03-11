import { chromium } from 'playwright';
import fs from 'fs/promises';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import path from 'path';
import https from 'https';

async function downloadImage(url: string, filepath: string) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        res.resume();
        reject(new Error(`Request Failed With Status Code: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const imgDir = path.resolve('imagenes');
  if (!existsSync(imgDir)) {
    mkdirSync(imgDir, { recursive: true });
  }

  console.log("Navigating to Tienda Prado...");
  await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', {
    waitUntil: 'networkidle'
  });

  // Scroll to bottom to trigger lazy loading
  console.log("Scrolling to load all products and images...");
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });

  // Wait a bit more for images to settle
  await page.waitForTimeout(2000);

  const products = await page.$$eval('.product-miniature', items =>
    items.map(item => {
      const title = item.querySelector('.product-title a')?.textContent?.trim() || "";
      const price = item.querySelector('.product-price')?.textContent?.trim() || "";

      // Try to get real image, avoiding the SVG placeholder
      const imgElement = item.querySelector('.thumbnail img');
      const imageSrc = imgElement?.getAttribute('src') || "";

      return {
        "título": title,
        "descripción": "",
        "texto_precio": price,
        "full_image": imageSrc,
        "imagen": imageSrc.startsWith('data:') ? "" : (imageSrc.split('/').pop()?.split('?')[0] || "")
      };
    })
  );

  const validProducts = products.filter(p => !p.full_image.startsWith('data:') && p.imagen !== "");

  console.log(`Found ${products.length} product entries.`);
  console.log(`Downloading ${validProducts.length} valid images...`);

  for (const product of validProducts) {
    const filepath = path.join(imgDir, product.imagen);
    if (!existsSync(filepath)) {
      try {
        await downloadImage(product.full_image, filepath);
        process.stdout.write("."); // Progress marker
      } catch (err: any) {
        console.error(`\nError downloading ${product.full_image}:`, err.message);
      }
    }
  }
  console.log("\nDownload complete.");

  const finalProducts = validProducts.map(({ full_image, ...rest }: any) => rest);

  await fs.writeFile('products.json', JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log('Saved products.json');

  await browser.close();
})();