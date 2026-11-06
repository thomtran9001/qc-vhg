const fs = require('fs');
const path = require('path');
const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const js = ['photos.js', 'logo.js', 'data.js', 'core.js', 'inspect.js', 'lead.js', 'reports.js', 'export.js', 'admin.js', 'i18n.js'].map(read).join('\n');
const out = read('index.html').replace('/*@@CSS@@*/', () => read('styles.css')).replace('/*@@JS@@*/', () => js);
fs.writeFileSync(path.join(dir, '..', 'vhg-qc.html'), out);
console.log('built vhg-qc.html', (out.length / 1024).toFixed(0) + ' KB');
