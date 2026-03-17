// ═══════════════════════════════════════
// Popüler Marka Veritabanı
// Clearbit Logo API + fallback renkler
// ═══════════════════════════════════════

export const BRANDS = [
  // 🎵 Eğlence & Medya
  { name: 'Spotify',       domain: 'spotify.com',       color: '#1DB954', category: 'Eğlence' },
  { name: 'Netflix',       domain: 'netflix.com',       color: '#E50914', category: 'Eğlence' },
  { name: 'YouTube',       domain: 'youtube.com',       color: '#FF0000', category: 'Eğlence' },
  { name: 'Apple TV+',     domain: 'apple.com',         color: '#555555', category: 'Eğlence' },
  { name: 'Disney+',       domain: 'disneyplus.com',    color: '#0063E5', category: 'Eğlence' },
  { name: 'Twitch',        domain: 'twitch.tv',         color: '#9146FF', category: 'Eğlence' },
  { name: 'Steam',         domain: 'steampowered.com',  color: '#1B2838', category: 'Eğlence' },
  { name: 'PlayStation',   domain: 'playstation.com',   color: '#003087', category: 'Eğlence' },

  // 🛒 Alışveriş & E-ticaret
  { name: 'Amazon',        domain: 'amazon.com',        color: '#FF9900', category: 'Alışveriş' },
  { name: 'Trendyol',      domain: 'trendyol.com',      color: '#F27A1A', category: 'Alışveriş' },
  { name: 'Hepsiburada',   domain: 'hepsiburada.com',   color: '#FF6000', category: 'Alışveriş' },
  { name: 'n11',           domain: 'n11.com',           color: '#7B2D8B', category: 'Alışveriş' },
  { name: 'eBay',          domain: 'ebay.com',          color: '#E53238', category: 'Alışveriş' },
  { name: 'Zara',          domain: 'zara.com',          color: '#000000', category: 'Alışveriş' },
  { name: 'H&M',           domain: 'hm.com',            color: '#E50010', category: 'Alışveriş' },

  // 🍔 Yemek & İçecek
  { name: 'Yemeksepeti',   domain: 'yemeksepeti.com',   color: '#FA0050', category: 'Yemek' },
  { name: 'Getir',         domain: 'getir.com',         color: '#5D3EBC', category: 'Yemek' },
  { name: 'Trendyol Yemek',domain: 'trendyol.com',      color: '#F27A1A', category: 'Yemek' },
  { name: "McDonald's",    domain: 'mcdonalds.com',     color: '#FFC72C', category: 'Yemek' },
  { name: 'Starbucks',     domain: 'starbucks.com',     color: '#00704A', category: 'Yemek' },
  { name: 'Domino\'s',     domain: 'dominos.com',       color: '#006491', category: 'Yemek' },

  // 📱 Teknoloji & Yazılım
  { name: 'Apple',         domain: 'apple.com',         color: '#555555', category: 'Teknoloji' },
  { name: 'Google',        domain: 'google.com',        color: '#4285F4', category: 'Teknoloji' },
  { name: 'Microsoft',     domain: 'microsoft.com',     color: '#00A4EF', category: 'Teknoloji' },
  { name: 'Adobe',         domain: 'adobe.com',         color: '#FF0000', category: 'Teknoloji' },
  { name: 'Figma',         domain: 'figma.com',         color: '#F24E1E', category: 'Teknoloji' },
  { name: 'Notion',        domain: 'notion.so',         color: '#000000', category: 'Teknoloji' },
  { name: 'Slack',         domain: 'slack.com',         color: '#4A154B', category: 'Teknoloji' },
  { name: 'GitHub',        domain: 'github.com',        color: '#24292E', category: 'Teknoloji' },
  { name: 'Dropbox',       domain: 'dropbox.com',       color: '#0061FF', category: 'Teknoloji' },
  { name: 'ChatGPT',       domain: 'openai.com',        color: '#10A37F', category: 'Teknoloji' },

  // 🚗 Ulaşım
  { name: 'Uber',          domain: 'uber.com',          color: '#000000', category: 'Ulaşım' },
  { name: 'BiTaksi',       domain: 'bitaksi.com',       color: '#FFD700', category: 'Ulaşım' },
  { name: 'Turkcell',      domain: 'turkcell.com.tr',   color: '#FFD100', category: 'Ulaşım' },
  { name: 'Pegasus',       domain: 'flypgs.com',        color: '#F7901E', category: 'Ulaşım' },
  { name: 'THY',           domain: 'turkishairlines.com',color: '#C8102E', category: 'Ulaşım' },

  // 💰 Finans & Bankacılık
  { name: 'PayPal',        domain: 'paypal.com',        color: '#003087', category: 'Finans' },
  { name: 'Papara',        domain: 'papara.com',        color: '#6B46FF', category: 'Finans' },
  { name: 'Garanti BBVA',  domain: 'garantibbva.com.tr',color: '#009640', category: 'Finans' },
  { name: 'İş Bankası',    domain: 'isbank.com.tr',     color: '#004B87', category: 'Finans' },
  { name: 'Akbank',        domain: 'akbank.com',        color: '#D01E27', category: 'Finans' },

  // 🎓 Eğitim
  { name: 'Udemy',         domain: 'udemy.com',         color: '#A435F0', category: 'Eğitim' },
  { name: 'Coursera',      domain: 'coursera.org',      color: '#0056D2', category: 'Eğitim' },
  { name: 'LinkedIn',      domain: 'linkedin.com',      color: '#0A66C2', category: 'Eğitim' },
  { name: 'Duolingo',      domain: 'duolingo.com',      color: '#58CC02', category: 'Eğitim' },

  // 🏋️ Sağlık & Spor
  { name: 'Nike',          domain: 'nike.com',          color: '#000000', category: 'Spor' },
  { name: 'Adidas',        domain: 'adidas.com',        color: '#000000', category: 'Spor' },
  { name: 'Decathlon',     domain: 'decathlon.com',     color: '#0082C3', category: 'Spor' },
]

// Logo URL üretici (Clearbit API)
export const getLogoUrl = (domain) =>
  `https://logo.clearbit.com/${domain}`

// İsme göre marka bul
export const findBrandByName = (name) => {
  if (!name) return null
  const lower = name.toLowerCase()
  return BRANDS.find(b =>
    lower.includes(b.name.toLowerCase()) ||
    b.name.toLowerCase().includes(lower)
  ) || null
}

// Arama fonksiyonu
export const searchBrands = (query) => {
  if (!query || query.length < 1) return BRANDS.slice(0, 12)
  const q = query.toLowerCase()
  return BRANDS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  ).slice(0, 12)
}

// Kategoriye göre grupla
export const getBrandsByCategory = () => {
  return BRANDS.reduce((acc, brand) => {
    if (!acc[brand.category]) acc[brand.category] = []
    acc[brand.category].push(brand)
    return acc
  }, {})
}
