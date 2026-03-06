import { chromium } from 'playwright';
import fs from 'fs/promises';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://tiendaprado.com/es/385-impresiones?resultsPerPage=999', {
    waitUntil: 'networkidle'
  });

  const products = await page.$$eval('.product-miniature', items =>
    items.map(item => {
      const title = item.querySelector('.product-title a')?.innerText.trim() || "";
      const description = item.querySelector('.product-desc')?.innerText.trim() || "";
      const price = item.querySelector('.product-price-and-shipping .price')?.innerText.trim() || "";
      const image = item.querySelector('.thumbnail-container img')?.getAttribute('src') || "";

      return {
        "título": title,
        "descripción": description,
        "texto_precio": price,
        "imagen": image.split('/').pop() // solo el nombre del archivo
      };
    })
  );

  await fs.writeFile('products.json', JSON.stringify(products, null, 2), 'utf8');

  await browser.close();
})();