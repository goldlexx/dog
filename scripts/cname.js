// Runs after the build: writes the custom domain and the Yandex.Webmaster verification file into dist,
// so GitHub Pages keeps dachadog.ru and the site can be verified after every deploy.
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'CNAME'), 'dachadog.ru\n');
const verification =
  '<html>\n    <head>\n        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n    </head>\n' +
  '    <body>Verification: 2061106fdd976aaf</body>\n</html>\n';
fs.writeFileSync(path.join(dir, 'yandex_2061106fdd976aaf.html'), verification);
const today = new Date().toISOString().slice(0, 10);
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url>\n    <loc>https://dachadog.ru/</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
  '  <url>\n    <loc>https://dachadog.ru/tools/food-calculator/</loc>\n    <lastmod>' + today + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>\n';
fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap);
fs.copyFileSync(path.join(__dirname, 'og-cover.jpg'), path.join(dir, 'og-cover.jpg'));
fs.writeFileSync(path.join(dir, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://dachadog.ru/sitemap.xml\n');
console.log('CNAME, verification file, sitemap.xml, og-cover.jpg and robots.txt written to dist');
