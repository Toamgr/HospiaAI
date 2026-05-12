export const BAR_PRODUCT_CATEGORIES = {
  // Spirits — base
  vodka: { id: 'vodka', label: 'Vodka', parent: 'spirits', default_pour_ml: 40, default_abv_range: [37, 45], storage: 'ambient' },
  gin: { id: 'gin', label: 'Gin', parent: 'spirits', default_pour_ml: 40, default_abv_range: [38, 48], storage: 'ambient' },
  tequila: { id: 'tequila', label: 'Tequila', parent: 'spirits', default_pour_ml: 40, default_abv_range: [38, 46], storage: 'ambient' },
  mezcal: { id: 'mezcal', label: 'Mezcal', parent: 'spirits', default_pour_ml: 40, default_abv_range: [38, 55], storage: 'ambient' },
  whisky_scotch: { id: 'whisky_scotch', label: 'Scotch Whisky', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 60], storage: 'ambient' },
  whisky_bourbon: { id: 'whisky_bourbon', label: 'Bourbon / American Whiskey', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 60], storage: 'ambient' },
  whisky_irish: { id: 'whisky_irish', label: 'Irish Whiskey', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 46], storage: 'ambient' },
  whisky_japanese: { id: 'whisky_japanese', label: 'Japanese Whisky', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 50], storage: 'ambient' },
  rum: { id: 'rum', label: 'Rum', parent: 'spirits', default_pour_ml: 40, default_abv_range: [37, 65], storage: 'ambient' },
  brandy: { id: 'brandy', label: 'Brandy', parent: 'spirits', default_pour_ml: 40, default_abv_range: [36, 50], storage: 'ambient' },
  cognac: { id: 'cognac', label: 'Cognac', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 45], storage: 'ambient' },
  armagnac: { id: 'armagnac', label: 'Armagnac', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 48], storage: 'ambient' },
  arak: { id: 'arak', label: 'Arak', parent: 'spirits', default_pour_ml: 40, default_abv_range: [40, 50], storage: 'ambient' },
  // Liqueurs
  liqueur_fruit: { id: 'liqueur_fruit', label: 'Fruit Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [15, 30], storage: 'ambient' },
  liqueur_herbal: { id: 'liqueur_herbal', label: 'Herbal Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [15, 40], storage: 'ambient' },
  liqueur_cream: { id: 'liqueur_cream', label: 'Cream Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [15, 20], storage: 'refrigerated' },
  liqueur_coffee: { id: 'liqueur_coffee', label: 'Coffee Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [15, 30], storage: 'ambient' },
  liqueur_amaro: { id: 'liqueur_amaro', label: 'Amaro / Digestif Bitter', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [20, 40], storage: 'ambient' },
  liqueur_triple_sec: { id: 'liqueur_triple_sec', label: 'Triple Sec / Orange Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [20, 40], storage: 'ambient' },
  liqueur_elderflower: { id: 'liqueur_elderflower', label: 'Elderflower Liqueur', parent: 'liqueurs', default_pour_ml: 20, default_abv_range: [18, 22], storage: 'ambient' },
  // Aperitifs & Vermouth
  vermouth_dry: { id: 'vermouth_dry', label: 'Dry Vermouth', parent: 'fortified_wine', default_pour_ml: 20, default_abv_range: [14, 22], storage: 'refrigerated' },
  vermouth_sweet: { id: 'vermouth_sweet', label: 'Sweet / Rosso Vermouth', parent: 'fortified_wine', default_pour_ml: 20, default_abv_range: [14, 22], storage: 'refrigerated' },
  vermouth_blanc: { id: 'vermouth_blanc', label: 'Blanc / Bianco Vermouth', parent: 'fortified_wine', default_pour_ml: 20, default_abv_range: [14, 22], storage: 'refrigerated' },
  aperitif_wine: { id: 'aperitif_wine', label: 'Wine-Based Aperitif', parent: 'aperitifs', default_pour_ml: 60, default_abv_range: [11, 18], storage: 'refrigerated' },
  aperitif_spirit: { id: 'aperitif_spirit', label: 'Spirit-Based Aperitif', parent: 'aperitifs', default_pour_ml: 30, default_abv_range: [15, 35], storage: 'ambient' },
  digestif: { id: 'digestif', label: 'Digestif', parent: 'digestifs', default_pour_ml: 30, default_abv_range: [25, 55], storage: 'ambient' },
  // Mixers & Fresh
  fresh_citrus: { id: 'fresh_citrus', label: 'Fresh Citrus Juice', parent: 'produce', default_pour_ml: 22, default_abv_range: [0, 0], storage: 'refrigerated' },
  simple_syrup: { id: 'simple_syrup', label: 'Simple Syrup / Flavored Syrup', parent: 'syrups', default_pour_ml: 15, default_abv_range: [0, 0], storage: 'refrigerated' },
  tonic_soda: { id: 'tonic_soda', label: 'Tonic / Soda / Sparkling Mixer', parent: 'mixers', default_pour_ml: 120, default_abv_range: [0, 0], storage: 'ambient' },
  bitters: { id: 'bitters', label: 'Cocktail Bitters', parent: 'bitters', default_pour_ml: 2, default_abv_range: [35, 60], storage: 'ambient' },
  garnish: { id: 'garnish', label: 'Garnish', parent: 'garnish', default_pour_ml: null, default_abv_range: [0, 0], storage: 'refrigerated' }
}

export const CATEGORY_PARENTS = {
  spirits: { label: 'Spirits', icon: '🥃' },
  liqueurs: { label: 'Liqueurs', icon: '🍯' },
  fortified_wine: { label: 'Vermouth & Fortified Wine', icon: '🍷' },
  aperitifs: { label: 'Aperitifs', icon: '🫧' },
  digestifs: { label: 'Digestifs', icon: '🌿' },
  produce: { label: 'Fresh Produce', icon: '🍋' },
  syrups: { label: 'Syrups', icon: '🍬' },
  mixers: { label: 'Mixers', icon: '💧' },
  bitters: { label: 'Bitters', icon: '🫙' },
  garnish: { label: 'Garnish', icon: '🌿' }
}
