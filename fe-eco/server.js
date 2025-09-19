import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import compression from 'compression';
import sirv from 'sirv';
import fs from 'fs';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createServer() {
  const app = express();
  app.use(compression());

  app.use(sirv(resolve(__dirname, 'dist/client'), { gzip: true, extensions: [] }));

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      let template, render;

      template = fs.readFileSync(resolve(__dirname, 'dist/client/index.html'), 'utf-8');
      render = (await import('./dist/server/entry-server.js')).render;

      let metaTags = `
        <title>ECommerce Site</title>
        <meta property="og:title" content="ECommerce Site">
        <meta property="og:description" content="Best online store.">
        <meta property="og:image" content="https://marketplace.canva.com/EAGQ1aYlOWs/1/0/1600w/canva-blue-colorful-illustrative-e-commerce-online-shop-logo-bHiX_0QpJxE.jpg">
        <meta property="og:url" content="https://fe-ecom.onrender.com${url}">

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@your_twitter_handle" />
        <meta name="twitter:title" content="Eco Marketplace – Sản phẩm xanh, thân thiện môi trường" />
        <meta name="twitter:description" content="Nền tảng TMĐT giúp bạn kết nối với sản phẩm xanh, bền vững, dễ sử dụng và an toàn cho môi trường." />
        <meta name="twitter:image" content="https://marketplace.canva.com/EAGQ1aYlOWs/1/0/1600w/canva-blue-colorful-illustrative-e-commerce-online-shop-logo-bHiX_0QpJxE.jpgg" />
      `;

      if (url.startsWith('/products/')) {
        const slug = url.split('/products/')[1];
        const response = await axios.get(`https://be-ecom-2hfk.onrender.com/api/v1/products/slug/${slug}`);
        const product = response?.data?.data;
        if (product) {
          metaTags = `
            <title>${product.meta_title}</title>
            <meta property="og:title" content="${product.meta_title}">
            <meta charset="UTF-8">
            <meta property="og:description" content="${product.meta_description}">
            <meta property="og:image" content="https://be-ecom-2hfk.onrender.com/images/${product.images[0]}">
            <meta property="og:url" content="https://fe-ecom.onrender.com/product/${product.slug}">
          `;
        }
      }

      const { html: appHtml } = await render(url);

      const finalHtml = template
        .replace('<!--ssr-meta-->', metaTags)
        .replace('<!--app-html-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e) {
      console.error(e);
      res.status(500).end(e.stack);
    }
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
}

createServer();
