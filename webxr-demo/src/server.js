const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/src', express.static('src'));
app.use('/node_modules', express.static('node_modules'));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API endpoint для демо данных
app.get('/api/demo-coupons', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Кофе -25%',
      business: 'Starbucks',
      rarity: 'rare',
      discount: 25,
      category: 'food'
    },
    {
      id: 2,
      title: 'Пицца -40%',
      business: 'Папа Джонс',
      rarity: 'epic',
      discount: 40,
      category: 'food'
    },
    {
      id: 3,
      title: 'iPhone бесплатно',
      business: 'Apple Store',
      rarity: 'legendary',
      discount: 100,
      category: 'electronics'
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   KuponGo WebXR Demo Server           ║
  ╠═══════════════════════════════════════╣
  ║   🚀 Running on: http://localhost:${PORT}   ║
  ║   📱 Open on mobile for AR experience ║
  ╚═══════════════════════════════════════╝
  `);
});
