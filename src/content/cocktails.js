import negroniImg from '../assets/magazine/cocktail-negroni.jpg';
import oldFashionedImg from '../assets/magazine/cocktail-oldfashioned.jpg';
import martiniImg from '../assets/magazine/cocktail-martini.jpg';
import daiquiriImg from '../assets/magazine/cocktail-daiquiri.jpg';
import sazeracImg from '../assets/magazine/cocktail-sazerac.jpg';

/*
 * ── IMAGE AUDIT ──────────────────────────────────────────────────────────────
 *
 * Cocktails 1–5 use verified local assets (imported above).
 * Cocktails 6–20 use Unsplash URLs — visually unverified.
 * To audit: open each URL in a browser and confirm the image matches the drink.
 *
 * KNOWN ISSUES (last audited 2026-06-08):
 *   corpse-reviver-no-2  — photo-1526887520775-4b14b8aed897 showed a dark amber
 *                          liquid (likely beer). Replaced with photo-1609151354774-8a5f3c2ef34f
 *                          which shows a pale gin coupe cocktail (correct profile).
 *
 * IDEAL IMAGES (for future local asset imports):
 *   Each cocktail should ideally have a local verified image matching its color,
 *   glass shape, and garnish. Add assets/magazine/cocktail-{slug}.jpg and import above.
 *
 * COCKTAIL IMAGE MAP (slug → Unsplash photo ID):
 *   aviation          → 1542847890-8c4210389b23   (unverified)
 *   french-75         → 1663908672815-fd62829ad3f7 (unverified)
 *   manhattan         → 1619503569646-50b2154078ac (unverified)
 *   new-york-sour     → 1596920720403-76eef4bf77a2 (unverified)
 *   gimlet            → 1643068476553-a64cf7d40948 (unverified)
 *   last-word         → 1536935338788-846bb9a3c45b (unverified)
 *   whiskey-sour      → 1500217052183-bc01eee1a74e (unverified)
 *   paloma            → 1665609951801-ff3f25c0f0f1 (unverified)
 *   espresso-martini  → 1551024709-8f23befc6f87   (unverified)
 *   boulevardier      → 1724451344589-a8f14f87cde7 (unverified)
 *   penicillin        → 1607446045875-de57c995726b (unverified)
 *   corpse-reviver-no-2 → 1609151354774-8a5f3c2ef34f (REPLACED — was wrong image)
 *   naked-and-famous  → 1575023782549-62ca0d244b39 (unverified)
 *   paper-plane       → 1681640772333-88422bbb3ae9 (unverified)
 *   clover-club       → 1582056509381-33e11b85733f (unverified)
 *   tommy's-margarita → 1543536448-1e76fc2795bf   (unverified)
 *   bees-knees        → 1521483632781-413ac2a35ee6 (unverified)
 *   gold-rush         → 1712254247032-2182777f7264 (unverified)
 *   trinidad-sour     → 1693969861611-02f6eff93044 (unverified)
 *   jungle-bird       → 1589749684936-d15b84cfc8d9 (unverified)
 */

export const cocktails = [
  {
    slug: "negroni",
    name: "Negroni",
    era: "Florence, 1919",
    origin: "Caffè Casoni, Italy",
    family: "Aperitivo",
    baseSpirit: "London Dry Gin",
    glass: "Cut crystal rocks",
    garnish: "Expressed orange peel",
    method: "Built over a single large rock, stirred briefly",
    image: negroniImg,
    kicker: "Feature Nº 01 — Aperitivo",
    deck: "A bitter, ruby-hued aperitivo born in a Florentine café and elevated to a global ritual of the dusk hour.",
    tagline: "Three parts, one century, a thousand evenings.",
    history: [
      "The Negroni is, by most accountings, an act of impatience. In the spring of 1919, Count Camillo Negroni — a Florentine aristocrat with a taste for the cowboy bars of the American West — asked the bartender at Caffè Casoni to fortify his Americano. Soda water out, gin in. A slice of orange in place of the usual lemon. The drink was returned, blood-orange and bitter, and a category was born.",
      "For decades it remained a regional ritual: the bitter aperitivo poured before dinner across the bars of Florence, Milan, and Trieste. Then the world arrived. The 1980s brought the drink to London. The 2000s carried it to Brooklyn and Tokyo. By the 2010s it had become, improbably, the most ordered classic cocktail on earth — its formula so balanced, its color so unmistakable, that it required no translation.",
      "Today, every bar of consequence has its own posture toward the Negroni. Some build it equal-parts, by the book. Some lean the gin, some lean the Campari. A few, the brave, stir it with mezcal instead. It remains, in any incarnation, what it was on the day it was first poured: a drink that asks the drinker to slow down.",
    ],
    tasting:
      "Opens with the high-citrus snap of orange oil and juniper. Mid-palate turns medicinal — gentian, rhubarb, the bittersweet hum of Campari's red kingdom. Finishes long, dry, faintly herbal, with the warmth of vermouth lingering at the back of the throat.",
    bartenderNote: {
      quote:
        "I want it cold enough to ache, with a single rock that lasts the whole pour. Cut the peel thick. Express it once, hard, and let the oil sit on the surface like a film. The first sip should feel like opening a door into evening.",
      attribution: "— Hidetsugu Ueno, Bar High Five, Tokyo",
    },
    technique: [
      {
        title: "Prepare the glass",
        body: "Chill a heavy cut-crystal rocks glass. Place a single hand-cut large-format ice cube — never small cubes; dilution is the enemy of equilibrium.",
      },
      {
        title: "Build, do not shake",
        body: "Pour the three spirits directly over the ice. Stir with a long brass spoon for no more than ten rotations. The Negroni is a stirred drink dressed as a built one; you are seeking integration, not aeration.",
      },
      {
        title: "Express the peel",
        body: "Take a thick swath of orange peel, hold it pith-down over the surface, and snap it once. The oils will spray in a fine, visible mist. Wipe the rim, drop the peel into the glass.",
      },
    ],
    ingredients: [
      { measure: "30 ml", name: "London Dry Gin", note: "Tanqueray, Beefeater, or Plymouth" },
      { measure: "30 ml", name: "Campari", note: "Always Campari — accept no substitute" },
      { measure: "30 ml", name: "Sweet Vermouth", note: "Carpano Antica or Cocchi di Torino" },
      { measure: "1 swath", name: "Orange peel", note: "Cut thick, no pith" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.92 },
      { axis: "Sweet", value: 0.45 },
      { axis: "Sour", value: 0.18 },
      { axis: "Herbal", value: 0.78 },
      { axis: "Citrus", value: 0.62 },
      { axis: "Strong", value: 0.85 },
    ],
    cultural:
      "In Italy, the Negroni is not a cocktail so much as a clock. Six in the evening, the bars fill; small dishes of olives, focaccia, and ham appear; the conversation softens. The drink is the punctuation between the working day and what comes after — a piece of civic infrastructure as much as any tram line.",
    related: ["old-fashioned", "sazerac", "martini"],
  },
  {
    slug: "old-fashioned",
    name: "Old Fashioned",
    era: "Louisville, c. 1880",
    origin: "Pendennis Club, Kentucky",
    family: "Stirred & Spirituous",
    baseSpirit: "Bourbon or Rye Whiskey",
    glass: "Heavy rocks",
    garnish: "Orange peel, brandied cherry",
    method: "Sugar, bitters, whiskey, ice — stirred",
    image: oldFashionedImg,
    kicker: "Feature Nº 02 — Whiskey",
    deck: "The cocktail before there were cocktails. A study in restraint, sugar, and the slow geometry of melting ice.",
    tagline: "Four ingredients. Two hundred years. One truth.",
    history: [
      "Before there were cocktails, there was the cocktail — defined in 1806 by an editor of The Balance and Columbian Repository as 'a stimulating liquor, composed of spirits of any kind, sugar, water, and bitters.' That definition is the Old Fashioned, full stop. Everything since is variation.",
      "The name came later. By the 1880s, drinkers at Louisville's Pendennis Club were asking bartenders for whiskey 'the old fashioned way' — that is, without the syrups and liqueurs that had crept into the cocktail's modern incarnations. The request hardened into an order. The order became a drink.",
      "Through Prohibition, the Old Fashioned became a vehicle for hiding bad bourbon under fruit and soda — the muddled-orange-and-cherry style that haunted the cocktail's reputation for half a century. The modern renaissance, beginning in the early 2000s, stripped it back. Sugar cube. Bitters. Whiskey. Single rock. A peel.",
    ],
    tasting:
      "Opens with caramel and oak from the whiskey, lifted by the brightness of expressed orange oil. The sugar gives the drink weight without sweetness; the Angostura threads a darker spice — clove, allspice — through the middle. Long, warm finish, distinctly American.",
    bartenderNote: {
      quote:
        "Forget the muddling. A sugar cube saturated in bitters at the bottom of the glass dissolves into the whiskey as you stir. The drink builds itself. Your job is to stay out of its way.",
      attribution: "— Dale DeGroff, King Cocktail",
    },
    technique: [
      {
        title: "Saturate the sugar",
        body: "Place one demerara sugar cube in the bottom of a heavy rocks glass. Soak it with three to four dashes of Angostura bitters and a single dash of orange bitters. Wait thirty seconds.",
      },
      {
        title: "Add the whiskey",
        body: "Pour 60 ml of a bonded bourbon or a high-rye whiskey. Stir gently against the sugar until you feel it begin to break apart at the bottom of the glass.",
      },
      {
        title: "Ice and finish",
        body: "Add a single large rock. Stir for forty rotations to chill and integrate. Express a wide orange peel over the surface and drop it in. A brandied cherry, optional, never maraschino.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Bourbon or Rye Whiskey", note: "Bonded, 100 proof preferred" },
      { measure: "1 cube", name: "Demerara sugar", note: "Or 7.5 ml rich demerara syrup" },
      { measure: "3 dashes", name: "Angostura bitters" },
      { measure: "1 dash", name: "Orange bitters" },
      { measure: "1 peel", name: "Orange peel, expressed" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.55 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.1 },
      { axis: "Herbal", value: 0.45 },
      { axis: "Citrus", value: 0.55 },
      { axis: "Strong", value: 0.95 },
    ],
    cultural:
      "The Old Fashioned is the cocktail of the American hotel bar — of mahogany, of low lamps, of a tie loosened at the end of a long day. It belongs to a particular kind of room, and a particular kind of hour, and refuses to be hurried.",
    related: ["negroni", "sazerac", "martini"],
  },
  {
    slug: "martini",
    name: "Martini",
    era: "New York, c. 1900",
    origin: "Disputed — Knickerbocker Hotel or San Francisco",
    family: "Stirred & Spirituous",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe or V-glass",
    garnish: "Olive or lemon twist",
    method: "Stirred, never shaken — Bond was wrong",
    image: martiniImg,
    kicker: "Feature Nº 03 — Gin",
    deck: "The most argued-over three ounces in the history of mixed drinks. The drink that asks you to commit.",
    tagline: "Cold, clear, and uncompromising.",
    history: [
      "No cocktail has been so thoroughly mythologized, so casually butchered, and so jealously guarded as the Martini. Its origins are a matter of unresolvable dispute — a bartender named Jerry Thomas in 1862 San Francisco, a New York hotel in 1911, a town in California called Martinez. The drink itself does not care.",
      "What we can say with certainty: by the early twentieth century, the Martini was already an institution. Gin, vermouth, a stir, a glass, a garnish. The ratios drifted across the decades — from a wet 2:1 in the 1920s to the bone-dry whisper-of-vermouth Martinis of the 1960s, when Winston Churchill claimed his preferred method was to glance at the vermouth bottle while pouring the gin.",
      "The modern Martini has settled, mostly, somewhere in the middle. A bracing ratio of gin to vermouth — perhaps 5:1, perhaps 6:1 — stirred until the glass is painfully cold, served with the smallest possible flourish. Olive or twist. That choice, alone, is yours to make.",
    ],
    tasting:
      "A Martini is texture before flavor. The cold is the first sensation; then the gin's juniper and citrus; then the soft floral lift of the vermouth, almost subliminal. The finish is clean, dry, and impossibly long. With an olive: brine and umami. With a twist: a high citrus brightness.",
    bartenderNote: {
      quote:
        "Shaking bruises the gin and clouds the drink with shards of broken ice. We stir for sixty rotations against good clear cubes, until the glass is so cold it hurts to hold. That is the entire technique. There is nothing else.",
      attribution: "— Audrey Saunders, Pegu Club, New York",
    },
    technique: [
      {
        title: "Chill everything",
        body: "Place the coupe in the freezer at least thirty minutes before service. The gin and vermouth, ideally, are kept cold too. Cold is not a finishing touch; it is the drink.",
      },
      {
        title: "Stir with discipline",
        body: "In a chilled mixing glass, combine 75 ml gin and 15 ml dry vermouth over large, clear cubes. Stir continuously for sixty seconds, no more. Count if you must.",
      },
      {
        title: "Strain and dress",
        body: "Julep-strain into the chilled coupe. For an olive, add it on a brass pick directly. For a twist, express the lemon peel forcefully over the surface, wipe the rim, then drop in or discard — your call.",
      },
    ],
    ingredients: [
      { measure: "75 ml", name: "London Dry Gin", note: "Tanqueray No. Ten, Sipsmith, Plymouth" },
      { measure: "15 ml", name: "Dry Vermouth", note: "Dolin Dry or Noilly Prat" },
      { measure: "1", name: "Castelvetrano olive", note: "or a wide swath of lemon peel" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.3 },
      { axis: "Sweet", value: 0.08 },
      { axis: "Sour", value: 0.12 },
      { axis: "Herbal", value: 0.7 },
      { axis: "Citrus", value: 0.6 },
      { axis: "Strong", value: 0.98 },
    ],
    cultural:
      "The Martini is theater. It is ordered at the bar, in person, with eye contact. It is served with ceremony — the long pour, the slow stir, the careful walk from station to seat. To drink one is to participate in a ritual older than most of the people performing it.",
    related: ["negroni", "old-fashioned", "daiquiri"],
  },
  {
    slug: "daiquiri",
    name: "Daiquiri",
    era: "Santiago de Cuba, 1898",
    origin: "Daiquirí mine, Cuba",
    family: "Sours",
    baseSpirit: "White Rum",
    glass: "Chilled coupe",
    garnish: "None — or a single lime wheel",
    method: "Shaken hard, double-strained",
    image: daiquiriImg,
    kicker: "Feature Nº 04 — Rum",
    deck: "Three ingredients. Hemingway's drink. A masterclass in what restraint actually means.",
    tagline: "The sour, perfected, on the Cuban coast.",
    history: [
      "The story begins in 1898, in an iron mine near the Cuban village of Daiquirí. An American engineer named Jennings Cox, working there during the Spanish-American War, ran out of gin while entertaining guests. He had rum, sugar, and limes. The drink he improvised was named for the village.",
      "The Daiquiri traveled to Havana, where the bartender Constantino Ribalaigua at El Floridita refined it into its definitive form — fresh lime, white rum, fine sugar, shaken to a froth over crushed ice. Ernest Hemingway became its most famous patron, ordering them double, without sugar, with grapefruit and maraschino added — the Papa Doble that became its own variant.",
      "Through the twentieth century, the Daiquiri suffered terribly. The blender's invention turned it into a slush of bottled mix and bad rum. The classic was nearly forgotten. Its resurrection, beginning in the early 2000s, returned it to what it had always been: a perfect, austere sour, made with three ingredients and a willingness to shake hard.",
    ],
    tasting:
      "Bracingly fresh on the entry — lime, lime, lime — softened immediately by the warmth of white rum and the rounding sweetness of sugar. Mid-palate is creamy from emulsified citrus oils. Finish is clean, dry, and quietly tropical, with a faint floral note from the rum's molasses base.",
    bartenderNote: {
      quote:
        "The Daiquiri is the bartender's calibration test. If your Daiquiri is balanced — citrus to sugar to spirit — every sour you build for the rest of the night will land. Get this one wrong, get them all wrong.",
      attribution: "— Julio Cabrera, Café La Trova, Miami",
    },
    technique: [
      {
        title: "Squeeze fresh lime",
        body: "Bottled juice will not do. Squeeze the lime within an hour of service; the oils begin to oxidize immediately and the drink loses its lift.",
      },
      {
        title: "Build the sour",
        body: "In a chilled shaker, combine 60 ml white rum, 22 ml fresh lime juice, and 15 ml simple syrup (1:1). Fill with hard, dry cubes.",
      },
      {
        title: "Shake hard, strain twice",
        body: "Shake vigorously for ten to twelve seconds — you want sound, you want sweat on the tin. Double-strain through a fine mesh into a coupe chilled to within an inch of frosting.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "White Rum", note: "Havana Club 3, Plantation 3 Stars, Probitas" },
      { measure: "22 ml", name: "Fresh lime juice", note: "Squeezed within the hour" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1 white sugar and water" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.88 },
      { axis: "Herbal", value: 0.18 },
      { axis: "Citrus", value: 0.95 },
      { axis: "Strong", value: 0.7 },
    ],
    cultural:
      "The Daiquiri belongs to the late afternoon — to the moment when the heat begins to break and the light turns gold. It is the drink of the Cuban veranda, the Florida porch, the Mediterranean dock. It is what to drink when the day is ending and you do not yet want it to.",
    related: ["martini", "old-fashioned", "negroni"],
  },
  {
    slug: "sazerac",
    name: "Sazerac",
    era: "New Orleans, c. 1850",
    origin: "Sazerac Coffee House, French Quarter",
    family: "Stirred & Spirituous",
    baseSpirit: "Rye Whiskey",
    glass: "Absinthe-rinsed rocks",
    garnish: "Lemon peel, discarded",
    method: "Stirred in a separate glass, served neat",
    image: sazeracImg,
    kicker: "Feature Nº 05 — Rye",
    deck: "America's first cocktail, by some accounts. The official drink of New Orleans. A rite of passage.",
    tagline: "Absinthe, rye, and the perfume of a French Quarter dusk.",
    history: [
      "The Sazerac begins with cognac — not whiskey — in the New Orleans of the 1840s, where the apothecary Antoine Peychaud was serving his proprietary bitters mixed with Sazerac de Forge brandy at his shop on Royal Street. The drink moved across town to the Sazerac Coffee House, where it took its name, and gradually evolved into the form we recognize.",
      "The shift from cognac to rye came in the 1870s, after the phylloxera epidemic devastated European vineyards and made French brandy scarce. American rye whiskey filled the gap, and the new spirit — drier, sharper, more aggressive — turned out to suit the bitters and the absinthe rinse perfectly. The cocktail had found its final shape.",
      "In 2008, the Louisiana state legislature formally named the Sazerac the official cocktail of New Orleans. It is the only American city to have one. The designation is fitting: the drink belongs to a particular place and a particular humidity, and tastes most like itself when consumed within ten blocks of where it was first poured.",
    ],
    tasting:
      "The first sensation is the absinthe — a cold, herbal perfume that rises from the glass before the liquid reaches the lip. The rye follows: dry, peppery, faintly grassy. Peychaud's bitters give a soft, anise-tinged pink to the whole drink and a finish that lingers like the smell of rain on warm asphalt.",
    bartenderNote: {
      quote:
        "Two glasses. One chilled with ice to rinse with absinthe — just a coat, then dumped. The other for stirring the rye and sugar and Peychaud's. Strain into the rinsed glass. No ice in the final pour. The lemon peel is expressed, then thrown away. This is not a drink to dress up.",
      attribution: "— Chris Hannah, Manolito, New Orleans",
    },
    technique: [
      {
        title: "Rinse the glass",
        body: "Chill a rocks glass with ice. Add 5 ml of absinthe, swirl to coat the interior, then discard ice and excess. The glass should be fragrant, not wet.",
      },
      {
        title: "Stir the cocktail",
        body: "In a separate mixing glass, combine 60 ml rye whiskey, 5 ml rich demerara syrup, and three to four dashes of Peychaud's bitters over ice. Stir for thirty seconds.",
      },
      {
        title: "Strain and finish",
        body: "Strain the stirred mixture into the absinthe-rinsed glass — no ice in the final glass. Express a wide lemon peel over the surface, wipe the rim, and discard the peel. Serve immediately.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Rye Whiskey", note: "Sazerac Rye, Rittenhouse Bonded" },
      { measure: "5 ml", name: "Absinthe", note: "For the rinse — Vieux Pontarlier or Pernod" },
      { measure: "5 ml", name: "Rich demerara syrup", note: "2:1 sugar to water" },
      { measure: "4 dashes", name: "Peychaud's Bitters", note: "Never substitute" },
      { measure: "1 peel", name: "Lemon peel", note: "Expressed, then discarded" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.6 },
      { axis: "Sweet", value: 0.4 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.9 },
      { axis: "Citrus", value: 0.4 },
      { axis: "Strong", value: 0.95 },
    ],
    cultural:
      "The Sazerac is the drink of the French Quarter at dusk — of wrought iron balconies, of brass bands two streets over, of the slow southern air just beginning to cool. It is ordered late, savored slowly, and never to be rushed.",
    related: ["old-fashioned", "negroni", "martini"],
  },

  // ─── Sours ───────────────────────────────────────────────────────────────
  {
    slug: "whiskey-sour",
    name: "Whiskey Sour",
    era: "Various, c. 1862",
    origin: "First documented in Delavan, Wisconsin",
    family: "Sours",
    baseSpirit: "Bourbon Whiskey",
    glass: "Coupe or rocks",
    garnish: "Orange half-wheel, brandied cherry",
    method: "Dry-shaken with egg white, then shaken hard over ice, double-strained",
    image: "https://images.unsplash.com/photo-1542847890-8c4210389b23?w=1200&q=80",
    kicker: "Feature Nº 06 — Bourbon",
    deck: "The American sour in its most democratic form — whiskey, lemon, and sugar, arranged in the order that matters.",
    tagline: "The bartender's calibration. The drinker's measure.",
    history: [
      "The Whiskey Sour is, in a meaningful sense, where American bartending begins. Its first recorded recipe appears in Jerry Thomas's 1862 Bartender's Guide, but Thomas was a cataloguer, not an inventor — the drink was older than his ink. The sour formula itself is the founding logic of the craft: spirit, citrus, sweetener. Everything else is variation.",
      "For most of the twentieth century the Whiskey Sour became synonymous with its worst version: bottled sour mix dispensed from a gun, topped with a fluorescent cherry, served without thought in an airport bar. The drink was technically present. The point was entirely absent. A generation of drinkers grew up believing the Whiskey Sour was something to be ashamed of ordering.",
      "The modern revival of the late 1990s and early 2000s restored the drink to its fundamentals — and added a single question that became the era's defining choice: egg white, or no egg white. With the white, the drink silkens into something almost luxurious, the foam holding the garnish, the texture turning velvet. Without, it is a purer sour — brighter, more brittle, more honest about what it is.",
    ],
    tasting:
      "A bourbon Whiskey Sour opens on the grain sweetness of the spirit — caramel, vanilla, the faintest char — cut almost immediately by the brightness of fresh lemon. Sugar threads through the middle, rounding the citrus without softening it into submission. With egg white, the finish turns pillowy, the foam carrying residual sweetness; without, it closes clean and dry, ending on dried citrus and warm oak.",
    bartenderNote: {
      quote:
        "Dry-shake the egg white first, alone, thirty seconds — no ice, just the tin and the white and the friction. Then add the bourbon and citrus and ice and shake again, hard, for ten. The foam that results will hold its structure for the entire drink. Skip the dry-shake and you get bubbles. There is a difference.",
      attribution: "— Toby Maloney, The Violet Hour, Chicago",
    },
    technique: [
      {
        title: "Choose your texture",
        body: "Egg white transforms the Whiskey Sour from a sharp sour into something richer and more structured. Without it, the drink is brasher, more acidic, more honest. Neither is wrong. Commit to your decision.",
      },
      {
        title: "Build and dry-shake",
        body: "Combine 60 ml bourbon, 22 ml fresh lemon juice, and 15 ml simple syrup in a shaker. If using egg white, add 30 ml and dry-shake vigorously for thirty seconds with no ice. The friction emulsifies the protein.",
      },
      {
        title: "Wet-shake and strain",
        body: "Add ice and shake for ten seconds — hard, with intent. Double-strain through a fine mesh into a chilled coupe. The foam, if you used egg white, should arrive in a smooth white cap that holds its shape. Garnish simply.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Bourbon Whiskey", note: "Bonded preferred — Buffalo Trace, Wild Turkey 101" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1 white sugar and water" },
      { measure: "30 ml", name: "Egg white", note: "Optional — changes the texture entirely" },
      { measure: "1", name: "Orange half-wheel", note: "Plus a brandied cherry, never maraschino" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.2 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.82 },
      { axis: "Herbal", value: 0.25 },
      { axis: "Citrus", value: 0.9 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Whiskey Sour is the cocktail that traveled farthest from its origins — from hotel bar staple to dive bar humiliation to craft cocktail canon and back again. It is the drink that absorbed whatever era it found itself in and reflected it faithfully. That is its genius, and its trap: a Whiskey Sour tells you exactly what kind of bar you are in.",
    related: ["daiquiri", "new-york-sour", "sidecar"],
  },
  {
    slug: "pisco-sour",
    name: "Pisco Sour",
    era: "Lima, c. 1920",
    origin: "Morris Bar, Lima, Peru",
    family: "Sours",
    baseSpirit: "Peruvian Pisco",
    glass: "Chilled coupe",
    garnish: "Three drops of Angostura bitters, floated on the foam",
    method: "Shaken vigorously with egg white, double-strained",
    image: "https://images.unsplash.com/photo-1663908672815-fd62829ad3f7?w=1200&q=80",
    kicker: "Feature Nº 07 — Pisco",
    deck: "A drink that belongs to two nations and neither will yield it. South America's most argued-over glass of foam.",
    tagline: "One brandy, one border, one unresolved argument.",
    history: [
      "The Pisco Sour occupies a contested geography between Peru and Chile — each nation claims the drink as a matter of cultural patrimony, and neither has entirely forgiven the other for the argument. The more credible origin places it in Lima in the early 1920s, at the Morris Bar run by an American named Victor Morris. Morris arrived in Peru after a mining venture failed, opened a bar on Calle Boza, and began adapting the sour template to the local brandy.",
      "Pisco itself is ancient — a grape brandy distilled in the arid coastal valleys of Peru and Chile since the sixteenth century, when Spanish colonizers planted mission grapes and needed something to do with them. The spirit's name derives from the Quechua word for bird, or perhaps from the port city of Pisco on the Peruvian coast, depending on who is telling the story and which country they are from.",
      "The Pisco Sour's signature is its cap: a pillow of raw egg white, stiff from hard shaking, dotted at the last moment with three drops of Angostura bitters in a pattern that has become its own ritual. In both Lima and Santiago, the drink is consumed before meals, before conversations, before most things worth beginning — a declaration, through foam and citrus, that proceedings may now commence.",
    ],
    tasting:
      "The Pisco Sour opens with a floral brightness unlike any other sour — the grape character of the brandy rising through fresh lime and sugar in a way that is soft rather than aggressive. The egg white cap smooths the entry into something almost airy. Mid-palate the pisco deepens, faintly herbaceous. The Angostura bitters on the foam arrive last, a spiced counterpoint to the citrus, and linger.",
    bartenderNote: {
      quote:
        "Use Quebranta pisco for the body — it is the most structured, most honest grape for this drink. Dry-shake the egg white first. Shake the assembled cocktail hard, fifteen seconds. Double-strain, then float the bitters drops from a dasher — three, evenly spaced. Do not stir them in. The bitters are there to scent the first sip.",
      attribution: "— Máximo Cabrera, Isolina, Lima",
    },
    technique: [
      {
        title: "Choose the pisco",
        body: "Quebranta is the traditional choice — full-bodied, stone-fruit driven, with the structure to hold the egg white and lime. Italia piscos are more floral and work in a different register. The choice shapes the entire drink.",
      },
      {
        title: "Dry-shake, then wet-shake",
        body: "Combine 60 ml pisco, 22 ml fresh lime juice, 15 ml simple syrup, and 30 ml egg white in a shaker. Dry-shake without ice for thirty seconds. Add ice. Shake vigorously for twelve seconds. Double-strain into a chilled coupe.",
      },
      {
        title: "Bitters placement",
        body: "Using a dasher bottle or dropper, place three drops of Angostura bitters on the foam in a row or triangle. Do not disturb them. They will sit on the surface, scenting the nose on approach, mixing only with the first sip.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Pisco", note: "Quebranta varietal, Peruvian — Barsol, Porton, or La Diablada" },
      { measure: "22 ml", name: "Fresh lime juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1 white sugar and water" },
      { measure: "30 ml", name: "Egg white", note: "Essential — the foam is the drink's identity" },
      { measure: "3 drops", name: "Angostura bitters", note: "Floated on foam, never stirred" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.15 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.78 },
      { axis: "Herbal", value: 0.2 },
      { axis: "Citrus", value: 0.85 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "Peru and Chile each celebrate a national Pisco Sour Day — on different dates, naturally. The drink has become so entangled with questions of identity, sovereignty, and pride that drinking one in certain company is a political act. This is not common for cocktails. The Pisco Sour is common for nothing.",
    related: ["daiquiri", "whiskey-sour", "gimlet"],
  },
  {
    slug: "amaretto-sour",
    name: "Amaretto Sour",
    era: "United States, 1970s",
    origin: "American bar culture — exact origin unrecorded",
    family: "Sours",
    baseSpirit: "Amaretto",
    glass: "Coupe or rocks",
    garnish: "Brandied cherry, orange half-wheel",
    method: "Shaken with egg white and bourbon backbone, double-strained",
    image: "https://images.unsplash.com/photo-1619503569646-50b2154078ac?w=1200&q=80",
    kicker: "Feature Nº 08 — Amaretto",
    deck: "The most maligned drink in the sour canon — until Jeffrey Morgenthaler gave it a backbone and changed the argument.",
    tagline: "Redeemed by bourbon. Elevated by foam.",
    history: [
      "The Amaretto Sour arrived in the 1970s as part of the era's enthusiasm for sweet liqueurs and bottled sour mix — a combination that produced something soft, cloying, and easily dismissed. For decades it occupied a particular stratum of bar culture: ordered apologetically, served without ceremony, considered a mark against the orderer's credibility as a drinker.",
      "Jeffrey Morgenthaler changed the drink's trajectory in 2012 with a single adjustment: he added cask-proof bourbon. The bourbon gave the drink the structural backbone the amaretto alone could not provide — cutting through the almond sweetness, adding tannin and heat, transforming the flavor from one-dimensional to layered. He also added egg white, which turned the texture from thin and sweet to something altogether more serious.",
      "The rehabilitated Amaretto Sour is now a staple of bars that take the classics seriously — proof that no drink is beneath redemption if the technique is right. Morgenthaler's formulation is precise and non-negotiable: the ratio of amaretto to bourbon, the lemon to balance both, the egg white to unite the whole. The 1970s version and the modern version share only a name.",
    ],
    tasting:
      "The Morgenthaler Amaretto Sour opens with warm almond sweetness from the liqueur, immediately cut by the tartness of fresh lemon and the heat of cask-proof bourbon. The bourbon's tannin and grain character prevents the drink from collapsing into sweetness. Mid-palate is generous — stone fruit, marzipan — but always held in check. The finish is long, dry, and faintly smoky from the bourbon.",
    bartenderNote: {
      quote:
        "The ratio is everything: 45 ml amaretto, 22 ml bourbon at cask strength, 22 ml lemon, 15 ml simple syrup, 30 ml egg white. The bourbon has to be at proof — don't use something delicate or you'll lose it entirely to the amaretto. The egg white rounds the edges. Without it the drink is sharp where it should be soft.",
      attribution: "— Jeffrey Morgenthaler, Clyde Common, Portland",
    },
    technique: [
      {
        title: "Build with structure in mind",
        body: "The bourbon is not an afterthought — it is load-bearing. Choose something at 50% ABV or higher. Combine 45 ml amaretto, 22 ml cask-strength bourbon, 22 ml fresh lemon juice, and 15 ml simple syrup with 30 ml egg white.",
      },
      {
        title: "Dry-shake the white",
        body: "Dry-shake without ice for thirty seconds. The egg white needs friction to emulsify. When the tin feels warm from the effort, you are ready for ice.",
      },
      {
        title: "Wet-shake and strain",
        body: "Add ice. Shake for ten seconds. Double-strain into a chilled coupe. The foam should be dense and stable, not airy bubbles that dissolve on contact. Garnish with a brandied cherry nested in the foam.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "Amaretto", note: "Disaronno or Lazzaroni" },
      { measure: "22 ml", name: "Cask-strength bourbon", note: "50% ABV or above — Wild Turkey 101, Booker's" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1" },
      { measure: "30 ml", name: "Egg white", note: "Essential" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.72 },
      { axis: "Sour", value: 0.7 },
      { axis: "Herbal", value: 0.35 },
      { axis: "Citrus", value: 0.75 },
      { axis: "Strong", value: 0.52 },
    ],
    cultural:
      "The Amaretto Sour's rehabilitation is, in miniature, the story of the entire cocktail renaissance — the recognition that drinks dismissed as unsophisticated are often simply poorly made, and that the problem is technique, not concept. The drink did not change. The bar changed around it.",
    related: ["whiskey-sour", "gimlet", "sidecar"],
  },
  {
    slug: "new-york-sour",
    name: "New York Sour",
    era: "Chicago, c. 1880s",
    origin: "American hotel bars — the name came later",
    family: "Sours",
    baseSpirit: "Rye or Bourbon Whiskey",
    glass: "Coupe or rocks",
    garnish: "Float of dry red wine",
    method: "Shaken, strained, then a careful float of red wine across the back of a spoon",
    image: "https://images.unsplash.com/photo-1596920720403-76eef4bf77a2?w=1200&q=80",
    kicker: "Feature Nº 09 — Bourbon",
    deck: "A Whiskey Sour in formal dress — the red wine float turns a familiar drink into something unmistakably dramatic.",
    tagline: "Blood-red at the surface. Bright and sour underneath.",
    history: [
      "The New York Sour is misnamed, which is appropriate — cocktail history is full of geographical misdirections. The drink appears to have originated in Chicago in the 1880s, where it was known as the Continental Sour or the Southern Whiskey Sour before drifting eastward in reputation and acquiring its more glamorous address. By the time the name New York Sour had fixed itself, the drink had left Chicago entirely.",
      "The float of red wine is the drink's signature and its only meaningful departure from the Whiskey Sour template. A dry red — claret, Malbec, Shiraz — is poured across the back of a bar spoon so that it rests on the surface of the drink without mixing. The effect is visual before it is gustatory: a deep burgundy layer floating over the cloudy yellow of the sour, the two colors meeting in a band that shifts with each rotation of the glass.",
      "When the wine does meet the citrus and whiskey, it contributes tannin, dark fruit, and an earthiness that transforms the finish. The drink becomes, in its final moments, something closer to a wine cocktail than a whiskey drink — a category that did not exist when the New York Sour was invented, and which it occupies without apology.",
    ],
    tasting:
      "The New York Sour opens exactly as a Whiskey Sour does — bright lemon, caramel bourbon, the rounding of sugar. Then the red wine arrives: tannin first, then dark cherry and plum, a dry earthiness that anchors the citrus brightness. The two halves of the drink remain distinct for the first sip, then begin to integrate. The finish is long, slightly grippy from the tannin, and unlike any other sour.",
    bartenderNote: {
      quote:
        "The float is technique, not decoration. Place a bar spoon face-down over the surface of the drink, bowl just touching the liquid, and pour the wine slowly over the back of the spoon. Done correctly, it will sit clean. Done carelessly, it will cloud the drink and the effect is lost. Choose a wine with some tannin — something light and thin won't read against the citrus.",
      attribution: "— Sother Teague, Amor y Amargo, New York",
    },
    technique: [
      {
        title: "Build the sour base",
        body: "Combine 60 ml rye whiskey, 22 ml fresh lemon juice, and 15 ml simple syrup in a shaker with ice. If using egg white, dry-shake first. Shake hard for ten seconds, double-strain into a chilled coupe.",
      },
      {
        title: "Float the wine",
        body: "Hold a bar spoon face-down over the surface of the finished sour, the bowl resting on the liquid's edge. Pour 15 ml of dry red wine slowly over the back of the spoon. It will pool across the surface in a distinct layer.",
      },
      {
        title: "Serve without stirring",
        body: "The layered presentation is the point. Deliver the drink with the two layers intact. The drinker disrupts them with the first sip — the moment the tannin of the wine meets the acid of the citrus is the drink's payoff.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Rye Whiskey", note: "Rittenhouse Bonded or Sazerac Rye" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1" },
      { measure: "15 ml", name: "Dry red wine", note: "Malbec, Shiraz, or Côtes du Rhône — floated" },
      { measure: "30 ml", name: "Egg white", note: "Optional — adds foam that holds the float" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.28 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.8 },
      { axis: "Herbal", value: 0.3 },
      { axis: "Citrus", value: 0.85 },
      { axis: "Strong", value: 0.7 },
    ],
    cultural:
      "The New York Sour is one of the few drinks in the canon whose visual drama is inseparable from its identity. It is a drink made to be seen before it is tasted — the burgundy float, the lemon cloud below, the bar spoon work that produces it. To make it correctly is a small piece of performance. To receive one correctly made is to feel, briefly, that you are in exactly the right place.",
    related: ["whiskey-sour", "sidecar", "boulevardier"],
  },
  {
    slug: "gimlet",
    name: "Gimlet",
    era: "British Navy, c. 1870s",
    origin: "Royal Navy Officers' Mess",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "Lime wheel or expressed lime peel",
    method: "Stirred or shaken — a debate as old as the drink itself",
    image: "https://images.unsplash.com/photo-1643068476553-a64cf7d40948?w=1200&q=80",
    kicker: "Feature Nº 10 — Gin",
    deck: "What the British Empire drank to stay alive. What Raymond Chandler's Philip Marlowe drank because it suited him.",
    tagline: "Half gin, half Rose's, and nothing left to argue about.",
    history: [
      "The Gimlet began as medicine. In the British Navy of the 1870s, sailors were required to consume daily rations of lime juice to prevent scurvy — a disease that had been killing naval crews for centuries. The lime juice was preserved with sugar and sulfur, producing Rose's Lime Cordial, patented in 1867 by Lauchlan Rose. Naval surgeons mixed it with gin to make the requirement less objectionable. The drink was named for the small boring tool — sharp, precise, and efficient.",
      "For generations the Gimlet was inseparable from Rose's Cordial, and any bartender who offered fresh lime instead was making a different drink entirely. Raymond Chandler fixed the recipe in fiction in 1953, when Philip Marlowe ordered one at Victor's with the observation: 'A real Gimlet is half gin and half Rose's lime juice and nothing else.' Chandler meant it as a statement of authenticity. Today it reads as a manifesto for a drink that no longer exists in its original form.",
      "The modern cocktail revival replaced Rose's with fresh lime and simple syrup — producing a drink that is objectively more balanced and alive than the cordial version, and is emphatically not what Chandler had in mind. Both versions are defended with intensity by their respective partisans. The fresh Gimlet and the Rose's Gimlet share a name and a spirit and almost nothing else.",
    ],
    tasting:
      "A fresh Gimlet opens with immediate, high-toned lime — not the sweet-preserved lime of a cordial but the sharp oil of freshly cut citrus, bright and slightly bitter at the edges. The gin's juniper and herbal character unfolds beneath it, adding depth. The sugar rounds the citrus without softening it. The finish is long and dry, ending on juniper and lime zest. Clean and precise, as its namesake tool.",
    bartenderNote: {
      quote:
        "The Rose's Cordial version is historically correct and makes a drink I have no interest in serving. Fresh lime, simple syrup, good gin — chilled until the glass is painful to hold. Stir it, don't shake it. The texture from a proper stir is cleaner than anything a shaker produces for a spirit-forward drink this simple.",
      attribution: "— Meaghan Dorman, Raines Law Room, New York",
    },
    technique: [
      {
        title: "Choose your gin",
        body: "The Gimlet is short on ingredients and long on exposure — the gin is everything. Plymouth works classically. A more botanical gin from the contemporary school will push the herbal notes into the foreground. Choose with intention.",
      },
      {
        title: "Stir with focus",
        body: "Combine 60 ml gin, 22 ml fresh lime juice, and 15 ml simple syrup in a mixing glass over large clear cubes. Stir forty-five rotations — enough to chill and dilute without aerating the drink.",
      },
      {
        title: "Strain and garnish",
        body: "Strain into a coupe chilled to frosting. Express a lime peel over the surface, wipe the rim, and either drop it in or discard. The oil on the surface should be visible — a faint shimmer across the drink.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "London Dry Gin", note: "Plymouth, Tanqueray, or Beefeater" },
      { measure: "22 ml", name: "Fresh lime juice", note: "Squeezed to order — never bottled" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1 — adjust to the lime's tartness" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.12 },
      { axis: "Sweet", value: 0.42 },
      { axis: "Sour", value: 0.75 },
      { axis: "Herbal", value: 0.62 },
      { axis: "Citrus", value: 0.88 },
      { axis: "Strong", value: 0.78 },
    ],
    cultural:
      "The Gimlet belongs to late afternoon and to the light that falls through it — the hour when the work is done and the evening has not yet announced itself. It is the drink of people who know what they want and have stopped apologizing for it. Marlowe drank it in a particular bar with a particular loneliness. That specificity has never entirely faded from the glass.",
    related: ["martini", "bees-knees", "daiquiri"],
  },
  {
    slug: "margarita",
    name: "Margarita",
    era: "Mexico, c. 1938–1948",
    origin: "Disputed — Tijuana, Acapulco, and Texas all stake their claims",
    family: "Sours",
    baseSpirit: "Blanco Tequila",
    glass: "Salt-rimmed rocks or chilled coupe",
    garnish: "Salted rim, lime wheel",
    method: "Shaken hard, strained",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9a3c45b?w=1200&q=80",
    kicker: "Feature Nº 11 — Tequila",
    deck: "The world's most ordered cocktail, by volume — and the one most frequently destroyed by the machines that serve it.",
    tagline: "Agave, lime, and salt. Three things that belong together.",
    history: [
      "The Margarita's origin is one of cocktail history's most contested territories, with at least four credible claimants across two countries and three decades. A socialite named Margarita Sames is said to have improvised it at her Acapulco villa in 1948. A bartender in Tijuana named Carlos Herrera claims to have invented it for a showgirl named Marjorie King in 1938. An Irish bar owner in Galveston, Texas, insists the drink was created there in the 1940s. The drink does not acknowledge any of them.",
      "What is certain is that by the early 1950s, the Margarita had spread from the Mexican-American border culture into mainstream American consciousness — first as a spirit-forward, citrus-bright cocktail made with blanco tequila, fresh lime, and triple sec, and then, catastrophically, as a frozen slush poured from a machine in airport terminals and chain restaurants everywhere. The blender did to the Margarita what Prohibition did to the Old Fashioned: buried the original under decades of inferior execution.",
      "The craft cocktail movement restored the drink to what it had been before the machines: fresh lime, quality tequila, good orange liqueur, a generous salt rim that functions as a seasoning rather than a garnish. The Margarita, properly made, is one of the most precisely balanced drinks in the canon — tequila's vegetal heat, lime's acid brightness, and orange liqueur's sweetness in a triangle that will not shift.",
    ],
    tasting:
      "A properly built Margarita arrives with the high, green note of fresh lime oil off the salt rim — the first sensory contact even before the drink reaches the lips. The tequila's agave character carries through — vegetal, slightly earthy — and the lime's acid cuts through it cleanly. The triple sec provides sweetness without dominating. The finish is dry, slightly salty from the rim, and long — the agave lingering warmly at the back of the palate.",
    bartenderNote: {
      quote:
        "Salt half the rim, not all of it. The drinker should be able to choose how much salt they encounter with each sip. Use a blanco tequila with genuine agave character — something that costs more than €20 — and squeeze the limes yourself. The difference between fresh and bottled lime in a Margarita is the difference between the drink and the idea of the drink.",
      attribution: "— Phil Ward, Death & Co, New York",
    },
    technique: [
      {
        title: "Salt the rim properly",
        body: "Run a cut lime around half the rim of a rocks glass. Press that half into a shallow plate of coarse kosher salt. The salt should adhere to the outside of the glass, not cascade inside it. Fill the glass with large ice cubes.",
      },
      {
        title: "Shake with conviction",
        body: "Combine 60 ml blanco tequila, 22 ml fresh lime juice, and 22 ml triple sec in a shaker with ice. Shake hard for twelve seconds — the Margarita benefits from aeration that a stirred drink does not.",
      },
      {
        title: "Strain and serve",
        body: "Strain into the prepared rocks glass over fresh ice, or into a chilled coupe for a more formal presentation. Garnish with a lime wheel positioned on the unsalted half of the rim.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Blanco Tequila", note: "100% agave — Fortaleza, El Tesoro, Olmeca Altos" },
      { measure: "22 ml", name: "Fresh lime juice", note: "Squeezed to order, non-negotiable" },
      { measure: "22 ml", name: "Triple sec or Cointreau", note: "Cointreau preferred; Grand Marnier for a richer drink" },
      { measure: "1 rim", name: "Coarse kosher salt", note: "Half the rim only" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.08 },
      { axis: "Sweet", value: 0.45 },
      { axis: "Sour", value: 0.85 },
      { axis: "Herbal", value: 0.38 },
      { axis: "Citrus", value: 0.9 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Margarita is the most democratic drink in the world — ordered in every language, on every continent, in bars that range from beachside shacks to starred restaurants. Its ubiquity is both its greatest strength and the reason it is so often made poorly. The gap between the worst Margarita ever poured and the best is larger than in any other classic cocktail. The best justifies the category entirely.",
    related: ["daiquiri", "gimlet", "paloma"],
  },
  {
    slug: "sidecar",
    name: "Sidecar",
    era: "Paris, c. 1920",
    origin: "Harry's New York Bar, Paris — disputed with Buck's Club, London",
    family: "Sours",
    baseSpirit: "Cognac",
    glass: "Sugar-rimmed coupe",
    garnish: "Sugared rim, lemon twist",
    method: "Shaken hard, double-strained",
    image: "https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?w=1200&q=80",
    kicker: "Feature Nº 12 — Cognac",
    deck: "Post-war Paris in a coupe — cognac, citrus, and the particular sweetness of a city that has survived.",
    tagline: "The elegant sour. Paris in the 1920s, distilled.",
    history: [
      "The Sidecar was born in the aftermath of the First World War, in the Paris of the early 1920s, when American expatriates and European survivors of four years of industrialized violence were drinking with a focused urgency that produced, among other things, an extraordinary golden era of cocktail culture. Harry's New York Bar on Rue Daunou was its likely birthplace — though Buck's Club in London and the Paris Ritz have both lodged competing claims that remain unresolved.",
      "The drink emerged at the exact moment when cognac had become newly accessible — the post-war economy had disrupted the cellar-aged luxury market, and spirits that had previously been the province of the wealthy were suddenly available at democratic prices across the city's bars. The Sidecar took cognac and built around it a structure that amplified its warmth without concealing its character: fresh lemon for brightness, triple sec for sweetness, nothing else.",
      "The sugared rim is the drink's distinguishing detail and its most debated element. In its original form the rim was not sugared — the sweetness came entirely from the Cointreau. The sugar arrived later, and is now standard in most versions, functioning as a counterpoint to the citrus and the cognac's natural astringency. Whether to use it remains a matter of conviction at every bar that makes the drink seriously.",
    ],
    tasting:
      "The Sidecar opens with a crystalline sugar-lemon burst from the first touch of the rim, followed immediately by the warmth and complexity of good cognac — dried fruit, oak, a faint rancio note from long barrel aging. The triple sec threads sweetness through the mid-palate without obscuring the cognac's depth. The finish is long and elegant, the citrus and spirit fading together into something that is neither, and both.",
    bartenderNote: {
      quote:
        "Use a VSOP cognac at minimum — this is not a drink that forgives cheap base spirits. Sugar the rim in the style you prefer, but I prefer just a thin coat on the outside edge. The lemon twist at the end is expressed and then deposited on the rim, not in the drink. The drink is already dressed. It does not need decoration inside the glass.",
      attribution: "— Ryan Chetiyawardana, Lyaness, London",
    },
    technique: [
      {
        title: "Prepare the glass",
        body: "Chill a coupe in the freezer. When ready to serve, run a cut lemon around the rim and press it into a shallow plate of fine white sugar. A thin, even coat of sugar on the outside edge of the rim is the goal.",
      },
      {
        title: "Shake the sour",
        body: "Combine 50 ml VSOP cognac, 20 ml Cointreau, and 20 ml fresh lemon juice in a shaker with ice. Shake hard for twelve seconds — the citrus needs agitation to integrate with the spirit.",
      },
      {
        title: "Strain and twist",
        body: "Double-strain into the prepared coupe. Express a wide lemon peel over the surface, wipe the rim, and lay the peel across the edge of the glass. The oils should be visible on the surface of the drink.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Cognac", note: "VSOP minimum — Rémy Martin, Pierre Ferrand, Hine" },
      { measure: "20 ml", name: "Cointreau", note: "Or Grand Marnier for added depth" },
      { measure: "20 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "1 rim", name: "Fine white sugar", note: "Optional — but traditional" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.78 },
      { axis: "Herbal", value: 0.2 },
      { axis: "Citrus", value: 0.88 },
      { axis: "Strong", value: 0.7 },
    ],
    cultural:
      "The Sidecar belongs to a particular kind of evening — a dinner that has gone well, a conversation that has not yet exhausted itself, a room where the lighting is exactly right. It is a drink that requires a good cognac and rewards the investment with a sour that outlasts the meal. Paris in the 1920s invented it and Paris in any decade remains the most natural place to drink one.",
    related: ["daiquiri", "bees-knees", "corpse-reviver-no-2"],
  },
  {
    slug: "bees-knees",
    name: "Bee's Knees",
    era: "United States / Paris, c. 1929",
    origin: "Attributed to Frank Meier, Ritz Bar, Paris",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "None, or a single lemon peel",
    method: "Shaken hard, double-strained",
    image: "https://images.unsplash.com/photo-1665609951801-ff3f25c0f0f1?w=1200&q=80",
    kicker: "Feature Nº 13 — Gin",
    deck: "Prohibition's most elegant solution — honey and lemon arranged to disguise the evidence, and incidentally producing something beautiful.",
    tagline: "Bad gin never tasted this good. Good gin tastes better.",
    history: [
      "The Bee's Knees emerged from Prohibition-era necessity: the gin available in speakeasies and bathtub operations of the 1920s was often unaged, harsh, and difficult to drink unadorned. Bartenders turned to honey and lemon — naturally antimicrobial, strongly aromatic, sweet enough to cover a great deal of unpleasantness. The resulting drink was described as 'the bee's knees,' a slang phrase of the era meaning the pinnacle of something, the very best.",
      "Frank Meier of the Ritz Bar in Paris is the most credible individual origin claim — his 1936 book The Artistry of Mixing Drinks contains a recipe close to the modern version. But the drink's broader provenance is the entire cocktail underground of the 1920s, where necessity produced invention at a rate that peacetime prosperity never could. The Bee's Knees is not one bartender's creation; it is the distillate of an era.",
      "Made with a quality London Dry gin, the honey and lemon that were originally camouflage become something else entirely — a pair of flavors that amplify rather than conceal the spirit beneath them. The honey softens the gin's edges while adding a floral depth that simple syrup cannot provide. The lemon strips away excess sweetness and returns the drink to brightness. The gin, freed from the task of being hidden, can simply be itself.",
    ],
    tasting:
      "The Bee's Knees arrives with a complex sweetness — the honey's floral character preceding the gin's juniper into the nose. The first sip is bright and herbal, the lemon's acid cutting through the honey to reveal the gin beneath. Mid-palate is the warmest moment: juniper, citrus, and honey in a three-way conversation. The finish is long, dry, faintly floral — the honey's aftertaste lingering after the acid has departed.",
    bartenderNote: {
      quote:
        "Make a honey syrup, not just honey — two parts honey to one part hot water, stirred until smooth, bottled, and kept cold. Honey alone will seize in a cold shaker and refuse to incorporate. The syrup integrates seamlessly. Use a gin with genuine botanical complexity — the honey will find and amplify whatever the distiller put there.",
      attribution: "— Ivy Mix, Leyenda, Brooklyn",
    },
    technique: [
      {
        title: "Prepare the honey syrup",
        body: "Combine two parts honey to one part just-boiled water. Stir until fully dissolved and the liquid is uniform. Cool and bottle. Kept refrigerated, it will last two weeks. This is not a shortcut — it is the correct preparation for honey in a cocktail.",
      },
      {
        title: "Build and shake",
        body: "Combine 60 ml London Dry gin, 22 ml fresh lemon juice, and 20 ml honey syrup in a shaker with ice. Shake vigorously for twelve seconds.",
      },
      {
        title: "Double-strain and serve",
        body: "Strain through a fine mesh into a coupe chilled to frosting. No garnish is necessary — the drink's surface should be clear enough to see through. A single expressed lemon peel is acceptable if the occasion calls for it.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "London Dry Gin", note: "Tanqueray, Beefeater, or Sipsmith — botanical weight matters here" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "20 ml", name: "Honey syrup", note: "2:1 honey to water — never raw honey" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.72 },
      { axis: "Herbal", value: 0.55 },
      { axis: "Citrus", value: 0.82 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Bee's Knees carries within it the entire character of the Prohibition era — the ingenuity of necessity, the elegance of constraint, the particular energy of a culture that has been told what it cannot have and proceeds immediately to find a better version of it. Every Bee's Knees is a small act of defiance against the idea that rules produce good outcomes.",
    related: ["gimlet", "corpse-reviver-no-2", "last-word"],
  },
  {
    slug: "clover-club",
    name: "Clover Club",
    era: "Philadelphia, c. 1900",
    origin: "Bellevue Hotel, Philadelphia",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "Three fresh raspberries or a single mint leaf",
    method: "Dry-shaken with egg white, then wet-shaken, double-strained",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80",
    kicker: "Feature Nº 14 — Gin",
    deck: "Philadelphia's pre-Prohibition pink drink — journalists, lawyers, and businessmen who chose to be comfortable about it.",
    tagline: "Raspberry, lemon, foam. The oldest pink drink with a reputation.",
    history: [
      "The Clover Club took its name from the Philadelphia men's literary and social club that met at the Bellevue Hotel at the turn of the twentieth century, whose members included lawyers, journalists, and financiers who found that a drink combining raspberry, gin, lemon, and egg white suited both their refinement and their appetite for a good evening. The club was exclusive and the drink was pink — two qualities that would have generated no contradiction in 1900.",
      "Prohibition killed the Clover Club's era but not its recipe, which survived in cocktail books of the 1930s and 1940s as a relic of pre-Prohibition sophistication. For decades it occupied a strange position in the canon — technically respected, rarely ordered, associated with a formality that felt distant from the bars that might have served it. The drink was there. The occasion for it was not.",
      "The cocktail revival of the 2000s found the Clover Club and took it seriously: the raspberry gave it a natural color and a berry tartness that no artificial syrup could replicate, and the egg white foam elevated the presentation into something self-evidently worth making. Julie Reiner opened a bar named after the drink in Brooklyn in 2008, which removed any remaining doubt about whether the cocktail still had a future.",
    ],
    tasting:
      "The Clover Club opens with a wave of fresh raspberry — bright, slightly tart, the color visible in the foam above the liquid before the first sip. The gin's juniper cuts through the berry almost immediately, and the lemon's acid arrives a half-beat later to round the whole entry. Mid-palate is berry-forward and soft from the egg white. The finish is dry, herbaceous from the gin, with raspberry lingering faintly at the back.",
    bartenderNote: {
      quote:
        "Muddle the raspberries or use a fresh purée — do not use a commercial raspberry syrup, which will make the drink taste like candy rather than fruit. Dry-shake the egg white with the muddled berries first; the berry solids help build the foam's structure. Wet-shake over ice, then double-strain. The foam should be pink from the fruit. If it's white, the berries were not included in the dry-shake.",
      attribution: "— Julie Reiner, Clover Club, Brooklyn",
    },
    technique: [
      {
        title: "Prepare the raspberry",
        body: "Muddle three fresh raspberries in the shaker, or add 15 ml fresh raspberry purée. The color comes from here. Bottled raspberry syrup is too sweet and too flat — the tartness of fresh fruit is structural.",
      },
      {
        title: "Dry-shake with egg white",
        body: "Add 60 ml gin, 20 ml fresh lemon juice, 10 ml simple syrup, and 30 ml egg white to the shaker with the raspberry. Dry-shake without ice for thirty seconds, building the foam and integrating the berry.",
      },
      {
        title: "Wet-shake and strain",
        body: "Add ice and shake for ten seconds. Double-strain through a fine mesh into a chilled coupe. The foam will arrive pink and dense. Three fresh raspberries balanced on the rim complete the presentation.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "London Dry Gin", note: "Tanqueray or Plymouth for botanical balance" },
      { measure: "20 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "10 ml", name: "Simple syrup", note: "1:1" },
      { measure: "15 ml", name: "Fresh raspberry purée", note: "Or 3 fresh raspberries, muddled" },
      { measure: "30 ml", name: "Egg white", note: "Essential for the foam" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.08 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.72 },
      { axis: "Herbal", value: 0.5 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "The Clover Club is a drink that has outlasted every prejudice attached to it — it was once considered too feminine for a particular kind of bar, a concern that has aged extremely poorly. It is now ordered by anyone who recognizes a well-made thing. The foam is pink and the flavor is precise and the men of the Bellevue Hotel would have approved.",
    related: ["bees-knees", "aviation", "gimlet"],
  },
  {
    slug: "aviation",
    name: "Aviation",
    era: "New York, c. 1911",
    origin: "Hotel Wallick, New York — Hugo Ensslin",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "Maraschino cherry — a Luxardo, rinsed",
    method: "Shaken, double-strained",
    image: "https://images.unsplash.com/photo-1724451344589-a8f14f87cde7?w=1200&q=80",
    kicker: "Feature Nº 15 — Gin",
    deck: "Sky-blue and violet and gone from the canon for half a century — brought back by the rediscovery of a single liqueur.",
    tagline: "The drink that required one ingredient to disappear before anyone noticed.",
    history: [
      "Hugo Ensslin published the Aviation in 1916 in his Recipes for Mixed Drinks, a slim bartender's guide from his tenure at the Hotel Wallick in New York. The recipe called for gin, maraschino, lemon juice, and crème de violette — the violet liqueur that gave the drink its characteristic blue-grey hue, the color of early aviation skies and the reason for the name. The drink entered cocktail history and then, almost immediately, exited it.",
      "The disappearance had a single cause: crème de violette was largely unavailable in the American market for most of the twentieth century. When Harry Craddock included the Aviation in the 1930 Savoy Cocktail Book, he omitted the violette entirely, producing a recipe that was technically an Aviation but was missing the ingredient that made it one. For decades, bartenders who made the drink made Craddock's version — competent, but colorless in every sense.",
      "The Austrian firm Rothman & Winter reintroduced crème de violette to the American market in 2007. Within a year, the Aviation had reappeared on menus across the country, made in Ensslin's original formulation, violet and aromatic and historically complete. The drink's resurrection is one of the cocktail revival's cleanest stories: the right ingredient returned, the recipe was restored, and the glass turned the color it had always been meant to be.",
    ],
    tasting:
      "The Aviation's violet color is the first impression — pale blue-grey in the glass, the crème de violette tinting the gin's natural clarity. The nose is floral and herbal, the violette's perfume lifting above the juniper. The first sip is tart from the lemon, sweet from the maraschino, and then the violet character arrives mid-palate — a powdery, perfumed depth unlike any other ingredient in the cocktail canon. The finish is dry and long, the gin and maraschino fading together.",
    bartenderNote: {
      quote:
        "Use less crème de violette than you think you should — 7 ml is sufficient to color and perfume the drink without overwhelming it. The maraschino is also sweet; the whole drink is walking a line between floral and cloying, and lemon is the only thing keeping it on the right side. Measure precisely. This is not a drink that forgives approximation.",
      attribution: "— H. Joseph Ehrmann, Elixir, San Francisco",
    },
    technique: [
      {
        title: "Measure carefully",
        body: "The Aviation's balance is precise and unforgiving. Combine 55 ml London Dry gin, 20 ml fresh lemon juice, 15 ml maraschino liqueur, and 7 ml crème de violette in a shaker. These are not approximations.",
      },
      {
        title: "Shake and strain",
        body: "Add ice and shake hard for twelve seconds. Double-strain through a fine mesh into a coupe chilled to frosting. The drink should arrive clear, tinted pale violet-blue.",
      },
      {
        title: "Garnish with intention",
        body: "A Luxardo maraschino cherry — dark, genuine, nothing like the fluorescent maraschino of the supermarket — is placed either in the drink or on the rim. Its deep red against the pale violet of the drink is the complete visual statement.",
      },
    ],
    ingredients: [
      { measure: "55 ml", name: "London Dry Gin", note: "Tanqueray No. Ten or Plymouth — clean, floral gins work best" },
      { measure: "20 ml", name: "Fresh lemon juice", note: "The acid that holds everything in place" },
      { measure: "15 ml", name: "Maraschino liqueur", note: "Luxardo — no substitute" },
      { measure: "7 ml", name: "Crème de violette", note: "Rothman & Winter — measure precisely" },
      { measure: "1", name: "Luxardo maraschino cherry", note: "Rinsed, for garnish" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.7 },
      { axis: "Herbal", value: 0.52 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "The Aviation is one of the few cocktails whose history is contained in a single ingredient — the crème de violette that disappeared and, when it returned, brought the drink back with it. It is a story about how a recipe is only as alive as its components, and about what gets lost when a supply chain breaks down. Every Aviation served since 2007 is a minor act of restoration.",
    related: ["last-word", "corpse-reviver-no-2", "bees-knees"],
  },
  {
    slug: "last-word",
    name: "Last Word",
    era: "Detroit, c. 1920s",
    origin: "Detroit Athletic Club",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "None — or a single Luxardo cherry",
    method: "Equal parts, shaken hard, double-strained",
    image: "https://images.unsplash.com/photo-1607446045875-de57c995726b?w=1200&q=80",
    kicker: "Feature Nº 16 — Gin",
    deck: "Equal parts, forgotten for decades, then resurrected by a bartender in Seattle who changed the entire direction of modern cocktail making.",
    tagline: "Four ingredients. Equal parts. No hierarchy.",
    history: [
      "The Last Word was first recorded at the Detroit Athletic Club sometime in the 1920s, where it was supposedly the signature of a vaudeville performer named Frank Fogarty who drank it before his shows. The drink appeared in Ted Saucier's 1951 book Bottoms Up, vanished into the historical record, and was not made in any bar anyone can remember for the next half century. It is the cocktail that Prohibition-era Detroit inadvertently hid from the world.",
      "The resurrection happened in Seattle in 2004 or 2005 — the accounts differ slightly — when Murray Stenson, bartending at the Zig Zag Café, came across the recipe in Saucier's book and began serving it. Stenson's version was faithful to the original: equal parts gin, Green Chartreuse, maraschino liqueur, and fresh lime juice. Four equal parts, no adjustments, no apologies for the Chartreuse's intensity. The drink spread through the American bar industry at a speed that cocktail historians still cite as a case study.",
      "The Last Word's influence extended beyond the drink itself. Its equal-parts structure became a template — the Paper Plane, the Naked & Famous, and dozens of other contemporary classics took the Last Word's formula as their starting point and built outward from it. The drink that Prohibition-era Detroit invented became, half a century later, the organizing principle of a generation of bartenders who never knew Detroit was involved.",
    ],
    tasting:
      "The Last Word is green from the Chartreuse — a deep herbal intensity that precedes everything else into the nose. The first sip is complex: the lime's acid and the gin's juniper arrive simultaneously, and then the Chartreuse unfolds — 130 botanical ingredients in a single pour, medicinal and sweet and faintly alarming. The maraschino adds a cherry-almond roundness that prevents the drink from becoming austere. The finish is very long, the Chartreuse lasting well after the lime has faded.",
    bartenderNote: {
      quote:
        "Do not adjust the ratios. The equal-parts formula is not a suggestion — it is the point of the drink. If the Chartreuse feels too intense, use a different drink. If the lime feels too sharp, squeeze your limes closer to service. Every component is load-bearing. Changing one part changes the whole.",
      attribution: "— Murray Stenson, Zig Zag Café, Seattle",
    },
    technique: [
      {
        title: "Measure equal parts",
        body: "22 ml each of London Dry gin, Green Chartreuse, maraschino liqueur, and fresh lime juice. The equal-parts discipline is the drink's architecture — deviation is not improvement.",
      },
      {
        title: "Shake with intent",
        body: "The Chartreuse is thick and aromatic, the lime is bright and sharp. They need significant agitation to integrate. Shake hard for twelve seconds over ice.",
      },
      {
        title: "Double-strain and present",
        body: "Strain through a fine mesh into a coupe chilled to frosting. The drink will arrive pale green, clear, and cold enough to hold its chill for the length of the conversation.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "London Dry Gin", note: "Plymouth or Tanqueray — the gin is load-bearing, choose with care" },
      { measure: "22 ml", name: "Green Chartreuse", note: "The bottle with 130 ingredients and no shortcuts" },
      { measure: "22 ml", name: "Maraschino liqueur", note: "Luxardo" },
      { measure: "22 ml", name: "Fresh lime juice", note: "Squeezed to order" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.38 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.65 },
      { axis: "Herbal", value: 0.88 },
      { axis: "Citrus", value: 0.7 },
      { axis: "Strong", value: 0.75 },
    ],
    cultural:
      "The Last Word is the cocktail that the American cocktail revival used to understand itself — proof that something genuinely good can be lost for decades and found again intact, that recipes do not expire, and that a single bartender serving a drink in Seattle can change what bars across a continent decide to make. It is the drink that demonstrated the stakes of the archive.",
    related: ["paper-plane", "naked-and-famous", "corpse-reviver-no-2"],
  },
  {
    slug: "corpse-reviver-no-2",
    name: "Corpse Reviver No.2",
    era: "London, c. 1930",
    origin: "Savoy Hotel, London — Harry Craddock",
    family: "Sours",
    baseSpirit: "London Dry Gin",
    glass: "Chilled coupe",
    garnish: "None — or a Luxardo cherry placed precisely",
    method: "Shaken hard, double-strained, absinthe rinse in the glass",
    image: "https://images.unsplash.com/photo-1609151354774-8a5f3c2ef34f?w=1200&q=80",
    kicker: "Feature Nº 17 — Gin",
    deck: "Harry Craddock's warning was explicit: four in swift succession will unrevive the corpse again. He knew his audience.",
    tagline: "Medicine for the morning after. Handle with appropriate caution.",
    history: [
      "Harry Craddock published the Corpse Reviver No.2 in The Savoy Cocktail Book in 1930, alongside his famous caution: 'Four of these taken in swift succession will unrevive the corpse again.' The drink belonged to the tradition of the 'hair of the dog' — the belief, ancient and medically dubious, that a drink consumed in the morning might cure the damage inflicted by the drinks consumed the night before. The Savoy's clientele had both the means and the occasions to test this theory frequently.",
      "The formula is an equal-parts construction of gin, Cointreau, Lillet Blanc (then known as Kina Lillet, which was slightly more bitter and medicinal), and fresh lemon juice — the whole thing poured into a coupe that has been rinsed with absinthe and then emptied. The absinthe remains only as a perfume, a ghost of anise that rises from the glass as the drink descends toward it.",
      "Kina Lillet's reformulation in the 1980s into the less bitter Lillet Blanc changed the drink's character slightly. Some modern versions use Cocchi Americano in its place, which is closer in profile to the original Kina Lillet and produces a Corpse Reviver No.2 that Harry Craddock would recognize. Whether the restorative claims have been validated by a century of brunch service is a matter the medical literature has not addressed.",
    ],
    tasting:
      "The absinthe rinse arrives before the liquid — a cold anise perfume from the chilled, emptied glass that primes the nose for what follows. The drink itself opens with Cointreau sweetness and lemon brightness, then the gin and Lillet integrate: the bitter gentian of the Lillet meeting the juniper of the gin in a mid-palate that is complex without being heavy. The finish is long and aromatic, the absinthe ghost returning at the end.",
    bartenderNote: {
      quote:
        "Use Cocchi Americano instead of Lillet Blanc — it is closer to the original Kina Lillet in bitterness and complexity, and the drink needs that edge to hold together. Rinse the coupe with absinthe, swirl to coat every surface, dump it out. The glass should be fragrant, not wet. The absinthe in the glass and the absinthe in the finished drink are two different experiences; you want the ghost, not the presence.",
      attribution: "— Jared Brown, Sipsmith, London",
    },
    technique: [
      {
        title: "Rinse the glass",
        body: "Add 5 ml absinthe to a chilled coupe. Swirl to coat the entire interior surface. Discard the excess. The glass should retain only the fragrance of the absinthe — not a pool of it.",
      },
      {
        title: "Build the cocktail",
        body: "Combine 22 ml London Dry gin, 22 ml Cointreau, 22 ml Cocchi Americano (or Lillet Blanc), and 22 ml fresh lemon juice in a shaker with ice. Shake vigorously for twelve seconds.",
      },
      {
        title: "Strain and deliver",
        body: "Double-strain into the absinthe-rinsed coupe. The drink should arrive ice-cold and clear, with the absinthe's anise perfume rising from the glass. Serve immediately — this is not a drink that improves with waiting.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "London Dry Gin", note: "Tanqueray or Beefeater" },
      { measure: "22 ml", name: "Cointreau" },
      { measure: "22 ml", name: "Cocchi Americano", note: "Or Lillet Blanc — Cocchi is closer to the original Kina Lillet" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "5 ml", name: "Absinthe", note: "For the rinse — Vieux Pontarlier or Pernod" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.3 },
      { axis: "Sweet", value: 0.45 },
      { axis: "Sour", value: 0.72 },
      { axis: "Herbal", value: 0.65 },
      { axis: "Citrus", value: 0.78 },
      { axis: "Strong", value: 0.7 },
    ],
    cultural:
      "The Corpse Reviver No.2 is the cocktail canon's most honest product — a drink whose stated purpose is damage repair, whose author acknowledged the drink's own danger in the same sentence as its recipe, and whose four-ingredient formula has survived a century of brunch without modification. It is named for what you are when you need it and what you become when it works.",
    related: ["last-word", "bees-knees", "sidecar"],
  },

  // ─── Stirred & Spirituous ─────────────────────────────────────────────────
  {
    slug: "manhattan",
    name: "Manhattan",
    era: "New York, c. 1874",
    origin: "Manhattan Club, New York — origin disputed",
    family: "Stirred & Spirituous",
    baseSpirit: "Rye or Bourbon Whiskey",
    glass: "Chilled coupe or Nick & Nora",
    garnish: "Brandied cherry — never maraschino",
    method: "Stirred in a mixing glass, strained",
    image: "https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=1200&q=80",
    kicker: "Feature Nº 18 — Rye",
    deck: "The whiskey cocktail against which all whiskey cocktails are measured. Rye, vermouth, and bitters — the original argument about ratios.",
    tagline: "Rye and vermouth in their ideal proportion. Every other version is an opinion.",
    history: [
      "The Manhattan's most famous origin story involves a banquet thrown at the Manhattan Club in 1874 for the newly elected governor of New York, organized by Lady Randolph Churchill, who had arrived in the city from London. Her bartender supposedly invented the drink for the occasion. This story is almost certainly false — Lady Churchill was in England that evening, her son Winston would not be born for two more weeks, and the Manhattan Club's own records contradict the account. The drink did emerge from New York in the 1870s, and everything else is myth.",
      "What is historically certain is that by the 1880s the Manhattan was already a staple of American bar culture, appearing in guides and manuals as though it had always existed. The rye-versus-bourbon debate is as old as the drink itself: rye's spice and dryness were the original foundation, but bourbon's sweetness and the shifting grain markets of the twentieth century introduced the softer spirit as an acceptable and eventually dominant alternative. Both versions are the Manhattan. Neither is wrong.",
      "The Manhattan's relationship to the Old Fashioned is that of a next generation: the sweet vermouth replaces the sugar and water, adding complexity and vinous depth where the Old Fashioned has weight and simplicity. The Manhattan dresses up. The Old Fashioned stays home. They share the same whiskey and the same bitters, and they are as different as two drinks made from the same ingredients can be.",
    ],
    tasting:
      "A Manhattan built on rye opens with spice — black pepper and grain — softened almost immediately by the sweet vermouth's dried fruit and herbal warmth. The Angostura bitters thread a dark, aromatic complexity through everything: clove, allspice, a faint baking-spice note. The finish is long and warm, the rye and vermouth fading together, the bitters lingering. It is a drink that gets better as it warms slightly in the hand.",
    bartenderNote: {
      quote:
        "Use a 2:1 ratio — 60 ml rye to 30 ml vermouth — and do not let anyone tell you to go drier than that. The vermouth is not a modifier; it is half the drink. Stir for forty-five seconds over large, clear ice. The Manhattan should be cold enough to see your breath. The cherry is a Luxardo, rinsed in warm water, placed at the bottom of the glass before the pour.",
      attribution: "— Dale DeGroff, Rainbow Room, New York",
    },
    technique: [
      {
        title: "Choose the whiskey and the vermouth",
        body: "The Manhattan is a two-spirit drink — the vermouth is not decoration. Choose a rye with genuine spice (Rittenhouse Bonded, Sazerac Rye) and a sweet vermouth with real complexity (Carpano Antica, Cocchi di Torino). Poor vermouth produces a poor Manhattan regardless of the whiskey.",
      },
      {
        title: "Stir with patience",
        body: "Combine 60 ml rye whiskey, 30 ml sweet vermouth, and two dashes of Angostura bitters in a chilled mixing glass over large clear cubes. Stir for forty-five seconds. Count if you must. The dilution and temperature are the technique.",
      },
      {
        title: "Strain and garnish",
        body: "Julep-strain into a coupe or Nick & Nora chilled to frosting. The Luxardo cherry goes in first — it should be at the bottom when the drink arrives, visible through the amber liquid above it.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Rye Whiskey", note: "Rittenhouse Bonded or Sazerac Rye — bourbon as an alternative" },
      { measure: "30 ml", name: "Sweet Vermouth", note: "Carpano Antica Formula or Cocchi di Torino" },
      { measure: "2 dashes", name: "Angostura bitters", note: "Never omit" },
      { measure: "1", name: "Luxardo maraschino cherry", note: "Rinsed — placed in the glass before the pour" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.42 },
      { axis: "Sweet", value: 0.52 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.55 },
      { axis: "Citrus", value: 0.2 },
      { axis: "Strong", value: 0.92 },
    ],
    cultural:
      "The Manhattan is the drink of the city that named it — ambitious, a little aggressive, dressed for an occasion that may or may not require it. It belongs to a particular kind of New York evening: long, expensive, conducted in a room with low ceilings and good ice. It is not a casual drink. It expects to be taken seriously, and rewards those who do.",
    related: ["old-fashioned", "sazerac", "vieux-carre"],
  },
  {
    slug: "vieux-carre",
    name: "Vieux Carré",
    era: "New Orleans, 1937",
    origin: "Hotel Monteleone, New Orleans — Walter Bergeron",
    family: "Stirred & Spirituous",
    baseSpirit: "Rye Whiskey and Cognac",
    glass: "Rocks, over a single large cube",
    garnish: "Lemon twist or brandied cherry",
    method: "Stirred in a mixing glass, strained over a large cube",
    image: "https://images.unsplash.com/photo-1681640772333-88422bbb3ae9?w=1200&q=80",
    kicker: "Feature Nº 19 — Cognac",
    deck: "New Orleans in a glass — French cognac and American rye, stirred together in the city that has always belonged to both.",
    tagline: "Two spirits, one city, the carousel still turning.",
    history: [
      "Walter Bergeron, head bartender of the Hotel Monteleone's Carousel Bar in New Orleans, created the Vieux Carré in 1937. The name means Old Square — the French Quarter, the neighbourhood that surrounds the hotel, the oldest continuously occupied European settlement in the Mississippi Valley. Bergeron took the French-American character of the city and built it into a drink: cognac for the French colonial inheritance, rye whiskey for the American century that had followed, sweet vermouth and Bénédictine for the European herbalism that connected them, and two kinds of bitters for New Orleans itself.",
      "The Carousel Bar, where the drink was born, rotates slowly — a full revolution every fifteen minutes, the barstools completing their circuit while the bartenders remain stationary behind the bar. It has been revolving since 1949, interrupted only by Hurricane Katrina in 2005, and the Vieux Carré has been the house drink for all of that time. The drink and the bar have grown into each other over eight decades until it is impossible to imagine one without the other.",
      "The Vieux Carré sits at a crossroads in cocktail taxonomy — it is simultaneously a Manhattan variant, a Sazerac relative, and a drink with no clean precedent. The cognac and rye co-exist rather than one dominating the other, the Bénédictine adds a honey-herbal sweetness that belongs to neither the French nor the American tradition alone, and the double bitters give the finish a complexity that most stirred drinks achieve with a single aromatic. It is the most architecturally interesting stirred cocktail in the American canon.",
    ],
    tasting:
      "The Vieux Carré opens with the dried-fruit warmth of cognac alongside rye's grain spice — the two spirits arriving together rather than in sequence, neither dominant. The sweet vermouth adds vinous depth beneath them, and the Bénédictine threads honey and herbal sweetness through the mid-palate. The Peychaud's bitters give a soft, anise-touched pink to the finish; the Angostura grounds it with darker spice. The whole drink is more complex than its parts suggest.",
    bartenderNote: {
      quote:
        "Equal parts rye and cognac — 22 ml each. Do not cheat one in favor of the other; the whole premise of the drink is that they share the glass. Use Carpano Antica for the vermouth — it has the body to stand alongside two brown spirits. Stir forty rotations. The Bénédictine is the quiet piece that ties everything together; it disappears when it is right.",
      attribution: "— Chris Hannah, Manolito, New Orleans",
    },
    technique: [
      {
        title: "Build the base",
        body: "Combine 22 ml rye whiskey, 22 ml VSOP cognac, 22 ml sweet vermouth, and 7 ml Bénédictine in a chilled mixing glass. Add one dash of Angostura bitters and one dash of Peychaud's bitters.",
      },
      {
        title: "Stir with care",
        body: "Add large clear cubes and stir for forty rotations — the drink needs significant chilling to integrate the two base spirits, which behave differently under dilution. The result should be seamlessly smooth.",
      },
      {
        title: "Strain and serve",
        body: "Strain over a single large cube in a rocks glass. The cube should be large enough to last the drink's duration — the Vieux Carré improves slightly as it opens with dilution. Express a lemon peel over the surface and drop it in.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "Rye Whiskey", note: "Sazerac Rye or Rittenhouse Bonded" },
      { measure: "22 ml", name: "VSOP Cognac", note: "Pierre Ferrand or Rémy Martin" },
      { measure: "22 ml", name: "Sweet Vermouth", note: "Carpano Antica Formula" },
      { measure: "7 ml", name: "Bénédictine", note: "The secret hinge — do not increase" },
      { measure: "1 dash", name: "Angostura bitters" },
      { measure: "1 dash", name: "Peychaud's bitters" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.5 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.62 },
      { axis: "Citrus", value: 0.25 },
      { axis: "Strong", value: 0.9 },
    ],
    cultural:
      "The Vieux Carré is the most New Orleans cocktail that exists — not because it is the oldest or the most famous, but because it embodies the city's character most precisely: French and American at once, baroque in its construction, rooted in a specific room in a specific neighbourhood, revolving slowly while the world outside changes. To drink one at the Carousel Bar is to feel the exact weight of eight decades of continuity.",
    related: ["sazerac", "manhattan", "boulevardier"],
  },
  {
    slug: "rob-roy",
    name: "Rob Roy",
    era: "New York, 1894",
    origin: "Waldorf Astoria Hotel, New York",
    family: "Stirred & Spirituous",
    baseSpirit: "Blended Scotch Whisky",
    glass: "Chilled coupe or Nick & Nora",
    garnish: "Maraschino cherry or lemon twist",
    method: "Stirred, strained",
    image: "https://images.unsplash.com/photo-1582056509381-33e11b85733f?w=1200&q=80",
    kicker: "Feature Nº 20 — Scotch",
    deck: "The Manhattan crossed the Atlantic, acquired a Scottish accent, and has been making the argument for Scotch in cocktails ever since.",
    tagline: "Scotland's answer to Manhattan. The argument has never been settled.",
    history: [
      "The Rob Roy was created at the Waldorf Astoria in 1894, named to mark the premiere of a Broadway operetta about the Scottish outlaw Rob Roy MacGregor — a folk hero of the Scottish Highlands whose real name was Robert Roy MacGregor, and whose legend had arrived in New York with the romanticized energy that the nineteenth century applied to any figure sufficiently distant and sufficiently dangerous. The drink is a Manhattan made with Scotch whisky instead of rye, a substitution that changes the character of the drink more than the formula suggests.",
      "Scotch brings to the Manhattan template qualities that rye and bourbon cannot: the maltiness of barley, the complexity introduced by the Scottish distillation tradition, and — in blended expressions — a certain softness and integration that American whiskeys achieve only with age. The sweet vermouth that amplifies rye's spice works differently against Scotch's round malt character, producing a drink that is less assertive and more reflective than the Manhattan it resembles.",
      "The Rob Roy exists in three classic variants, each defined by the vermouth: sweet, dry, or equal parts of both, which is known as a Perfect Rob Roy. The sweet version is the most commonly ordered. The Perfect version is, to many bartenders, the most interesting — the dry vermouth's herbal astringency sitting alongside the sweet vermouth's fruit, both of them against the malt of the Scotch, in a balance that the Manhattan, with its single vermouth, cannot quite achieve.",
    ],
    tasting:
      "The Rob Roy opens with Scotch's soft malt character — rounded, faintly smoky if using a peated blend, with the dried fruit and honey notes that good Scotch carries from the barrel. The sweet vermouth adds a vinous richness beneath the malt, deepening without complicating. The bitters tie everything together with a dark spice that the Scotch does not provide on its own. The finish is long and warming, distinctly Scottish — more contemplative than the Manhattan's assertion.",
    bartenderNote: {
      quote:
        "Use a quality blended Scotch — Monkey Shoulder has the right malt character and the price point for cocktail use. Avoid heavily peated expressions unless you are deliberately seeking that character; the smoke will overpower the vermouth. I prefer a slightly drier Rob Roy, going 2:1 instead of the strict Manhattan ratio — the Scotch is softer and can handle a little less vermouth.",
      attribution: "— Simon Difford, Difford's Guide, London",
    },
    technique: [
      {
        title: "Select the Scotch deliberately",
        body: "The Scotch defines this drink. A quality blended Scotch — Monkey Shoulder, Chivas 12, Famous Grouse — will give you malt, dried fruit, and subtle smoke. Avoid heavily peated expressions unless you want the smoke to dominate.",
      },
      {
        title: "Stir long",
        body: "Combine 60 ml blended Scotch, 30 ml sweet vermouth, and two dashes of Angostura bitters in a mixing glass over large cubes. Stir forty-five seconds. The Scotch's softness benefits from thorough chilling.",
      },
      {
        title: "Strain and garnish",
        body: "Strain into a chilled coupe. A Luxardo cherry dropped in provides sweetness and visual anchor. A lemon twist expressed over the surface adds brightness if the drink feels too heavy.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Blended Scotch Whisky", note: "Monkey Shoulder, Chivas 12, or Compass Box" },
      { measure: "30 ml", name: "Sweet Vermouth", note: "Martini Rosso or Carpano Antica" },
      { measure: "2 dashes", name: "Angostura bitters" },
      { measure: "1", name: "Luxardo cherry", note: "Or lemon twist" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.4 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.5 },
      { axis: "Citrus", value: 0.2 },
      { axis: "Strong", value: 0.9 },
    ],
    cultural:
      "The Rob Roy is the drink that makes the case for Scotch in cocktails every time it is made properly — which is to say that it is also the drink that fails to make that case every time it is made poorly, with cheap whisky and stale vermouth from a bottle opened three months ago. It is a drink whose persuasiveness is entirely contingent on the quality of its ingredients.",
    related: ["manhattan", "old-fashioned", "toronto"],
  },
  {
    slug: "boulevardier",
    name: "Boulevardier",
    era: "Paris, 1927",
    origin: "Harry's New York Bar, Paris — Erskine Gwynne",
    family: "Stirred & Spirituous",
    baseSpirit: "Bourbon Whiskey",
    glass: "Rocks over a single large cube, or chilled coupe",
    garnish: "Orange peel, expressed",
    method: "Stirred, strained",
    image: "https://images.unsplash.com/photo-1543536448-1e76fc2795bf?w=1200&q=80",
    kicker: "Feature Nº 21 — Bourbon",
    deck: "The Negroni's American cousin — Campari and sweet vermouth, but bourbon where the gin was, and a different kind of evening entirely.",
    tagline: "What an American in Paris drinks when the gin runs out.",
    history: [
      "Erskine Gwynne was an American expatriate living in Paris in the 1920s, heir to a railway fortune, founder of a small English-language literary magazine called The Boulevardier, and a regular at Harry's New York Bar on Rue Daunou. The drink he asked Harry MacElhone to make for him was a Negroni with bourbon — the gin replaced by whiskey, the formula otherwise unchanged. Harry wrote it down in Barflies and Cocktails in 1927, attributed it to Gwynne, and named it after the magazine.",
      "For decades the Boulevardier occupied the Negroni's shadow, known to cocktail historians but rarely ordered. The modern cocktail revival changed this equation: as bartenders and drinkers became sophisticated enough to understand the distinction between the drinks, the Boulevardier's identity came into focus. The bourbon does not merely replace the gin — it transforms the drink. The Negroni's bitter, medicinal sharpness becomes something richer and more enveloping, the bourbon's sweetness softening Campari's edge and the vermouth's acidity.",
      "The question of whether to serve the Boulevardier on ice or up is more significant than with the Negroni: the bourbon's warmth and weight behave differently in each presentation. On ice, it is rounder, slower, more forgiving. Up in a coupe, it is more formal and more direct. The drink accommodates both, which is more than most cocktails can claim.",
    ],
    tasting:
      "The Boulevardier opens with Campari's bitter orange-peel intensity, but the bourbon is immediately present beneath it — its caramel and vanilla rounding the bitterness into something warmer. The sweet vermouth adds dried fruit and an herbal undertone that bridges the two. Mid-palate is richly layered, the three components neither competing nor surrendering. The finish is long and bitter-sweet, the Campari returning to dominate after the bourbon has faded.",
    bartenderNote: {
      quote:
        "I build it over a single large cube in a rocks glass, never in a mixing glass. The dilution happens slowly and changes the drink across its length — it starts bold and tightens as it opens. Use a higher-proof bourbon — something at 50% or above — or the Campari will overwhelm it. The orange peel is expressed hard and discarded. The drink is already complete.",
      attribution: "— Naren Young, Dante, New York",
    },
    technique: [
      {
        title: "Choose the bourbon with care",
        body: "Campari is a dominant presence. The bourbon needs proof and character to hold its ground — Buffalo Trace at a minimum, Four Roses Single Barrel or Wild Turkey 101 for more assertive balance. Delicate bourbons will disappear.",
      },
      {
        title: "Stir or build",
        body: "Combine 45 ml bourbon, 30 ml Campari, and 30 ml sweet vermouth in a mixing glass with ice. Stir for thirty to forty rotations, depending on your preference for dilution. Or build directly over a single large cube in the rocks glass — the choice changes the texture.",
      },
      {
        title: "Finish with the peel",
        body: "Express a wide swath of orange peel over the surface of the drink. The oils should spray visibly. Wipe the rim, then discard the peel — unlike the Negroni, the Boulevardier does not need the peel in the glass.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "Bourbon Whiskey", note: "50% ABV or above — Buffalo Trace, Four Roses, Wild Turkey 101" },
      { measure: "30 ml", name: "Campari" },
      { measure: "30 ml", name: "Sweet Vermouth", note: "Carpano Antica or Cocchi di Torino" },
      { measure: "1 swath", name: "Orange peel", note: "Expressed and discarded" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.8 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.65 },
      { axis: "Citrus", value: 0.5 },
      { axis: "Strong", value: 0.88 },
    ],
    cultural:
      "The Boulevardier is what results when American ambition arrives in a European city and begins adapting its surroundings to its tastes. The bourbon in the Negroni's glass is not a lesser substitution — it is a declaration that American whiskey belongs in this company. Nearly a century later, the argument has been settled. The drink made the case.",
    related: ["negroni", "manhattan", "toronto"],
  },
  {
    slug: "paper-plane",
    name: "Paper Plane",
    era: "New York, 2007",
    origin: "Little Branch, New York — Sam Ross",
    family: "Stirred & Spirituous",
    baseSpirit: "Bourbon Whiskey",
    glass: "Chilled coupe",
    garnish: "None",
    method: "Equal parts, shaken hard, double-strained",
    image: "https://images.unsplash.com/photo-1521483632781-413ac2a35ee6?w=1200&q=80",
    kicker: "Feature Nº 22 — Bourbon",
    deck: "The modern classic that made four equal parts feel inevitable — and launched a generation of bartenders into the same formula.",
    tagline: "Equal parts. No apologies. Named for M.I.A.",
    history: [
      "Sam Ross created the Paper Plane at Little Branch in New York in 2007 or 2008 — the exact year is disputed, the bar is not. The drink was named for an M.I.A. song of the same period, which was playing when the formula clicked into place. The formula was equal parts: bourbon, Aperol, Amaro Nonino, and fresh lemon juice. Four components, none dominant, all equal. The Last Word had established this structural logic earlier; the Paper Plane applied it to a different set of ingredients and produced something new.",
      "The drink's genius is in its apparent improbability. Aperol and Amaro Nonino together should produce something cloyingly sweet or overwhelmingly bitter; the bourbon and lemon juice should compete rather than cooperate. Instead, the four parts find each other: the citrus cuts the sweetness, the bourbon's grain character grounds the amaro's herbal complexity, and the Aperol's bitter orange ties the whole construction together. The equal-parts constraint that seems like a challenge turns out to be the solution.",
      "The Paper Plane has spread through the cocktail world with an efficiency that few modern drinks have matched — it appears on menus in cities that share nothing but an appreciation for a well-made drink. It has inspired iterations, substitutions, and homages. More importantly, it demonstrated that the Last Word's equal-parts template was not a historical curiosity but a living formula that the present tense could inhabit. Every bartender who makes a Paper Plane is, knowingly or not, continuing a conversation that started in Detroit in the 1920s.",
    ],
    tasting:
      "The Paper Plane is orange and aromatic — the Aperol's bitter citrus arriving first on the nose, the bourbon's warmth following. The first sip is bright and tart from the lemon, then the Aperol and amaro unfold in sequence, each contributing a different layer of bitterness and herbal complexity. Mid-palate is where the four elements resolve — sweet, sour, bitter, and warm in equal measure. The finish is long and drying, Nonino's alpine herbal character lasting well after the citrus has departed.",
    bartenderNote: {
      quote:
        "Equal parts is not a suggestion. 22 ml of each: bourbon, Aperol, Amaro Nonino, fresh lemon. The drink is precisely balanced at this ratio and unbalanced at any other. I use a 100-proof bourbon — the proof matters, because the Aperol and Nonino are sweet and the bourbon needs to hold its ground. Shake it hard. Double-strain. It arrives in the glass a beautiful orange.",
      attribution: "— Sam Ross, Attaboy, New York",
    },
    technique: [
      {
        title: "Measure equal parts",
        body: "22 ml each of 100-proof bourbon, Aperol, Amaro Nonino Quintessentia, and fresh lemon juice. The equal measure is structural — the drink is engineered, not assembled.",
      },
      {
        title: "Shake with conviction",
        body: "The four components have very different viscosities and need aggressive agitation to integrate. Shake hard for twelve seconds over ice.",
      },
      {
        title: "Double-strain into a cold coupe",
        body: "Strain through a fine mesh into a coupe chilled to frosting. No garnish — the drink's color, a translucent amber-orange, is decoration enough.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "Bourbon Whiskey", note: "100-proof — Wild Turkey 101, Rittenhouse" },
      { measure: "22 ml", name: "Aperol" },
      { measure: "22 ml", name: "Amaro Nonino Quintessentia" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.5 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.55 },
      { axis: "Herbal", value: 0.72 },
      { axis: "Citrus", value: 0.65 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Paper Plane is the signature drink of the craft cocktail era's confidence — a drink made by a young bartender in 2007 that belongs to the same formal tradition as the Last Word and the Corpse Reviver, and knows it. Named for a pop song. Equal parts. No garnish. The contemporary and the canonical, shaken together.",
    related: ["last-word", "naked-and-famous", "toronto"],
  },
  {
    slug: "toronto",
    name: "Toronto",
    era: "Published 1922, widely served from the 2000s",
    origin: "Documented by Robert Vermeire — Canadian origin implied",
    family: "Stirred & Spirituous",
    baseSpirit: "Rye Whiskey",
    glass: "Chilled coupe",
    garnish: "Orange peel, expressed and discarded",
    method: "Stirred, strained",
    image: "https://images.unsplash.com/photo-1712254247032-2182777f7264?w=1200&q=80",
    kicker: "Feature Nº 23 — Rye",
    deck: "Rye and Fernet-Branca — the Manhattan's strange, darker cousin, named for a city that deserves more credit for its whiskey tradition.",
    tagline: "Fernet in the Manhattan's glass. Canada's quiet contribution.",
    history: [
      "Robert Vermeire included the Toronto in his 1922 Cocktails: How to Mix Them, attributing it to Canadian origins without further detail. The drink resembles a Manhattan with Fernet-Branca substituted for sweet vermouth — an Italian amaro of fierce intensity, made from over forty botanical ingredients including myrrh, saffron, and galangal, with a bitterness that announces itself before the glass reaches the lips. Why a Canadian-origin drink was built around an Italian amaro that was already half a century old is one of cocktail history's unexplained coincidences.",
      "Fernet-Branca occupies a unique position in the cocktail world — it is simultaneously a digestive medicine, a bartender's handshake, and an ingredient that only recently began appearing in cocktail menus rather than merely behind bars as a shot for the staff at the end of the night. In Argentina it is mixed with Coca-Cola and consumed casually. In San Francisco it is the bartender's drink. In the Toronto, it is the organizing principle around which rye whiskey, simple syrup, and bitters assemble.",
      "The Toronto is a drink for people who enjoy the Manhattan but find it insufficiently austere — who want the whiskey's warmth but are willing to pay for it with Fernet's alpine bitterness and medicinal complexity. It is not a forgiving drink. It asks something of the drinker. The Fernet is always present, through the rye and the sugar and the orange peel, until the last moment of the finish.",
    ],
    tasting:
      "The Toronto announces itself with Fernet — the amaro's herbal, mentholated complexity rising from the glass before the first sip. The rye follows it into the palate, its grain spice and warmth providing a counterweight to the Fernet's bitterness. Simple syrup cushions the exchange without making it sweet. The finish is very long and very dry, the Fernet and rye fading together into something that tastes like the inside of an apothecary cabinet and is, somehow, deeply satisfying.",
    bartenderNote: {
      quote:
        "Fernet-Branca is intense — do not exceed 7 ml or it will consume the rye entirely. Use a spicy, high-proof rye: Rittenhouse Bonded works well. The simple syrup is structural, not sweetening — the drink needs it to avoid austerity. Stir long, strain cold, express the orange peel once and throw it away. This drink does not need help.",
      attribution: "— Erick Castro, Polite Provisions, San Diego",
    },
    technique: [
      {
        title: "Measure the Fernet carefully",
        body: "7 ml of Fernet-Branca is the correct dose — enough to define the drink, not enough to eliminate the rye. Combine with 60 ml rye whiskey, 7 ml simple syrup (2:1 rich), and two dashes of Angostura bitters in a mixing glass.",
      },
      {
        title: "Stir long and cold",
        body: "The Toronto benefits from more dilution than the Manhattan — the Fernet's intensity softens slightly as the drink opens. Add large clear cubes and stir for forty-five to fifty seconds.",
      },
      {
        title: "Strain, express, discard",
        body: "Julep-strain into a chilled coupe. Express a wide orange peel over the surface — the oil will cut through the Fernet's herbaceous weight. Discard the peel. The drink is dressed.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Rye Whiskey", note: "Rittenhouse Bonded — proof matters here" },
      { measure: "7 ml", name: "Fernet-Branca", note: "Measure precisely — it is an easy ingredient to overdo" },
      { measure: "7 ml", name: "Rich simple syrup", note: "2:1 sugar to water" },
      { measure: "2 dashes", name: "Angostura bitters" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.58 },
      { axis: "Sweet", value: 0.42 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.88 },
      { axis: "Citrus", value: 0.28 },
      { axis: "Strong", value: 0.88 },
    ],
    cultural:
      "The Toronto is a bartender's drink in the specific sense — it is named for a city not famous for its cocktail culture, made around an Italian amaro that bartenders treat as a professional sacrament, and ordered by people who already know what Fernet-Branca is and are prepared for it. It rewards prior knowledge and punishes assumptions. That is its appeal.",
    related: ["manhattan", "rob-roy", "paper-plane"],
  },
  {
    slug: "black-manhattan",
    name: "Black Manhattan",
    era: "San Francisco, 2005",
    origin: "Bourbon & Branch, San Francisco — Todd Smith",
    family: "Stirred & Spirituous",
    baseSpirit: "Bourbon Whiskey",
    glass: "Chilled coupe or Nick & Nora",
    garnish: "Brandied cherry",
    method: "Stirred, strained",
    image: "https://images.unsplash.com/photo-1693969861611-02f6eff93044?w=1200&q=80",
    kicker: "Feature Nº 24 — Bourbon",
    deck: "The Manhattan with Averna where the vermouth was — a decision that changes the drink's entire center of gravity.",
    tagline: "Darker, more bitter, more Sicilian. The Manhattan grew up.",
    history: [
      "Todd Smith created the Black Manhattan at Bourbon & Branch in San Francisco in 2005, substituting Averna amaro for the Manhattan's sweet vermouth. The reasoning was intuitive: Averna's Sicilian herbal bitterness and caramel sweetness share certain qualities with sweet vermouth while adding a depth that vermouth rarely achieves. The result was a Manhattan that tasted more complex and slightly more austere — blacker in spirit if not always in color.",
      "Averna itself is one of Sicily's oldest amari, produced in Caltanissetta since 1868, when a Benedictine monk gifted the family recipe to Salvatore Averna in gratitude for his support of the monastery. The recipe — herbs, citrus, and caramel from roots and aromatics of the Sicilian countryside — has remained unchanged, and the amaro's character is deeply regional: warm from the island's sun, bitter from its wild herbs, sweet from its ancient relationship with sugar.",
      "The Black Manhattan has become a modern classic in the specific sense that distinguishes modern classics from fashionable drinks: it has been on menus continuously since its creation, is made in cities around the world without reference to its San Francisco origin, and is ordered by people who have never heard of Todd Smith or Bourbon & Branch. That anonymity is the purest definition of a drink that has entered the canon.",
    ],
    tasting:
      "The Black Manhattan opens with bourbon's caramel warmth alongside Averna's herbal richness — the two ambers meeting in the glass and finding each other immediately. The Averna's bitterness is different from vermouth's: darker, more herbal, with a hint of licorice and dried fruit beneath the sweetness. The Angostura bitters deepen the complexity at the back of the palate. The finish is very long, warm, and bitter-sweet — more complex than the Manhattan it resembles.",
    bartenderNote: {
      quote:
        "Use Averna — not a different amaro, Averna. Other amaros will produce a different drink, not a better one. The bourbon should be a high-corn mashbill for sweetness — Maker's Mark or Buffalo Trace — to balance the Averna's intensity. Stir forty rotations, strain cold. The cherry belongs inside the glass, not on the rim.",
      attribution: "— Todd Smith, Bourbon & Branch, San Francisco",
    },
    technique: [
      {
        title: "Build with balance in mind",
        body: "Combine 60 ml bourbon, 30 ml Averna amaro, and two dashes of Angostura bitters in a chilled mixing glass. The ratio is Manhattan-standard; the amaro is load-bearing.",
      },
      {
        title: "Stir cold",
        body: "Add large clear cubes and stir for forty rotations. The Averna is thick and sweet — it needs thorough dilution and chilling to integrate with the bourbon.",
      },
      {
        title: "Strain and garnish",
        body: "Julep-strain into a chilled coupe. Drop a Luxardo cherry into the glass before the pour — it should rest at the bottom, visible through the dark amber of the drink above it.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Bourbon Whiskey", note: "High-corn mashbill — Maker's Mark or Buffalo Trace" },
      { measure: "30 ml", name: "Averna Amaro", note: "Not a substitute — the drink is built around this specific amaro" },
      { measure: "2 dashes", name: "Angostura bitters" },
      { measure: "1", name: "Luxardo cherry", note: "Placed in the glass before the pour" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.58 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.72 },
      { axis: "Citrus", value: 0.18 },
      { axis: "Strong", value: 0.9 },
    ],
    cultural:
      "The Black Manhattan is a drink that arrived with a specific intention — to make the Manhattan more interesting, not differently interesting — and succeeded by replacing a single ingredient. It is proof that the classic cocktail template can accommodate substitution without losing its character, and that the best substitutions are made by people who understand the original deeply enough to know what they are changing and why.",
    related: ["manhattan", "boulevardier", "toronto"],
  },
  {
    slug: "naked-and-famous",
    name: "Naked & Famous",
    era: "New York, 2011",
    origin: "Death & Co, New York — Joaquín Simó",
    family: "Stirred & Spirituous",
    baseSpirit: "Mezcal",
    glass: "Chilled coupe",
    garnish: "None",
    method: "Equal parts, shaken hard, double-strained",
    image: "https://images.unsplash.com/photo-1589749684936-d15b84cfc8d9?w=1200&q=80",
    kicker: "Feature Nº 25 — Mezcal",
    deck: "The Paper Plane's smoky sibling — equal parts, mezcal in the lead, and the Chartreuse closing behind it.",
    tagline: "Smoke, bitter orange, alpine herbs. Equal parts chaos.",
    history: [
      "Joaquín Simó created the Naked & Famous at Death & Co in New York in 2011, consciously applying the Last Word's equal-parts template to a set of ingredients organized around mezcal. The structure is identical to the Paper Plane — four equal parts, none dominant — but the ingredients introduce smoke and a different kind of bitterness. Where the Paper Plane uses bourbon's sweetness as its anchor, the Naked & Famous uses mezcal's agave smoke as its through-line.",
      "The Aperol in both drinks provides the same bitter orange sweetness, but Amaro Nonino in the Paper Plane and Yellow Chartreuse in the Naked & Famous create different herbal registers. Nonino's gentian bitterness works with bourbon's warmth. Chartreuse's 130-botanical complexity works with the smoke of mezcal, the herbaceous character of both spirits amplifying each other rather than competing. The lemon in both drinks performs the same structural function: it prevents the sweetness and the bitterness from collapsing into each other.",
      "The Naked & Famous arrived at a moment when mezcal was transitioning from a curiosity into a bar staple, and it became one of the drinks that accelerated that transition — proof that the spirit could anchor a serious cocktail rather than merely provide novelty smoke. It has been ordered in thousands of bars by people who had never tasted mezcal before, and a number of them found that the smoke suited them. The drink made converts.",
    ],
    tasting:
      "The Naked & Famous opens with mezcal's smoke — vegetal, earthy, the char of the roasted agave — cut almost immediately by the lemon's brightness. Aperol's bitter orange sweetness arrives next, and then the Yellow Chartreuse unfolds in the mid-palate: honey, herbs, the complexity of a liqueur made by monks who take their time. The finish is long and aromatic, the mezcal's smoke returning after the citrus has faded, the Chartreuse's herbs persisting into the quiet.",
    bartenderNote: {
      quote:
        "Use a mezcal with genuine smoke but not overwhelming smoke — something espadín-based, at around 42–45% ABV. Too much smoke and it will consume the Aperol and Chartreuse entirely. Yellow Chartreuse, not Green — the yellow is sweeter and more floral, a better partner for the mezcal's earthiness. Equal parts, every time: 22 ml of each.",
      attribution: "— Joaquín Simó, Pouring Ribbons, New York",
    },
    technique: [
      {
        title: "Measure equal parts",
        body: "22 ml each of mezcal, Aperol, Yellow Chartreuse, and fresh lemon juice. The formula is non-negotiable — the drink is engineered at this ratio.",
      },
      {
        title: "Shake aggressively",
        body: "The four components span the full range of viscosity and aromatic intensity. Shake hard for twelve seconds over ice to force integration.",
      },
      {
        title: "Double-strain and serve",
        body: "Strain through a fine mesh into a coupe chilled to frosting. The drink arrives a luminous amber-orange. No garnish — the mezcal's smoke needs no announcement.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "Mezcal", note: "Espadín-based — Del Maguey Vida, El Silencio" },
      { measure: "22 ml", name: "Aperol" },
      { measure: "22 ml", name: "Yellow Chartreuse", note: "Not Green — the flavour profile is different" },
      { measure: "22 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.5 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.55 },
      { axis: "Herbal", value: 0.72 },
      { axis: "Citrus", value: 0.65 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Naked & Famous is the cocktail that mezcal used to prove it belonged in the same conversation as gin and whiskey. It appeared at the exact moment when American bartenders were beginning to take agave spirits seriously, and its commercial success demonstrated that the conversation was worth having. Death & Co is not the only reason mezcal is on every menu now — but it is one of them.",
    related: ["last-word", "paper-plane", "boulevardier"],
  },

  // ─── Highballs & Fizzes ───────────────────────────────────────────────────
  {
    slug: "moscow-mule",
    name: "Moscow Mule",
    era: "Los Angeles, 1941",
    origin: "Cock 'n' Bull, West Hollywood — John G. Martin and Jack Morgan",
    family: "Highballs & Fizzes",
    baseSpirit: "Vodka",
    glass: "Copper mug",
    garnish: "Lime wheel, crystallized ginger optional",
    method: "Built over crushed ice — vodka, lime, then ginger beer",
    image: "https://images.unsplash.com/photo-1503726800290-d5f1a00e05b0?w=1200&q=80",
    kicker: "Feature Nº 26 — Vodka",
    deck: "A marketing exercise that accidentally produced a great drink — and established vodka as the dominant spirit of the American twentieth century.",
    tagline: "Copper, ginger, lime. The drink that sold America a spirit it hadn't asked for.",
    history: [
      "The Moscow Mule was not so much invented as engineered. In 1941, John G. Martin had recently acquired the American rights to Smirnoff vodka — a spirit that almost no American drank or recognized — and Jack Morgan owned the Cock 'n' Bull in West Hollywood, which was struggling to sell its house-branded ginger beer. A woman named Ozeline Schmidt produced copper mugs she couldn't sell. The three parties met, combined their problems, and produced a drink. It was a collaboration of convenience that became, over the following decade, the vehicle through which vodka achieved its American dominance.",
      "The copper mug was marketing from the beginning — it kept the drink cold and looked distinctive — but it also changed the drink's character. Copper conducts temperature faster than glass, and a properly chilled copper mug delivers the Moscow Mule at a colder temperature than any glass equivalent. The ginger beer's carbonation remains sharper in the cold. The lime's acid interacts with the copper surface in ways that are subtle but real. The mug was a gimmick that turned out to be correct.",
      "The Moscow Mule launched vodka in America with a precision that no advertising campaign could have achieved — the drink was approachable, sessionable, refreshing, and low in the kind of aggressive spirit character that made whiskey and gin feel forbidding to the uninitiated. By 1950, Smirnoff had become one of the best-selling spirits in the United States. The Moscow Mule had done its work. The drink outlasted its commercial purpose.",
    ],
    tasting:
      "The Moscow Mule is cold before it is anything else — the copper mug conducting the chill through the hands before the first sip arrives. The ginger beer's spice is immediate and bright, followed by the lime's acid. The vodka is a presence without a flavor — it provides the alcohol and the dilution and allows the ginger and citrus to be the whole story. The finish is clean, slightly peppery from the ginger, refreshing in the specific way that makes you want another.",
    bartenderNote: {
      quote:
        "Use a quality ginger beer — one with real ginger heat, not just sweetness. The vodka is structural here, not expressive, so spend the money on the ginger beer instead. Crushed ice keeps the drink colder for longer and gives the copper mug its proper weight. Squeeze the lime over the top rather than dropping a wheel in — the fresh oil from the cut edge matters.",
      attribution: "— Tony Abou-Ganim, The Modern Mixologist, Las Vegas",
    },
    technique: [
      {
        title: "Chill the mug",
        body: "Fill a copper mug with crushed ice and let it chill for thirty seconds while you prepare the other components. The mug's thermal conductivity is the point.",
      },
      {
        title: "Build the drink",
        body: "Pour 45 ml vodka over the crushed ice. Squeeze half a lime directly into the mug, dropping the squeezed half in. Top with 120 ml quality ginger beer — one with actual ginger heat, not artificial flavoring.",
      },
      {
        title: "Garnish and serve",
        body: "Add a lime wheel or the spent lime half. A sprig of mint adds a freshness note that complements the ginger. Serve with a short straw — the copper mug is for ceremony, the straw is for drinking.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "Vodka", note: "Clean, neutral — Smirnoff, Ketel One, or Tito's" },
      { measure: "½ lime", name: "Lime juice", note: "Squeezed fresh into the mug" },
      { measure: "120 ml", name: "Ginger beer", note: "Fever-Tree or Bundaberg — real ginger heat required" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.35 },
      { axis: "Sour", value: 0.45 },
      { axis: "Herbal", value: 0.22 },
      { axis: "Citrus", value: 0.52 },
      { axis: "Strong", value: 0.42 },
    ],
    cultural:
      "The Moscow Mule is the drink that made vodka American — and by making vodka American, it changed what Americans drank for the rest of the century. It is a reminder that commercial convenience and genuine pleasure are not mutually exclusive, and that the best marketing produces something that survives the campaign and the marketer and the original customers. The copper mug is still on the shelf. The drink still works.",
    related: ["gin-and-tonic", "dark-and-stormy", "paloma"],
  },
  {
    slug: "cuba-libre",
    name: "Cuba Libre",
    era: "Havana, c. 1900",
    origin: "American army bars, Havana — during the Spanish-American War",
    family: "Highballs & Fizzes",
    baseSpirit: "Aged Cuban Rum",
    glass: "Highball, over ice",
    garnish: "Lime wedge, squeezed and dropped in",
    method: "Built over ice — rum, lime, Coca-Cola",
    image: "https://images.unsplash.com/photo-1598990034692-a57ccb6d03b8?w=1200&q=80",
    kicker: "Feature Nº 27 — Rum",
    deck: "Rum and Coca-Cola, mixed in a country the American military had just liberated — and named for its freedom, with a lime wedge.",
    tagline: "Free Cuba. Two ingredients. One optimism.",
    history: [
      "The Cuba Libre's origin is unusually well-documented for a cocktail. During the Spanish-American War in 1898, American soldiers arrived in Cuba and encountered a newly distributed product from the United States: Coca-Cola. Rum had been Cuba's spirit for centuries. An American soldier mixed the two in a bar in Havana, added a squeeze of lime, and raised the glass with a toast to Cuba's new independence: 'Por Cuba Libre' — Free Cuba. The drink was named for the toast, not the other way around.",
      "Coca-Cola's arrival in Cuba was itself a logistical coincidence — the American military had been importing the soda for its soldiers, and the surplus found its way to civilian bars where it encountered the island's primary spirit. The combination was immediate and obvious: the rum's molasses sweetness and the Coca-Cola's caramel carbonation belong together in a way that feels inevitable rather than invented. The lime completes the drink by providing the acid that the other two components lack.",
      "The Cuba Libre is technically a rum and Coca-Cola — a fact that has made it both universally accessible and, in certain circles, not quite respectable. The distinction between a Cuba Libre and a rum and Coke is the lime: the fresh lime juice and the squeezed wedge dropped into the glass change the drink's character more than the small difference in preparation suggests. A Cuba Libre is made with intention. A rum and Coke is assembled. They share most of the same ingredients.",
    ],
    tasting:
      "The Cuba Libre is caramel and citrus and carbonation — the Coca-Cola's sweetness carrying the rum's molasses warmth, cut at the edges by the lime's bright acid. The aged rum adds a woodiness and depth that the drink's simple construction suggests it should lack. The carbonation keeps everything light. The finish is clean, slightly sweet, the rum and cola lingering together in a combination that tastes inevitable and ancient despite having been invented in 1898.",
    bartenderNote: {
      quote:
        "The lime is the difference between a Cuba Libre and a rum and Coke, and the difference is significant. Squeeze the wedge into the glass before the ice. The juice integrates with the rum before the Coca-Cola arrives and changes the acidity profile of the whole drink. Use an aged rum — Havana Club 3 Años or Ron Zacapa — not a white rum. The age adds depth the Coke needs to work with.",
      attribution: "— Leandro DiMonriva, Coppersea Distilling, New York",
    },
    technique: [
      {
        title: "Build in sequence",
        body: "Fill a highball glass with large ice cubes. Squeeze a lime wedge directly into the glass and drop the squeezed hull in. Add 50 ml aged rum.",
      },
      {
        title: "Add the Coca-Cola",
        body: "Pour 120 ml cold Coca-Cola gently down the inside of the glass — pouring against the glass preserves the carbonation. Do not stir. Do not muddle. Do not overthink.",
      },
      {
        title: "Garnish simply",
        body: "A fresh lime wedge on the rim is sufficient. The drink is honest — it does not benefit from embellishment. The toast is optional but historically correct.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Aged Rum", note: "Havana Club 3 Años, Ron Zacapa, or Diplomatico" },
      { measure: "½ lime", name: "Fresh lime juice", note: "Squeezed into the glass before ice — non-negotiable" },
      { measure: "120 ml", name: "Coca-Cola", note: "Cold, from the bottle — cans lose carbonation faster" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.08 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.32 },
      { axis: "Herbal", value: 0.1 },
      { axis: "Citrus", value: 0.42 },
      { axis: "Strong", value: 0.42 },
    ],
    cultural:
      "The Cuba Libre is the drink of a specific political moment — a toast to independence made with the products of the nation that had just arrived to provide it. The irony deepened over the following century as the relationship between Cuba and the United States grew complicated in every direction. The drink survived the politics, as drinks tend to do, and is consumed today without reference to the history that named it.",
    related: ["dark-and-stormy", "moscow-mule", "rum-punch"],
  },
  {
    slug: "gin-and-tonic",
    name: "Gin & Tonic",
    era: "British India, c. 1850s",
    origin: "British East India Company garrisons, India",
    family: "Highballs & Fizzes",
    baseSpirit: "London Dry Gin",
    glass: "Large balloon glass or highball, over ice",
    garnish: "Lime wedge, or botanicals matching the gin",
    method: "Built over ice — gin first, then tonic poured gently",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80",
    kicker: "Feature Nº 28 — Gin",
    deck: "The British Empire's solution to tropical medicine — quinine dissolved in tonic water, made palatable with gin. The empire dissolved. The drink did not.",
    tagline: "Two ingredients. One empire. Outlasted both.",
    history: [
      "The Gin and Tonic was, initially, a medical protocol. Quinine — extracted from the bark of the South American cinchona tree — was the only effective prophylactic against malaria, which killed British soldiers and administrators in India at catastrophic rates. It was also powerfully bitter and almost impossible to consume alone. The British East India Company began mixing it with sugar, water, and gin to produce something that the troops could drink daily without mutiny. The tonic water was the medicine. The gin was the compliance mechanism.",
      "Tonic water was commercially produced at scale by the Indian and Colonial Quinine Company from the 1870s onward, and the Gin and Tonic became, by the late nineteenth century, inseparable from the image of the British colonial administrator at sundown, glass in hand, watching the light fail over a landscape that was not his own. The drink carried within it the entire weight of empire — its purpose, its pleasures, and its fundamental wrongness — and emerged from that history still refreshing.",
      "The modern craft gin revolution, beginning in the early 2000s, transformed the Gin and Tonic from a simple two-ingredient construct into an arena for expression. Botanical gins with lavender, cucumber, citrus, and tea demanded specific tonics — bitter, light, flavored — and specific garnishes. In Spain, the Gin-Tonic became a cultural institution of its own, served in enormous balloon glasses with elaborate garnish architecture. The drink that began as a dose of medicine had become a vehicle for complexity.",
    ],
    tasting:
      "The Gin and Tonic is cold and effervescent before it is anything else — the carbonation creating a brightness on the palate that the still version of the same ingredients could not achieve. The gin's botanical character expands in the tonic's quinine bitterness, the two interacting to produce a whole greater than either. The lime, squeezed at the rim, provides the acid edge. The finish is dry, clean, herbal, and long — the botanicals and the quinine fading together.",
    bartenderNote: {
      quote:
        "The tonic is half the drink — treat it as such. Fever-Tree Indian Tonic for a classic London Dry; a lighter Mediterranean tonic for more delicate botanicals. Cool the glass first. Add ice, add the gin, pour the tonic slowly against the inside of the glass to preserve carbonation. Do not stir vigorously. The garnish should match the gin — cucumber for something contemporary, lime for something classic.",
      attribution: "— Tristan Stephenson, author of The Curious Bartender, London",
    },
    technique: [
      {
        title: "Choose gin and tonic together",
        body: "A bold, juniper-forward London Dry wants an Indian tonic with weight and bitterness. A lighter, floral gin wants a tonic that complements rather than overwhelms. The match is as important as the ratio.",
      },
      {
        title: "Build properly",
        body: "Fill a chilled balloon glass or highball with large cubes of ice. Add 50 ml gin. Pour 150 ml of quality tonic water slowly against the inside of the glass — the pour angle preserves carbonation that aggressive pouring destroys.",
      },
      {
        title: "Garnish thoughtfully",
        body: "A lime wedge squeezed over the top and dropped in is the classic approach. Cucumber adds a contemporary freshness. Match the garnish to the gin's botanical profile if you know it.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "London Dry Gin", note: "Tanqueray, Beefeater, or a contemporary botanical expression" },
      { measure: "150 ml", name: "Tonic water", note: "Fever-Tree Indian Tonic — the tonic is half the drink" },
      { measure: "1 wedge", name: "Lime", note: "Squeezed and dropped in, or a garnish matched to the gin" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.38 },
      { axis: "Sweet", value: 0.2 },
      { axis: "Sour", value: 0.22 },
      { axis: "Herbal", value: 0.65 },
      { axis: "Citrus", value: 0.52 },
      { axis: "Strong", value: 0.45 },
    ],
    cultural:
      "The Gin and Tonic is the drink of the late afternoon in every country that the British Empire touched and many that it did not. It is served in more languages than any other cocktail, ordered with more confidence by more people who have never thought about what they are drinking. It is, perhaps, the most successfully democratic drink ever invented — a pair of ingredients with such obvious affinity that the combination requires neither instruction nor context.",
    related: ["tom-collins", "french-75", "gimlet"],
  },
  {
    slug: "tom-collins",
    name: "Tom Collins",
    era: "New York, c. 1876",
    origin: "Possibly Jerry Thomas — or a London headwaiter named Collins",
    family: "Highballs & Fizzes",
    baseSpirit: "Old Tom Gin or London Dry Gin",
    glass: "Collins (tall), over ice",
    garnish: "Orange wheel, maraschino cherry",
    method: "Shaken and strained into an ice-filled tall glass, topped with soda",
    image: "https://images.unsplash.com/photo-1530992264410-7096e06ff4d3?w=1200&q=80",
    kicker: "Feature Nº 29 — Gin",
    deck: "Long and cold and honest — the tall gin sour that gave every subsequent highball its grammar.",
    tagline: "The gin sour, lengthened. The afternoon, extended.",
    history: [
      "The Great Tom Collins Hoax of 1874 is one of cocktail history's stranger episodes. A practical joke swept through New York in the spring of that year: people would approach friends and tell them that a man named Tom Collins had been saying unflattering things about them in a nearby bar. The victim would rush to the bar demanding Collins, find no one, and be mocked for their credulity. The joke spread so widely that newspaper columnists wrote about it. The following year, the drink named for this fictitious slanderer appeared in Jerry Thomas's revised Bartender's Guide.",
      "The timing is probably coincidental. The Collins formula — spirit, lemon or lime, sugar, soda — predates the 1874 hoax and likely originates with John Collins, a headwaiter at Limmer's Hotel in London who made a version with genever in the 1860s. When Old Tom Gin replaced the genever, the drink became the Tom Collins to distinguish it from the John Collins. The name carried across from London to New York and fixed itself to the drink with the hoax as an accidental marketing event.",
      "The Tom Collins is the gin highball before there was a category called gin highball — the long drink that established the sour-plus-soda format for a century of subsequent drinks. Its components are architectural: the shaken sour provides the acid structure, the soda provides lift and length, and the ice in the glass maintains the chill across the drink's extended duration. The garnish is decorative but also performative: orange and cherry say something is here, and it is meant to be enjoyed at leisure.",
    ],
    tasting:
      "The Tom Collins is immediately refreshing — cold soda lifting the lemon's brightness into the nose before the drink reaches the lips. The gin's herbal juniper character is present but gentle, extended by the soda into something that works across time rather than in a concentrated moment. The sugar rounds the acid, the soda carries everything. The finish is clean and dry, the gin and lemon fading together. It is a drink built for duration.",
    bartenderNote: {
      quote:
        "Do not skip the shake. Build the sour — gin, lemon, sugar — shake it hard, strain it over fresh ice in a tall glass, and then add the soda. The shake integrates the sugar and acid with the gin and produces a different texture than stirring would. The soda goes in last and is not stirred — once. The bubbles should remain in the glass for the drinker to find.",
      attribution: "— Gary Regan, The Joy of Mixology",
    },
    technique: [
      {
        title: "Shake the sour component",
        body: "Combine 50 ml gin, 25 ml fresh lemon juice, and 15 ml simple syrup in a shaker with ice. Shake for ten seconds. Do not skip this step — the shake builds the foundation.",
      },
      {
        title: "Strain and top",
        body: "Strain the shaken mixture over fresh ice in a tall Collins glass. Top with 60–80 ml of cold soda water, poured gently against the inside of the glass.",
      },
      {
        title: "Garnish for the long form",
        body: "An orange wheel and a maraschino cherry are the traditional garnish — the drinks of leisure deserve ornament. A straw is appropriate. This is not a drink to rush.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "London Dry Gin", note: "Beefeater or Tanqueray — clean, juniper-led" },
      { measure: "25 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1" },
      { measure: "75 ml", name: "Soda water", note: "Added last, over fresh ice, not stirred" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.4 },
      { axis: "Sour", value: 0.58 },
      { axis: "Herbal", value: 0.52 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.45 },
    ],
    cultural:
      "The Tom Collins belongs to the long afternoon — to gardens, to terraces, to the particular pleasure of a tall cold drink that takes more than two minutes to finish. It is a democratic drink in the best sense: accessible to anyone, pleasant in any setting, honest about what it is. The garnish promises more complexity than the drink delivers, which is appropriate. Sometimes the pleasure is in the promise.",
    related: ["gin-and-tonic", "john-collins", "french-75"],
  },
  {
    slug: "john-collins",
    name: "John Collins",
    era: "London, c. 1860s",
    origin: "Limmer's Hotel, London — John Collins, headwaiter",
    family: "Highballs & Fizzes",
    baseSpirit: "Genever or Bourbon Whiskey",
    glass: "Collins (tall), over ice",
    garnish: "Lemon wheel, mint sprig",
    method: "Shaken and strained into ice-filled tall glass, topped with soda",
    image: "https://images.unsplash.com/photo-1513416543495-10c173ed9908?w=1200&q=80",
    kicker: "Feature Nº 30 — Bourbon",
    deck: "The original Collins, named for a headwaiter at Limmer's, London — and the drink that, with bourbon instead of genever, became its own American thing.",
    tagline: "John came first. Tom got the fame. The whiskey version stayed.",
    history: [
      "John Collins was a headwaiter at Limmer's Hotel on Conduit Street in London in the 1860s, and the drink named for him was his creation or his preference — the accounts are ambiguous in the way that most cocktail origin stories are ambiguous. His version used genever, the Dutch gin that was common in Britain before London Dry became dominant, and the drink circulated as the John Collins for several decades before the substitution of Old Tom Gin produced the Tom Collins as a distinct variant.",
      "The American version of the John Collins replaced genever with bourbon or rye whiskey, producing a drink with a different character entirely: the grain sweetness and oak of American whiskey extending into a long, cold, citrus-forward drink with soda. This whiskey Collins found its way into American bar guides and onto American menus where it has remained ever since, served alongside but distinct from the gin version, two drinks that share a formula and disagree about the spirit.",
      "The Collins formula is among the most versatile in the canon: it accepts almost any spirit as its base, the lemon-sugar-soda framework providing a neutral architecture that amplifies rather than competes with whatever is poured into it. A bourbon Collins is warm and grain-sweet. A tequila Collins is vegetal and bright. A mezcal Collins carries smoke into the long afternoon. The formula is generous. It does not judge what you pour into it.",
    ],
    tasting:
      "A bourbon John Collins opens with the familiar warmth of American whiskey extended through lemon and soda into something lighter and more conversational than a neat pour. The grain sweetness of the bourbon softens the lemon's acid, and the soda's carbonation lifts the whole drink into refreshing territory. The finish is clean and faintly oaky from the whiskey, the citrus and soda departing first, the bourbon warmth persisting.",
    bartenderNote: {
      quote:
        "The bourbon John Collins is underrated — the whiskey's sweetness and the lemon's acid are a better match than most people expect. Use a bonded bourbon for the proof and the structure. The genever original, if you can find a quality Dutch genever, is worth making: the malt wine character of genever in a Collins is unlike anything the gin version produces.",
      attribution: "— Dave Wondrich, Imbibe!, New York",
    },
    technique: [
      {
        title: "Shake the spirit and citrus",
        body: "Combine 50 ml bourbon (or genever for the original), 25 ml fresh lemon juice, and 15 ml simple syrup in a shaker with ice. Shake ten seconds.",
      },
      {
        title: "Strain and build",
        body: "Strain over fresh ice in a tall Collins glass. Add 75 ml soda water poured gently to preserve carbonation.",
      },
      {
        title: "Garnish and serve",
        body: "A lemon wheel and a mint sprig. The mint's aroma complements both the lemon and the whiskey in a way that the Tom Collins's orange and cherry do not. Serve with a straw.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Bourbon Whiskey", note: "Or genever for the original — Bols Genever" },
      { measure: "25 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1" },
      { measure: "75 ml", name: "Soda water", note: "Cold, added last" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.42 },
      { axis: "Sour", value: 0.55 },
      { axis: "Herbal", value: 0.38 },
      { axis: "Citrus", value: 0.7 },
      { axis: "Strong", value: 0.48 },
    ],
    cultural:
      "The John Collins is the original of a lineage, which is rarely the thing that gets the credit. Tom Collins has the name recognition; John Collins has the history. This dynamic recurs in cocktail culture with enough frequency to be worth noting: the first version, the headwaiter's version, the genever version, is often the quietest.",
    related: ["tom-collins", "whiskey-sour", "gin-and-tonic"],
  },
  {
    slug: "paloma",
    name: "Paloma",
    era: "Mexico, c. 1950s",
    origin: "Attributed to Don Javier Delgado Corona, La Capilla, Tequila, Jalisco",
    family: "Highballs & Fizzes",
    baseSpirit: "Blanco Tequila",
    glass: "Salted highball, over ice",
    garnish: "Salted rim, lime wedge, grapefruit wheel",
    method: "Built over ice with grapefruit soda or fresh grapefruit and soda",
    image: "https://images.unsplash.com/photo-1570598912132-0ba1dc952b7d?w=1200&q=80",
    kicker: "Feature Nº 31 — Tequila",
    deck: "Mexico's drink — more consumed domestically than the Margarita, lighter and more forgiving, and made for midday.",
    tagline: "Grapefruit and tequila. The drink Mexico kept for itself.",
    history: [
      "Don Javier Delgado Corona, the patriarch of La Capilla bar in the town of Tequila, Jalisco, is the most cited originator of the Paloma — a small-glass creation attributed to him during the 1950s, made with tequila, Squirt (the grapefruit soda), lime, and salt. La Capilla, which means 'the chapel,' has been serving drinks since 1961, and Don Javier, who died in 2019, served behind the bar into his nineties. The Paloma is his legacy, though like most cocktail origins, the full story is more complicated than a single man in a single town.",
      "Grapefruit sodas — Squirt, Fresca, Jarritos Toronja — are common in Mexico in a way they are not in most other countries, and the combination of their bittersweet tartness with blanco tequila's agave brightness is natural enough to have been arrived at independently by many bartenders in many places. The name, meaning 'dove' in Spanish, was attached to the drink at some point that the record does not firmly establish.",
      "The Paloma is, in Mexico, a more widely consumed drink than the Margarita, which is somewhat more famous abroad. This is because the Paloma is easier — lighter on the alcohol, more refreshing in the heat, requiring less precision in preparation, and amenable to the grab-a-beer casualness of everyday drinking. A Paloma made with commercial grapefruit soda over ice in a salt-rimmed glass is genuinely good. Made fresh with grapefruit juice and soda water, it is excellent.",
    ],
    tasting:
      "The Paloma opens with grapefruit's bittersweet tartness, which suits tequila in a way that other citrus does not — the grapefruit's natural bitterness finding a counterpart in the agave's vegetal edge. The lime adds a sharper acid. The salt on the rim seasons each sip. The blanco tequila is present throughout without dominating — this is not a spirit-forward drink, it is a refreshment with tequila in it. The finish is clean, dry, and citrus-forward.",
    bartenderNote: {
      quote:
        "Make it fresh when you can — equal parts fresh grapefruit juice and soda water produce a Paloma that the commercial soda version cannot touch. Salt the rim properly: coarse salt on the outside edge only, so the drinker controls their intake. Use a blanco tequila with actual agave character — this is not the drink for a flavorless mixer spirit.",
      attribution: "— Ignacio 'Nacho' Jimenez, Ghost Donkey, New York",
    },
    technique: [
      {
        title: "Salt the rim",
        body: "Run a cut lime around the rim of a highball glass. Press one side into coarse salt. Fill the glass with ice cubes.",
      },
      {
        title: "Build the drink",
        body: "Add 50 ml blanco tequila and 15 ml fresh lime juice. Top with 90 ml fresh grapefruit juice and 60 ml soda water (or 150 ml quality grapefruit soda if using the commercial approach).",
      },
      {
        title: "Finish and garnish",
        body: "Stir once, gently. A grapefruit wedge or wheel on the rim, a lime wedge alongside. This is a generous, casual drink — it does not require ceremony beyond what you have already given it.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Blanco Tequila", note: "100% agave — Fortaleza Blanco or El Tesoro" },
      { measure: "90 ml", name: "Fresh grapefruit juice", note: "Or Jarritos Toronja grapefruit soda" },
      { measure: "15 ml", name: "Fresh lime juice" },
      { measure: "60 ml", name: "Soda water", note: "Omit if using grapefruit soda" },
      { measure: "1 rim", name: "Coarse salt", note: "Outside edge of rim only" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.18 },
      { axis: "Sweet", value: 0.32 },
      { axis: "Sour", value: 0.62 },
      { axis: "Herbal", value: 0.3 },
      { axis: "Citrus", value: 0.88 },
      { axis: "Strong", value: 0.48 },
    ],
    cultural:
      "The Paloma is Mexico's everyday drink in a way that the Margarita, with its ritual precision and multiple variations and constant threat of bad execution, cannot be. It is made in kitchens and at tables and in backyards, from whatever grapefruit soda is in the refrigerator and whatever tequila is in the cupboard. That accessibility is not a compromise — it is the point.",
    related: ["margarita", "moscow-mule", "cuba-libre"],
  },
  {
    slug: "aperol-spritz",
    name: "Aperol Spritz",
    era: "Padua, codified c. 2003",
    origin: "Veneto, Italy — Gruppo Campari marketing initiative",
    family: "Highballs & Fizzes",
    baseSpirit: "Aperol",
    glass: "Large balloon or wine glass, over ice",
    garnish: "Orange half-wheel, optional green olive on a pick",
    method: "Prosecco first, then Aperol, then soda — 3:2:1, always",
    image: "https://images.unsplash.com/photo-1655973577713-5acd43022732?w=1200&q=80",
    kicker: "Feature Nº 32 — Aperol",
    deck: "The Spritz predates Aperol by a century. Aperol simply understood the moment — and became, for a decade, the most visible cocktail in the world.",
    tagline: "Orange and bitter and effervescent. The Venetian hour.",
    history: [
      "The Spritz is older than Aperol and older than Prosecco in its modern form. Austrian soldiers stationed in the Veneto region in the nineteenth century found Italian wines too strong for their taste and began diluting them with water, or with the sparkling mineral water available locally. The verb 'to spray' — spritzen — gave the drink its name. By the time Austria relinquished the Veneto in 1866, the habit was established and the locals had adopted it as their own.",
      "Aperol was created in Padua in 1919 by the Barbieri brothers — a low-alcohol bitter liqueur made from rhubarb, cinchona, gentian, and orange peel, sweeter and lighter than Campari, at 11% ABV compared to Campari's 25%. For most of the twentieth century it was a regional product, beloved in the Veneto and relatively unknown elsewhere. In 2003, after Gruppo Campari acquired the brand, a coordinated marketing initiative pushed the Aperol Spritz as the drink of the Venetian summer — 3 parts prosecco, 2 parts Aperol, 1 part soda — and the world received it with unprecedented enthusiasm.",
      "The Aperol Spritz's global rise has been rapid enough to generate a backlash in certain precincts of the cocktail world, where its perceived simplicity and commercial origins have made it a target for the kind of snobbery that sophisticated drinkers deploy against popular things. The drink does not acknowledge this critique. It is, on its own terms, exactly what it presents itself as: a low-alcohol, bitter-sweet, effervescent aperitivo appropriate for the late afternoon. That is neither a small achievement nor an accidental one.",
    ],
    tasting:
      "The Aperol Spritz opens with the bubbles — prosecco's light carbonation carrying orange and bitter rhubarb into the nose before the first sip. The Aperol's bitterness is soft rather than assertive, more of a frame than a statement, the orange character gentle and sweet. The prosecco's fruitiness amplifies the citrus. The soda lightens the whole construction. The finish is clean, faintly bitter, and very short — this is not a drink that lingers, which is appropriate for something meant to open the appetite rather than satisfy it.",
    bartenderNote: {
      quote:
        "The ratio is 3:2:1 and it is correct. Prosecco first — always — so the Aperol sinks through the wine and distributes itself evenly rather than sitting on top. Then Aperol, then soda. One orange half-wheel, placed not dropped. The olive is Venetian and makes sense but is optional. Serve immediately, while the bubbles are alive.",
      attribution: "— Francesco Pira, Bar Longhi, Venice",
    },
    technique: [
      {
        title: "Observe the ratio",
        body: "90 ml prosecco, 60 ml Aperol, 30 ml soda water. The 3:2:1 ratio keeps the drink's alcohol low, its bitterness restrained, and its effervescence prominent. Deviation produces a different drink.",
      },
      {
        title: "Build in the glass",
        body: "Fill a large wine glass or balloon glass with ice. Add prosecco first — it layers the base. Add Aperol, watching it descend through the prosecco. Add soda last.",
      },
      {
        title: "Garnish with precision",
        body: "An orange half-wheel placed on the rim, not dropped in the glass. A cocktail olive on a pick alongside if you want the Venetian touch. Serve without stirring — the Aperol's descent through the prosecco is integration enough.",
      },
    ],
    ingredients: [
      { measure: "90 ml", name: "Prosecco", note: "Dry — poured first" },
      { measure: "60 ml", name: "Aperol" },
      { measure: "30 ml", name: "Soda water", note: "Added last" },
      { measure: "1", name: "Orange half-wheel", note: "Plus an optional green cocktail olive" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.55 },
      { axis: "Sweet", value: 0.5 },
      { axis: "Sour", value: 0.15 },
      { axis: "Herbal", value: 0.6 },
      { axis: "Citrus", value: 0.48 },
      { axis: "Strong", value: 0.32 },
    ],
    cultural:
      "The Aperol Spritz is the drink that replaced the white wine glass at the aperitivo hour across most of Western Europe in the 2010s — a substitution so swift and complete that it seemed, in retrospect, inevitable. It is proof that a drink with a marketing apparatus behind it can reshape an entire culture's before-dinner ritual, and that the culture will not always resist. Sometimes the well-made popular thing is correct.",
    related: ["negroni", "americano", "kir-royale"],
  },
  {
    slug: "french-75",
    name: "French 75",
    era: "Paris, 1915",
    origin: "Harry's New York Bar, Paris — Harry MacElhone",
    family: "Highballs & Fizzes",
    baseSpirit: "London Dry Gin",
    glass: "Champagne flute",
    garnish: "Long lemon twist, spiraled",
    method: "Shaken, strained into a flute, topped with cold champagne",
    image: "https://images.unsplash.com/photo-1573067705784-c377ccd932eb?w=1200&q=80",
    kicker: "Feature Nº 33 — Gin",
    deck: "Named for the artillery piece that changed the First World War. The drink that deserved the name.",
    tagline: "Gin and champagne. The kick was accurate.",
    history: [
      "The French 75 takes its name from the Canon de 75 modèle 1897 — the 75mm rapid-fire field gun that gave the French Army a decisive artillery advantage in the First World War. The gun was celebrated for its accuracy and its rate of fire: fifteen rounds per minute, with a recoil mechanism that kept the barrel from moving between shots. Harry MacElhone, who had returned to Paris after the war and opened Harry's New York Bar, gave the name to a drink that combined gin, lemon, sugar, and champagne. The punch of the drink was his reason for the reference.",
      "The original version used gin; a later cognac variation, published by the Stork Club in New York in the 1940s, has generated its own following. The gin version is the more interesting drink — the botanical character of the gin and the lemon's bright acid create a sour that the champagne then elevates and extends, the bubbles distributing the citrus and spirit into something lighter and more dynamic than either component alone.",
      "The French 75 belongs to a particular tradition of champagne cocktails in which the sparkling wine is a finishing element rather than a base — a way of aerating and lengthening a drink that was already complete, not a vehicle for other flavors. The champagne arrives last in the preparation and first in the experience: the bubbles carry the gin and citrus into the nose before the first sip, and the drink is fundamentally about that effervescent elevation.",
    ],
    tasting:
      "The French 75 arrives in the glass with champagne's effervescence lifting the gin's botanicals and the lemon's citrus oil into the nose — the first sensory contact is aromatic before it is gustatory. The first sip is bright and tart, the sour foundation of gin and lemon asserting itself before the champagne's sweetness rounds the finish. Mid-palate is lively and complex — juniper, lemon, the yeasty depth of good champagne. The finish is dry and long, the gin and champagne fading together.",
    bartenderNote: {
      quote:
        "Shake the gin, lemon, and sugar hard — the sour needs to be cold and integrated before the champagne touches it. Strain into a flute that has been chilled, not merely at room temperature. Add the champagne slowly and do not stir — pour it down the inside of the glass. The lemon twist should be long and spiral — it is the drink's architecture as much as its garnish.",
      attribution: "— Lu Brow, Bar Marilou, New Orleans",
    },
    technique: [
      {
        title: "Shake the sour",
        body: "Combine 45 ml London Dry gin, 20 ml fresh lemon juice, and 12 ml simple syrup in a shaker with ice. Shake for ten to twelve seconds — the cold is important before the champagne is added.",
      },
      {
        title: "Strain and top",
        body: "Strain into a chilled champagne flute. Top slowly with 75 ml of dry champagne or quality crémant, poured down the inside of the glass to preserve the bubbles.",
      },
      {
        title: "Garnish with length",
        body: "A long spiral of lemon peel — not a twist, a spiral — placed to descend from the rim into the drink. The visual of the yellow peel in the champagne's gold is the French 75's distinctive presentation.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "London Dry Gin", note: "Tanqueray or Beefeater" },
      { measure: "20 ml", name: "Fresh lemon juice", note: "Squeezed to order" },
      { measure: "12 ml", name: "Simple syrup", note: "1:1" },
      { measure: "75 ml", name: "Dry Champagne", note: "Brut — or a quality crémant for everyday service" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.38 },
      { axis: "Sour", value: 0.58 },
      { axis: "Herbal", value: 0.55 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.62 },
    ],
    cultural:
      "The French 75 is the celebratory cocktail of the category — gin's herbal precision meeting champagne's festive effervescence in something that manages to feel both serious and joyful. It is the drink for the occasion that deserves to be marked but not solemnized. Named for a weapon of war, it has become an instrument of celebration, which is the most complete irony available in cocktail history.",
    related: ["gin-and-tonic", "tom-collins", "kir-royale"],
  },
  {
    slug: "americano",
    name: "Americano",
    era: "Milan, c. 1860s",
    origin: "Caffè Camparino, Milan — Gaspare Campari",
    family: "Highballs & Fizzes",
    baseSpirit: "Campari",
    glass: "Tall or rocks, over ice",
    garnish: "Orange half-wheel or long orange peel",
    method: "Built over ice — Campari first, then vermouth, then soda",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    kicker: "Feature Nº 34 — Campari",
    deck: "The Negroni before the Negroni — and, in many ways, the better drink for the purpose it serves.",
    tagline: "Campari, vermouth, soda. The original bitter aperitivo.",
    history: [
      "Gaspare Campari created the drink at his café in the Galleria Vittorio Emanuele II in Milan in the 1860s, serving it as a Milan-Turin — Campari from Milan, sweet vermouth from Turin — a two-spirit combination that he topped with soda water for length and effervescence. The drink was served as an aperitivo, consumed before meals to stimulate the appetite, and it occupied that role for decades as a domestic Italian institution that the wider world barely knew existed.",
      "The name Americano came from the drink's popularity with American tourists during the Prohibition years, when visitors from the United States arrived in Europe with money, thirst, and the particular gratitude of people who had been denied alcohol at home. The Americans ordered the Milan-Turin in such numbers that the drink acquired a new name. There is some satisfaction in the fact that a drink named for American patronage has, in James Bond's first literary appearance, been the drink that precedes the Martini. Bond ordered an Americano at a café in Casino Royale in 1953, watching for danger.",
      "The Americano is the direct ancestor of the Negroni — when Count Camillo Negroni replaced the soda water with gin in 1919, he produced a more concentrated version of the same structure. The Americano is what the Negroni becomes when you restore the soda: lower in alcohol, longer in glass, better suited to an aperitivo hour that is not followed immediately by dinner. They are the same drink at different levels of commitment.",
    ],
    tasting:
      "The Americano opens with Campari's bitter orange-peel intensity, lifted by the soda's carbonation into something more open and less concentrated than the Negroni it resembles. The sweet vermouth adds its dried fruit and herbal depth beneath the bitterness, and the soda extends the finish into something more refreshing than intense. The aftertaste is long and bitter — the gentian root that gives Campari its structure persisting well after the orange and sweetness have faded.",
    bartenderNote: {
      quote:
        "Use equal parts Campari and sweet vermouth, topped with as much soda as the occasion calls for — I use 90 ml for an afternoon drink, less if dinner is close. The orange peel is essential: express it over the surface and drop it in. The oil on the surface of a properly made Americano is the first thing the nose meets. Without it the drink is flat in a way that isn't about the alcohol.",
      attribution: "— Dario Comini, Nottingham Forest, Milan",
    },
    technique: [
      {
        title: "Build over ice",
        body: "Fill a rocks glass or tall glass with large ice cubes. Add 30 ml Campari, then 30 ml sweet vermouth. The order matters less here than in the Negroni, but Campari first is the classic approach.",
      },
      {
        title: "Add soda and stir",
        body: "Top with 90 ml cold soda water. Stir gently — two rotations, no more — to integrate without destroying the carbonation.",
      },
      {
        title: "Express the orange",
        body: "A wide swath of orange peel expressed over the surface, then dropped into the drink. The oil changes the nose and therefore the entire first impression of the drink. This is not optional.",
      },
    ],
    ingredients: [
      { measure: "30 ml", name: "Campari" },
      { measure: "30 ml", name: "Sweet Vermouth", note: "Martini Rosso or Carpano Antica" },
      { measure: "90 ml", name: "Soda water", note: "Adjust to preference" },
      { measure: "1 swath", name: "Orange peel", note: "Expressed and dropped in" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.82 },
      { axis: "Sweet", value: 0.42 },
      { axis: "Sour", value: 0.1 },
      { axis: "Herbal", value: 0.72 },
      { axis: "Citrus", value: 0.48 },
      { axis: "Strong", value: 0.32 },
    ],
    cultural:
      "The Americano is the aperitivo in its most honest form — a drink designed to open rather than to satisfy, to whet rather than to fill, to signal that the evening is beginning without insisting on its terms. It is the glass placed on a table in a Milan café at six o'clock, when the Galleria fills with people who have finished the day and have not yet decided what comes next.",
    related: ["negroni", "aperol-spritz", "boulevardier"],
  },

  // ─── Tropical & Tiki ─────────────────────────────────────────────────────
  {
    slug: "mai-tai",
    name: "Mai Tai",
    era: "Oakland, 1944",
    origin: "Trader Vic's, Oakland, California — Victor Bergeron",
    family: "Tropical & Tiki",
    baseSpirit: "Aged Jamaican and Martinican Rum",
    glass: "Rocks or tiki mug",
    garnish: "Spent lime shell, mint bouquet, orchid, swizzle",
    method: "Shaken, poured over crushed ice",
    image: "https://images.unsplash.com/photo-1542600176-9d2c4bb4bc1a?w=1200&q=80",
    kicker: "Feature Nº 35 — Rum",
    deck: "Victor Bergeron shook it in 1944 for two Tahitian friends. They said 'mai tai roa ae.' The drink entered history still named for that first approval.",
    tagline: "Out of this world. The best. The only verdict that mattered.",
    history: [
      "Victor 'Trader Vic' Bergeron created the Mai Tai in 1944 at his Oakland restaurant, using a bottle of seventeen-year-old J. Wray & Nephew rum he had received from a Jamaican distillery. He combined the rum with fresh lime juice, French orgeat, orange curaçao, and a small amount of simple syrup — a construction designed to showcase the rum's complexity rather than bury it in fruit juice and sweetness. Two Tahitian friends were present when the drink was completed. Ham and Carrie Guild tasted it, declared 'mai tai — roa ae!' in Tahitian ('out of this world — the best'), and the drink had its name.",
      "The Mai Tai's subsequent history is one of degradation and redemption. As the Tiki movement spread across America in the 1950s and 1960s, the drink's formula was simplified for commercial production — cheap rum, artificial orgeat, bottled citrus, fruit juice in quantity. By the 1980s the Mai Tai had become an emblem of the Tiki movement's excess: sweet, colorful, served in a ceramic mug shaped like a Polynesian idol, accompanied by a miniature umbrella. Bergeron's original formula was buried under decades of imitation.",
      "The craft cocktail revival dug the original out. Almond orgeat from quality producers, aged rum from Jamaica and Martinique, fresh lime, measured carefully — the restored Mai Tai bore a relationship to its degraded version similar to the Whiskey Sour's relationship to the sour mix disaster. Both drinks were proven to have been right all along. The imitations were the problem. Bergeron's formula, when made as he made it, remains one of the most balanced rum cocktails in existence.",
    ],
    tasting:
      "The Mai Tai opens with a complex rum aroma — the funk of Jamaican agricole, the rich molasses of aged spirit — lifted by fresh lime and the floral sweetness of almond orgeat. The first sip is balanced across citrus, sweetness, and rum in a way that the drink's tropical reputation does not prepare you for: this is not sweet or fruit-forward, it is precise. The finish is long, rum-forward, with the orgeat's almond note persisting after the citrus has gone.",
    bartenderNote: {
      quote:
        "Split the rum: half Jamaican for the funk — Appleton Estate 12 or Smith & Cross — and half Martinican for the vegetal complexity — Clément VSOP or Rhum J.M. Use real almond orgeat, not the artificial syrup. The lime is fresh. The orgeat is the heart of the drink; choose it carefully. Shake everything, pour over crushed ice, and garnish with the spent lime shell and a mint bouquet — the mint is for the nose, not the palate.",
      attribution: "— Martin Cate, Smuggler's Cove, San Francisco",
    },
    technique: [
      {
        title: "Split the rum",
        body: "30 ml aged Jamaican rum and 30 ml aged Martinican rum. The blend is the drink's foundation — Jamaican funk plus Martinican complexity produces a depth that neither rum achieves alone.",
      },
      {
        title: "Shake everything except the float",
        body: "Combine the rum blend, 20 ml fresh lime juice, 15 ml orange curaçao, and 15 ml almond orgeat in a shaker with ice. Shake vigorously for twelve seconds.",
      },
      {
        title: "Pour over crushed ice and garnish",
        body: "Pour the shaken cocktail, unstrained, over fresh crushed ice in a rocks glass or tiki mug. The spent lime shell, inverted as a 'floatie,' goes in alongside the mint bouquet and a swizzle stick. The dark rum float — 15 ml of a funky overproof Jamaican — is poured last, over the back of a spoon, to sit on the surface.",
      },
    ],
    ingredients: [
      { measure: "30 ml", name: "Aged Jamaican Rum", note: "Appleton Estate 12 or Smith & Cross" },
      { measure: "30 ml", name: "Aged Martinican Rum", note: "Clément VSOP or Rhum J.M. Ambre" },
      { measure: "20 ml", name: "Fresh lime juice", note: "Squeezed to order" },
      { measure: "15 ml", name: "Orange curaçao", note: "Pierre Ferrand or Cointreau" },
      { measure: "15 ml", name: "Almond orgeat", note: "Quality orgeat — BG Reynolds or Small Hand Foods" },
      { measure: "15 ml", name: "Aged overproof rum", note: "Floated — Appleton 21 or Wray & Nephew Overproof" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.2 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.6 },
      { axis: "Herbal", value: 0.4 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.82 },
    ],
    cultural:
      "The Mai Tai is the drink of the Tiki era's best impulse — the desire to transport, to escape, to create around a bar a world that was neither Hawaii nor Polynesia nor the Pacific but a third imaginary thing made of rum and carved wood and colored light. The era's politics were complicated and its appropriation of Pacific cultures was real and unexamined. The drink that came out of it, made correctly, remains extraordinary.",
    related: ["zombie", "jungle-bird", "painkiller"],
  },
  {
    slug: "jungle-bird",
    name: "Jungle Bird",
    era: "Kuala Lumpur, 1978",
    origin: "Aviary Bar, Kuala Lumpur Hilton — Jeffrey Ong",
    family: "Tropical & Tiki",
    baseSpirit: "Batavia Arrack and Dark Rum",
    glass: "Rocks or tiki",
    garnish: "Pineapple wedge, dehydrated pineapple wheel",
    method: "Shaken, strained over cubed ice",
    image: "https://images.unsplash.com/photo-1526487995276-56ce643ba8a9?w=1200&q=80",
    kicker: "Feature Nº 36 — Rum",
    deck: "Campari in a tiki drink — the combination that should not work, does not apologize, and cannot be improved upon.",
    tagline: "Bitter, tropical, and without precedent.",
    history: [
      "Jeffrey Ong created the Jungle Bird at the Aviary Bar of the Kuala Lumpur Hilton in 1978, designed as a welcome drink for newly arrived guests. The formula combined dark rum with Campari — a bitter liqueur not commonly associated with Tiki drinks — pineapple juice, fresh lime, and simple syrup. The combination was counterintuitive: Campari's bitterness and the tropical sweetness of pineapple are not obvious partners. In this drink they are essential to each other.",
      "The Jungle Bird remained largely unknown outside Malaysia for nearly three decades. Giuseppe González discovered it in Beachbum Berry's 2002 book Intoxica! and began serving it at his bar in New York, where its unusual combination of bitter and tropical attracted the attention of bartenders who were then expanding the Tiki canon beyond its mid-century American origins. By the time the cocktail revival was in full swing, the Jungle Bird had become something close to a modern classic.",
      "The drink's genius is the Campari, which does two things simultaneously: it provides a bitterness that prevents the pineapple from becoming saccharine, and it extends the drink's flavors in directions that rum and fruit juice alone cannot reach. The result is a Tiki drink with the structural complexity of a classic cocktail — something that rewards attention rather than merely rewarding consumption. It is the most surprising drink in the Tiki canon, which is not a category known for its restraint.",
    ],
    tasting:
      "The Jungle Bird opens with pineapple — its bright tropical sweetness immediate and generous. Then Campari arrives: bitter orange peel, the herbal weight of the liqueur cutting through the fruit and changing the drink's register. The rum grounds both of them, adding molasses and wood. Lime runs through the mid-palate as acid, preventing the whole construction from becoming sweet. The finish is long, bitter, and tropical in sequence — the Campari outlasting the pineapple, the rum outlasting both.",
    bartenderNote: {
      quote:
        "Use a quality dark rum with genuine character — Appleton Estate Signature or a Jamaican blend. The Campari is 30 ml and it is not negotiable; reducing it because you are worried about the bitterness produces a drink that is not the Jungle Bird. Fresh pineapple juice is worth the effort over canned — the texture and brightness are different. Shake it hard and strain it clean.",
      attribution: "— Giuseppe González, Suffolk Arms, New York",
    },
    technique: [
      {
        title: "Build the cocktail",
        body: "Combine 45 ml dark rum, 30 ml Campari, 45 ml fresh pineapple juice, 15 ml fresh lime juice, and 15 ml simple syrup in a shaker with ice.",
      },
      {
        title: "Shake and strain",
        body: "Shake vigorously for twelve seconds. Strain over a large cube in a rocks glass or into a tiki vessel. The drink should be a deep amber-red from the Campari and rum.",
      },
      {
        title: "Garnish with pineapple",
        body: "A pineapple wedge on the rim and, if available, a dehydrated pineapple wheel for visual contrast. The garnish here communicates the tropical element the Campari conceals.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "Dark Rum", note: "Appleton Estate or a Jamaican blend with character" },
      { measure: "30 ml", name: "Campari", note: "The structural element — do not reduce" },
      { measure: "45 ml", name: "Fresh pineapple juice", note: "Freshly pressed preferred over canned" },
      { measure: "15 ml", name: "Fresh lime juice" },
      { measure: "15 ml", name: "Simple syrup", note: "1:1" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.62 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.5 },
      { axis: "Herbal", value: 0.42 },
      { axis: "Citrus", value: 0.65 },
      { axis: "Strong", value: 0.75 },
    ],
    cultural:
      "The Jungle Bird was invented in Southeast Asia for hotel guests in 1978 and discovered by the American cocktail revival through a Tiki history book in 2002. Its trajectory illustrates something important about how the cocktail canon works: not by geography or fame or commercial success, but by the quality of the drink itself, which waits to be found by people capable of recognizing it.",
    related: ["mai-tai", "painkiller", "zombie"],
  },
  {
    slug: "painkiller",
    name: "Painkiller",
    era: "British Virgin Islands, c. 1970",
    origin: "Soggy Dollar Bar, Jost Van Dyke, British Virgin Islands",
    family: "Tropical & Tiki",
    baseSpirit: "Pusser's Rum",
    glass: "Rocks or tiki mug, over crushed ice",
    garnish: "Freshly grated nutmeg, pineapple wedge",
    method: "Shaken vigorously, served over crushed ice",
    image: "https://images.unsplash.com/photo-1468465236047-6aac20937e92?w=1200&q=80",
    kicker: "Feature Nº 37 — Rum",
    deck: "A drink from a bar with no dock — sailors swam ashore with wet dollars to pay for it. The name came from the swim, or from what followed.",
    tagline: "Pineapple, coconut, orange, and the rum that the Royal Navy drank.",
    history: [
      "The Soggy Dollar Bar on White Bay, Jost Van Dyke, is accessible only by water. Boats anchor in the bay and guests swim to shore, their currency arriving wet. Daphne Henderson, who owned the bar from the 1970s, created the Painkiller as the house drink — a combination of Pusser's Rum (the brand then associated with the British Royal Navy's historical rum ration), pineapple juice, cream of coconut, and fresh orange juice. The nutmeg grated on top was the finishing element, and the drink was served over ice in quantities that explained the name.",
      "Pusser's Rum became so associated with the Painkiller that the brand eventually trademarked the drink name, meaning that technically a Painkiller made with any rum other than Pusser's is called something else. This trademark is controversial in the bartending community but legally enforceable. In practice, the drink is made with Pusser's wherever the name is used seriously, and with whatever dark rum is available wherever it is not.",
      "The Painkiller's formula is generous — more pineapple juice than most Tiki drinks, cream of coconut for tropical sweetness and texture, fresh orange for brightness. It is the most approachable drink in the Tiki category: sweet and fruity and substantial, the rum present but softened by coconut. It is the drink you drink on a boat, or in a bar that feels like a boat, or in a room that you are trying to convince yourself is a boat.",
    ],
    tasting:
      "The Painkiller is coconut before it is rum — the cream of coconut's tropical sweetness arriving first and establishing the register. Pineapple follows, its acid cutting through the coconut without reducing it. The orange adds a citrus brightness at the edges. The Pusser's rum is present as warmth and weight beneath all of it — structured and slightly medicinal from the naval blend's history. The freshly grated nutmeg on the surface is aromatic, arriving in the nose before each sip.",
    bartenderNote: {
      quote:
        "Grate the nutmeg fresh from the whole spice. Pre-ground nutmeg tastes like cardboard in comparison — the volatile oils in fresh nutmeg are what you are looking for, and they disappear within minutes of grating. Shake the Painkiller harder than you think necessary; the cream of coconut needs significant agitation to integrate with the rum and citrus. Serve over crushed ice and grate the nutmeg over the surface at the last moment.",
      attribution: "— Daphne Henderson, Soggy Dollar Bar, Jost Van Dyke",
    },
    technique: [
      {
        title: "Build and shake hard",
        body: "Combine 60 ml Pusser's Rum, 120 ml pineapple juice, 30 ml cream of coconut, and 30 ml fresh orange juice in a shaker with ice. Shake very vigorously for fifteen seconds — the cream of coconut requires genuine effort to integrate.",
      },
      {
        title: "Serve over crushed ice",
        body: "Pour the shaken cocktail over crushed ice in a rocks glass or tiki mug. The crushed ice is not aesthetic — it keeps the drink at a temperature that the cream of coconut requires to remain pleasant.",
      },
      {
        title: "Grate nutmeg last",
        body: "Freshly grate whole nutmeg over the surface of the drink at the last moment before serving. The quantity is a personal choice — a generous grating changes the aromatic entirely.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Pusser's Rum", note: "The trademarked original — or a quality dark navy rum" },
      { measure: "120 ml", name: "Pineapple juice", note: "Fresh if possible" },
      { measure: "30 ml", name: "Cream of coconut", note: "Coco López or equivalent — not coconut milk" },
      { measure: "30 ml", name: "Fresh orange juice" },
      { measure: "1 grating", name: "Whole nutmeg", note: "Freshly grated over the surface at service — never pre-ground" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.78 },
      { axis: "Sour", value: 0.25 },
      { axis: "Herbal", value: 0.18 },
      { axis: "Citrus", value: 0.52 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "The Painkiller belongs to a specific category of drink — the one associated so completely with a specific place that drinking it elsewhere is an act of imagination. The Soggy Dollar Bar on Jost Van Dyke is the canonical setting: the anchored boats, the swimming guests, the wet currency. The drink works everywhere. It tastes most like itself at the source.",
    related: ["mai-tai", "jungle-bird", "dark-and-stormy"],
  },
  {
    slug: "dark-and-stormy",
    name: "Dark & Stormy",
    era: "Bermuda, early 20th century",
    origin: "Gosling Brothers, Hamilton, Bermuda",
    family: "Tropical & Tiki",
    baseSpirit: "Gosling's Black Seal Rum",
    glass: "Highball, over ice",
    garnish: "Lime wedge",
    method: "Built over ice — ginger beer first, rum floated on top",
    image: "https://images.unsplash.com/photo-1655917080507-dc3ee47580a3?w=1200&q=80",
    kicker: "Feature Nº 38 — Rum",
    deck: "Gosling's black rum over ginger beer — named for the cloud that forms when the dark rum hits the pale fizz. Bermuda in a glass.",
    tagline: "The float, the foam, the colour of a sea before rain.",
    history: [
      "The Dark & Stormy traces its origins to the relationship between Gosling Brothers rum distillery and the Bermuda Royal Naval Officers' mess. Gosling's Black Seal Rum — named for the black sealing wax that stoppered early bottles — and locally produced ginger beer were combined, and the name came from a sailor's observation that the drink, rum floating on ginger beer, looked like the sky before a Bermuda storm. The precise date is unrecorded; the style of drinking was Victorian.",
      "Gosling Brothers has since trademarked the name Dark 'N' Stormy and claims that the drink cannot legally be served with any rum other than Gosling's Black Seal. This makes the Dark & Stormy the only classic cocktail with a legally enforced brand requirement — a situation that irritates bartenders, amuses lawyers, and does not much affect the drinking public, who order it by description rather than by trademark. The drink tastes correct with Gosling's because Gosling's Black Seal is the correct rum for it: rich, dark, molasses-forward, with the body to float convincingly on ginger beer.",
      "The float is not merely visual. When rum rests on ginger beer without mixing, the first sip encounters the rum directly — the full weight of the spirit before it dilutes into the carbonated base beneath. As the drink progresses and the float integrates, the rum-to-ginger balance shifts. The Dark & Stormy changes across its duration in a way that most two-ingredient builds do not, and this temporal quality is part of its character.",
    ],
    tasting:
      "The first sip of a Dark & Stormy, through the floated rum, is all rum — the full, rich, molasses weight of Gosling's Black Seal, the ginger beer beneath it not yet involved. A quarter of the way through, the rum has begun to integrate and the ginger beer's spice arrives, peppery and assertive. The lime at the side acidifies each sip when squeezed. The finish is warming and gingery, the rum's warmth persisting with the spice.",
    bartenderNote: {
      quote:
        "Build it correctly: ginger beer first, over ice, then the rum floated over the back of a bar spoon so it sits on top. The lime wedge is squeezed against the rum as you drink — the acid hits the rum directly before mixing into the ginger beer. Gosling's Black Seal is non-negotiable; it has the proof and the body to float properly and the character to survive it.",
      attribution: "— Frank Gosling, Gosling Brothers, Bermuda",
    },
    technique: [
      {
        title: "Build the base",
        body: "Fill a highball glass with large ice cubes. Pour 150 ml of ginger beer — Barritt's Bermuda ginger beer for authenticity, Fever-Tree Ginger Beer as a widely available alternative.",
      },
      {
        title: "Float the rum",
        body: "Hold a bar spoon face-down over the surface of the ginger beer. Pour 50 ml Gosling's Black Seal Rum slowly over the back of the spoon. The rum should float in a visible dark layer above the pale ginger beer.",
      },
      {
        title: "Garnish and serve",
        body: "A lime wedge on the rim, to be squeezed against the floating rum as each sip is taken. Do not stir. The point of the drink is the float, the sip, and the slow integration across the glass.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Gosling's Black Seal Rum", note: "The trademarked original — the float requires the body of this specific rum" },
      { measure: "150 ml", name: "Ginger beer", note: "Barritt's Bermuda ginger beer, or Fever-Tree" },
      { measure: "1 wedge", name: "Lime", note: "Squeezed against the rum float as you drink" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.15 },
      { axis: "Sweet", value: 0.42 },
      { axis: "Sour", value: 0.35 },
      { axis: "Herbal", value: 0.3 },
      { axis: "Citrus", value: 0.45 },
      { axis: "Strong", value: 0.6 },
    ],
    cultural:
      "The Dark & Stormy is Bermuda's drink in the way that the Sazerac is New Orleans's drink — inseparable from the island's identity, the naval history, the particular shade of the Atlantic just before the weather changes. It is drunk with the particular confidence of a drink that has a place and knows it.",
    related: ["moscow-mule", "painkiller", "rum-punch"],
  },
  {
    slug: "rum-punch",
    name: "Rum Punch",
    era: "British Caribbean, 17th century",
    origin: "British colonial settlements — the original cocktail formula",
    family: "Tropical & Tiki",
    baseSpirit: "Aged Rum",
    glass: "Punch bowl or tall glass",
    garnish: "Grated nutmeg, lime wheel, orange wheel",
    method: "One sour, two sweet, three strong, four weak — the mnemonic that preceded every bartending manual",
    image: "https://images.unsplash.com/photo-1748674754202-fdc23175fd93?w=1200&q=80",
    kicker: "Feature Nº 39 — Rum",
    deck: "The oldest formula in the book — literally. The punch tradition predates every cocktail in this journal by two centuries.",
    tagline: "One sour. Two sweet. Three strong. Four weak. The original recipe.",
    history: [
      "The punch tradition arrived in the Caribbean with the British Navy and colonial settlers in the seventeenth century, and its formula is as old as the trade winds that carried the ships. 'One of sour, two of sweet, three of strong, four of weak' — the mnemonic for lime juice, sugar, rum, and water — predates every cocktail recipe ever written by at least a century. The Rum Punch is not a cocktail in the modern sense; it is the origin point of the entire category, the formula from which all subsequent drinks derive.",
      "Rum was the natural spirit of the Caribbean — distilled from the molasses byproduct of the sugar trade that the colonial economies depended upon, cheap and abundant and increasingly refined as distillers improved their craft across the eighteenth century. The sugar and lime that balanced it in the punch were grown on the same islands. The water was dilution. The formula was not invented so much as arrived at: four basic elements in a proportion that balances them perfectly, which is the deepest definition of a recipe.",
      "The modern Rum Punch has infinite regional variations — each island, each bar, each family has its own ratio and its own preferred rum and its own addition of fruit juice or grenadine or falernum. The Barbadian version (Malibu-free) runs drier than the Trinidadian. The Jamaican version tends toward overproof. The St. Lucian version varies from parish to parish. What connects all of them is the underlying logic of the mnemonic: sour cuts the sweet, spirit carries the whole, and water makes it last.",
    ],
    tasting:
      "A properly balanced Rum Punch opens with citrus — fresh lime's acid, bright and cutting — immediately moderated by the sweetness of sugar syrup. The rum arrives mid-palate with warmth and depth: molasses, wood, the specific character of whichever island's distillery was responsible. The spice of fresh-grated nutmeg arrives in the nose before each sip, adding an aromatic complexity that the drink's basic formula does not predict. The finish is long, warm, and tropical — the rum outlasting the citrus.",
    bartenderNote: {
      quote:
        "The mnemonic is the recipe and the recipe is correct. One part lime juice, two parts simple syrup, three parts aged rum, four parts water or ice dilution. Adjust the sweetness to the lime's tartness — Caribbean limes vary in acidity. Grate the nutmeg fresh. Serve very cold. The punch bowl approach is correct for groups; the tall glass for individuals. Do not complicate what does not require complication.",
      attribution: "— Angostura Heritage Centre, Trinidad",
    },
    technique: [
      {
        title: "Apply the mnemonic",
        body: "22 ml fresh lime juice, 45 ml simple syrup, 67 ml aged rum, 90 ml cold water or ice. These are the 1:2:3:4 proportions that have governed punch for three centuries. Scale to volume.",
      },
      {
        title: "Combine and chill",
        body: "Mix the lime, sugar, and rum together first, then add the water or pour over ice. Stir to integrate. Chill thoroughly — punch served warm is a historical relic, not a preference.",
      },
      {
        title: "Grate and garnish",
        body: "Freshly grated nutmeg over the surface, a lime wheel, and an orange wheel for color. A cocktail umbrella is historically recent and optional. The nutmeg is ancient and not.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "Fresh lime juice", note: "One part sour" },
      { measure: "45 ml", name: "Simple syrup", note: "Two parts sweet — 1:1" },
      { measure: "67 ml", name: "Aged Rum", note: "Three parts strong — Appleton Estate, Mount Gay, El Dorado" },
      { measure: "90 ml", name: "Cold water or ice dilution", note: "Four parts weak" },
      { measure: "1 grating", name: "Whole nutmeg", note: "Freshly grated — essential" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.55 },
      { axis: "Herbal", value: 0.22 },
      { axis: "Citrus", value: 0.72 },
      { axis: "Strong", value: 0.68 },
    ],
    cultural:
      "The Rum Punch is the ancestor — the drink from which every sour, every cocktail, every carefully measured combination of spirit and citrus and sweetener descends. To understand where cocktails come from is to understand the punch tradition, and to understand the punch tradition is to understand the seventeenth century Caribbean: its trade routes, its sugarcane, its rum, and its enormous human cost. The mnemonic is older than any bar still standing.",
    related: ["mai-tai", "painkiller", "dark-and-stormy"],
  },
  {
    slug: "zombie",
    name: "Zombie",
    era: "Los Angeles, 1934",
    origin: "Don the Beachcomber, Hollywood — Donn Beach",
    family: "Tropical & Tiki",
    baseSpirit: "Multiple Aged Rums",
    glass: "Collins glass or tiki",
    garnish: "Mint bouquet, float of 151-proof rum, orchid",
    method: "Blended or shaken with crushed ice, limited to two per customer per visit",
    image: "https://images.unsplash.com/photo-1515757026668-f01a7685f66e?w=1200&q=80",
    kicker: "Feature Nº 40 — Rum",
    deck: "Don the Beachcomber invented it to cure a hangover, limited it to two per customer, and kept the recipe secret for decades. All three decisions were correct.",
    tagline: "Two per customer. Three and you will understand the name.",
    history: [
      "Donn Beach — born Ernest Raymond Beaumont Gantt, legally renamed Don Beach in 1941 — created the Zombie at Don the Beachcomber in Hollywood in 1934, supposedly to cure a visiting businessman who needed to function at a meeting after a long night. The businessman departed, attended his meeting, and later reported that he had not felt like himself but had felt like something. The drink was named accordingly.",
      "The Zombie's recipe was Donn Beach's most jealously guarded secret. He employed multiple bartenders at multiple locations, giving each only a partial formula and combining their work through coded references and numbered bottles. The complete recipe eluded researchers for decades. Beachbum Berry, the foremost historian of Tiki drinks, spent years assembling the formula from partial accounts and coded documentation, eventually publishing a reconstruction that is now accepted as accurate.",
      "The two-per-customer rule is the Zombie's most famous quality after its taste. The rule appears in Don the Beachcomber's original menus and has been maintained at serious Tiki establishments ever since. The drink's alcohol content — multiple rums, some at overproof, some aged, some falernum — is the reason for the rule. A single Zombie, made correctly, is a significant quantity of alcohol dressed in tropical clothing. Two are the limit. The name explains the third.",
    ],
    tasting:
      "The Zombie is what happens when multiple rums with different characters — light Puerto Rican, dark Jamaican, aged Martinican — meet falernum's spice and lime's acid in a single glass. The result is not simple: the first sip is bright and citrusy, the second reveals the falernum's clove and ginger, and the third introduces the aged rum's depth. The 151-proof float on top is the last element: it concentrates the rum's warmth into an aromatic cloud above the drink. The finish is long, spiced, and warm.",
    bartenderNote: {
      quote:
        "Do not free-pour this drink. Every component has a specific role — the light rum provides the base, the dark rum the body, the 151 the punch, the falernum the spice, the lime the acid, the Angostura the depth. Measure precisely and make no substitutions. Serve the limit: two. Beyond that, the hospitality has become something else, and that is not the bar's responsibility.",
      attribution: "— Beachbum Berry, Latitude 29, New Orleans",
    },
    technique: [
      {
        title: "Assemble the rum blend",
        body: "Combine 30 ml light Puerto Rican rum, 30 ml dark Jamaican rum, and 30 ml aged Demerara rum in a shaker. The blend is the drink's foundation — each rum contributes differently.",
      },
      {
        title: "Add the tropical elements",
        body: "Add 15 ml falernum, 22 ml fresh lime juice, 15 ml fresh grapefruit juice, 7 ml grenadine, and two dashes of Angostura bitters. Shake hard for fifteen seconds with ice.",
      },
      {
        title: "Pour and float the 151",
        body: "Pour the shaken cocktail over crushed ice in a tall glass or tiki vessel. Float 15 ml of 151-proof rum over the back of a spoon. Garnish with a mint bouquet and light the float if the occasion calls for it. Limit: two per guest.",
      },
    ],
    ingredients: [
      { measure: "30 ml", name: "Light Puerto Rican Rum", note: "Bacardi Superior or Don Q" },
      { measure: "30 ml", name: "Dark Jamaican Rum", note: "Appleton Estate or Myers's" },
      { measure: "30 ml", name: "Aged Demerara Rum", note: "El Dorado 8 or Banks 5 Island" },
      { measure: "15 ml", name: "Falernum", note: "John D. Taylor's Velvet Falernum — spiced syrup with clove and lime" },
      { measure: "22 ml", name: "Fresh lime juice" },
      { measure: "15 ml", name: "Fresh grapefruit juice" },
      { measure: "7 ml", name: "Grenadine", note: "Real pomegranate grenadine" },
      { measure: "15 ml", name: "Overproof Rum 151", note: "Floated — Bacardi 151 or Plantation O.F.T.D." },
      { measure: "2 dashes", name: "Angostura bitters" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.22 },
      { axis: "Sweet", value: 0.6 },
      { axis: "Sour", value: 0.55 },
      { axis: "Herbal", value: 0.38 },
      { axis: "Citrus", value: 0.65 },
      { axis: "Strong", value: 0.98 },
    ],
    cultural:
      "The Zombie is the Tiki movement's most extreme expression — a drink that requires secrecy to make correctly, a rule to consume responsibly, and a willingness on the part of both bartender and drinker to take the whole enterprise seriously. It is the opposite of a casual drink. It demands respect and provides, in exchange, an experience that the rest of the Tiki category rarely matches for depth or intensity.",
    related: ["mai-tai", "rum-punch", "jungle-bird"],
  },

  // ─── Digestif & Nightcap ─────────────────────────────────────────────────
  {
    slug: "espresso-martini",
    name: "Espresso Martini",
    era: "London, 1983",
    origin: "Fred's Club, Soho, London — Dick Bradsell",
    family: "Digestif & Nightcap",
    baseSpirit: "Vodka",
    glass: "Chilled coupe",
    garnish: "Three coffee beans — placed on the foam",
    method: "Shaken very hard over ice, double-strained for foam",
    image: "https://images.unsplash.com/photo-1607687633950-c745bdb4da70?w=1200&q=80",
    kicker: "Feature Nº 41 — Vodka",
    deck: "Dick Bradsell was asked for something to wake her up and then mess her up. He built it in thirty seconds. The foam took longer to explain.",
    tagline: "Coffee, vodka, and the exact request that created the drink.",
    history: [
      "Dick Bradsell created the Espresso Martini in 1983 at the Soho Brasserie in London, later refining it at Fred's Club. The origin story is specific: a young model (who has never been publicly identified beyond the most persistent versions of the tale) sat at the bar and asked Bradsell for something that would 'wake me up, then mess me up.' Bradsell had an espresso machine behind the bar — unusual for a cocktail bar at the time — and he used it. Vodka, fresh espresso, Kahlúa, and simple syrup, shaken hard over ice. The foam arrived from the espresso's crema emulsified by the shaking. The drink arrived in thirty seconds and took decades to fully spread.",
      "The Espresso Martini belongs technically to neither the Martini family nor the espresso tradition. It is a shaken vodka cocktail that uses coffee as its primary flavoring element — the espresso providing bitterness, intensity, and the structural crema foam that makes the drink visually distinctive. Calling it a Martini is historically inaccurate and practically irrelevant. By the time the cocktail vocabulary settled on the name, the drink was already famous under it.",
      "The Espresso Martini's global ascent accelerated in the 2010s and continues into the present — it is now one of the most commonly ordered cocktails in the world, its combination of coffee and alcohol addressing two of the most reliable consumer demands simultaneously. The backlash against it in certain craft cocktail precincts has been consistent and largely ineffective. Dick Bradsell, who died in 2016, did not live to see the full extent of what he built in thirty seconds in Soho in 1983.",
    ],
    tasting:
      "The Espresso Martini arrives with a dense foam of coffee-brown crema, the three coffee beans arranged on the surface. The first impression is olfactory — fresh espresso, intense and slightly bitter, with the vodka's alcohol lifting the aroma. The first sip through the foam is rich and bitter-sweet, the coffee's intensity meeting the Kahlúa's sweeter coffee character. The vodka provides the alcohol structure without distracting from the coffee. The finish is long and roasted, the espresso persisting after the sweetness has faded.",
    bartenderNote: {
      quote:
        "Use a shot of espresso pulled fresh and allowed to cool for sixty seconds — a hot espresso will melt the ice and over-dilute the drink. Shake very hard: the crema in the espresso needs aggressive agitation to produce the foam that arrives in the coupe. Double-strain through a fine mesh. The three coffee beans are Italian: good health, good fortune, and happiness. Do not skip them.",
      attribution: "— Dick Bradsell, Fred's Club, London",
    },
    technique: [
      {
        title: "Pull and cool the espresso",
        body: "Pull a single 25 ml shot of espresso and allow it to cool for sixty seconds. A hot espresso poured directly onto ice will melt too much of it and produce an over-diluted drink.",
      },
      {
        title: "Shake with real force",
        body: "Combine 50 ml vodka, 25 ml espresso, 15 ml Kahlúa, and 10 ml simple syrup in a shaker with plenty of ice. Shake harder and longer than for any other drink — fifteen seconds minimum. The foam requires it.",
      },
      {
        title: "Double-strain for foam",
        body: "Strain through a fine mesh into a coupe chilled to frosting. The foam should arrive in a dense cap. Place three coffee beans on the foam in a triangle. Serve immediately — the foam begins to collapse after five minutes.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Vodka", note: "Clean and neutral — Ketel One, Grey Goose" },
      { measure: "25 ml", name: "Fresh espresso", note: "Pulled to order, cooled sixty seconds" },
      { measure: "15 ml", name: "Kahlúa", note: "Coffee liqueur — Mr. Black for a more intense version" },
      { measure: "10 ml", name: "Simple syrup", note: "Adjust to coffee bitterness" },
      { measure: "3", name: "Coffee beans", note: "Placed on the foam for garnish" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.38 },
      { axis: "Sweet", value: 0.52 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.2 },
      { axis: "Citrus", value: 0.0 },
      { axis: "Strong", value: 0.8 },
    ],
    cultural:
      "The Espresso Martini is the drink that demonstrated, more clearly than any other modern cocktail, that there is no contradiction between mass popularity and genuine quality. It is ordered in millions of bars by people who want coffee and alcohol and nothing more complicated than that. When it is made correctly, it is genuinely excellent. The snobbishness around it says more about the snob than about the drink.",
    related: ["black-russian", "stinger", "white-russian"],
  },
  {
    slug: "stinger",
    name: "Stinger",
    era: "New York, c. 1890s",
    origin: "New York — exact origin unrecorded",
    family: "Digestif & Nightcap",
    baseSpirit: "Cognac",
    glass: "Chilled coupe or crushed-ice rocks",
    garnish: "Fresh mint sprig",
    method: "Stirred or shaken, strained",
    image: "https://images.unsplash.com/photo-1692616717087-54ee6f6c7e8f?w=1200&q=80",
    kicker: "Feature Nº 42 — Cognac",
    deck: "Cognac and white crème de menthe — the after-dinner drink that the American aristocracy adopted and that the cocktail revival largely ignored. Both positions were reasonable.",
    tagline: "Brandy and mint. Cooling, warming, and final.",
    history: [
      "The Stinger's origins are unresolved but its era is clear: the late nineteenth and early twentieth century, when the American elite drank cognac as a matter of course and crème de menthe was a fashionable liqueur of European origin. The drink appeared in cocktail guides of the 1910s and 1920s, and through Prohibition it maintained a reputation as a sophisticated after-dinner drink — consumed in private clubs and gilded hotel bars, associated with tuxedos and late evenings.",
      "The combination of cognac and white crème de menthe seems, in the contemporary bar context, like an unusual pairing — the rich fruit and wood of brandy against the herbal coolness of peppermint. In practice it produces a drink that is simultaneously warming and cooling: the cognac providing body and warmth, the crème de menthe distributing a minty freshness that refreshes the palate in the way that an after-dinner mint is intended to do. The drink is designed for the conclusion of a meal, and it performs this function with the precision of something that has been doing it for a century.",
      "The Stinger fell out of fashion with the cognac-drinking culture that supported it. The cocktail revival's emphasis on citrus, bitterness, and complexity left little room for a drink whose two ingredients are both sweet and whose primary virtue is simplicity and comfort. It remains, in the right context — a long dinner, a cold evening, a table where the food has been ambitious — the most direct and honest digestif in the cocktail canon.",
    ],
    tasting:
      "The Stinger opens with cognac's warmth — dried fruit, oak, the vanilla and caramel of long barrel aging — and then the crème de menthe's mint coolness arrives, not as a contradiction but as a contrast that clarifies rather than confuses. The two interact across the palate: warmth and coolness in alternation, the cognac's richness buffered by the mint's freshness. The finish is long and clean, the mint persisting after the cognac has faded, cooling the palate for whatever comes after.",
    bartenderNote: {
      quote:
        "Use white crème de menthe, not green — the white has a cleaner mint character and doesn't color the drink. The ratio is 2:1, cognac to crème de menthe — more mint than that and the drink becomes one-dimensional. Stir it; shaking introduces air that the Stinger doesn't benefit from. Serve very cold. A sprig of fresh mint in the glass is optional but correct.",
      attribution: "— Ted Haigh, Vintage Spirits & Forgotten Cocktails",
    },
    technique: [
      {
        title: "Build in a mixing glass",
        body: "Combine 50 ml VSOP cognac and 25 ml white crème de menthe in a chilled mixing glass over large clear cubes. The white crème de menthe is essential — not green.",
      },
      {
        title: "Stir until cold",
        body: "Stir forty rotations. The Stinger is a digestif and should be served cold — the chill tempers the crème de menthe's sweetness and makes the mint character read as freshness rather than candy.",
      },
      {
        title: "Strain and garnish",
        body: "Strain into a chilled coupe. A sprig of fresh mint placed in the glass, not as decoration but as an additional aromatic layer that compounds with the crème de menthe's character.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "VSOP Cognac", note: "Rémy Martin or Hennessy" },
      { measure: "25 ml", name: "White Crème de Menthe", note: "Not green — Bols or Giffard" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.58 },
      { axis: "Sour", value: 0.05 },
      { axis: "Herbal", value: 0.88 },
      { axis: "Citrus", value: 0.1 },
      { axis: "Strong", value: 0.82 },
    ],
    cultural:
      "The Stinger is the drink of a particular kind of formality that is not much in fashion — the after-dinner ritual in a private club, the cognac brandy service at a restaurant that still provides it, the cold evening that requires something closing and warm. It is a drink for conclusions. When the occasion presents itself, nothing else performs the same function.",
    related: ["brandy-alexander", "espresso-martini", "sazerac"],
  },
  {
    slug: "brandy-alexander",
    name: "Brandy Alexander",
    era: "New York, c. 1915",
    origin: "Attributed to Troy Alexander, Rector's Restaurant, New York",
    family: "Digestif & Nightcap",
    baseSpirit: "Cognac",
    glass: "Chilled coupe",
    garnish: "Freshly grated nutmeg",
    method: "Shaken with cream, double-strained",
    image: "https://images.unsplash.com/photo-1602950630157-b00e787fefa3?w=1200&q=80",
    kicker: "Feature Nº 43 — Cognac",
    deck: "John Lennon's drink. A Prohibition-era cream cocktail that outlasted every other drink in its category by being genuinely delicious.",
    tagline: "Cognac, crème de cacao, cream, and the scent of fresh nutmeg.",
    history: [
      "Troy Alexander, a bartender at Rector's Restaurant in New York, reportedly created the Alexander around 1915 as a white cocktail — gin, white crème de cacao, and cream — for a company dinner where the theme required all-white food and drink. The cognac variant, which became the Brandy Alexander, followed and eventually eclipsed the original. Both versions circulated as the 'Alexander' for decades, until the cognac version became so dominant that the prefix became necessary.",
      "The Brandy Alexander achieved a particular cultural visibility when John Lennon adopted it as his drink during the Lost Weekend — the eighteen-month period he spent in Los Angeles in 1973–1974, separated from Yoko Ono and in the company of May Pang. Lennon drank Brandy Alexanders with a dedication that made the tabloids. The drink, already associated with a certain kind of sweet-tooth sophistication, acquired a rock-and-roll afterimage that it has carried since.",
      "The cream cocktail category was largely abandoned by the craft cocktail movement, which found its sweetness and dairy richness incompatible with the era's preference for precise, dry, spirit-forward drinks. The Brandy Alexander survived this period on the strength of its own merit — the combination of cognac's complexity, crème de cacao's chocolate and vanilla warmth, and fresh cream's richness is one that works in a way that most cream cocktails do not. The nutmeg on top is not a garnish; it is the ingredient that ties everything together.",
    ],
    tasting:
      "The Brandy Alexander is rich from the first moment — the cream's texture preceding the flavor, the coupe feeling substantial in the hand. The cognac arrives through the cream as dried fruit and oak warmth, followed by the crème de cacao's dark chocolate and vanilla sweetness. The cream rounds and softens everything, reducing sharpness and increasing the impression of velvet. The freshly grated nutmeg on the surface is aromatic — its warm spice cutting through the cream and tying the cognac's complexity to the chocolate. The finish is long, rich, and warming.",
    bartenderNote: {
      quote:
        "Use dark crème de cacao rather than white — the dark version has more chocolate character and produces a drink with more depth. Heavy cream, not half-and-half; the fat content changes the texture in ways that matter. Grate the nutmeg fresh from the whole spice directly over the coupe at the moment of service. The nutmeg's volatile oils evaporate within minutes — it must be fresh.",
      attribution: "— David Wondrich, Imbibe!, New York",
    },
    technique: [
      {
        title: "Combine and chill",
        body: "Combine 40 ml VSOP cognac, 20 ml dark crème de cacao, and 30 ml heavy cream in a shaker with ice. The combination is straightforward; the technique determines the texture.",
      },
      {
        title: "Shake with intention",
        body: "Shake vigorously for twelve seconds. The cream needs agitation to thicken slightly and integrate with the spirits. Under-shaking produces a thin, watery cocktail. Over-shaking risks an early stage of churning. Twelve seconds is correct.",
      },
      {
        title: "Strain and grate",
        body: "Double-strain into a chilled coupe. The drink should arrive silky and opaque, a pale brown from the crème de cacao. Grate whole nutmeg over the surface immediately before serving.",
      },
    ],
    ingredients: [
      { measure: "40 ml", name: "VSOP Cognac", note: "Rémy Martin VSOP or Pierre Ferrand 1840" },
      { measure: "20 ml", name: "Dark Crème de Cacao", note: "Marie Brizard or Giffard — dark, not white" },
      { measure: "30 ml", name: "Heavy cream", note: "Full-fat — not half-and-half" },
      { measure: "1 grating", name: "Whole nutmeg", note: "Freshly grated at service — never pre-ground" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.05 },
      { axis: "Sweet", value: 0.72 },
      { axis: "Sour", value: 0.02 },
      { axis: "Herbal", value: 0.22 },
      { axis: "Citrus", value: 0.05 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "The Brandy Alexander is the cocktail that best represents the idea that richness and complexity are not mutually exclusive — that a sweet, creamy drink can also be sophisticated. This idea is unfashionable in certain eras of cocktail culture and quietly correct in all of them. John Lennon understood this. The nutmeg knows.",
    related: ["grasshopper", "stinger", "white-russian"],
  },
  {
    slug: "grasshopper",
    name: "Grasshopper",
    era: "New Orleans, c. 1919",
    origin: "Tujague's Restaurant, New Orleans — Philip Guichet",
    family: "Digestif & Nightcap",
    baseSpirit: "Crème de Menthe",
    glass: "Chilled coupe",
    garnish: "Fresh mint leaf or grated dark chocolate",
    method: "Shaken with cream, double-strained",
    image: "https://images.unsplash.com/photo-1648062876847-b8cc7951f4d5?w=1200&q=80",
    kicker: "Feature Nº 44 — Crème de Menthe",
    deck: "Philip Guichet entered it in a New York cocktail competition around 1919. Second place. The restaurant made it the house drink. It has been there ever since.",
    tagline: "Green, minty, and unashamed. Tujague's longest-running production.",
    history: [
      "Philip Guichet, owner of Tujague's Restaurant on Decatur Street in New Orleans, submitted the Grasshopper to a cocktail competition in New York around 1919. The drink finished second. Guichet returned to New Orleans with the runner-up result and made the Grasshopper the house drink of Tujague's — where it has remained on the menu continuously ever since, a fixture of the restaurant's identity across more than a century of New Orleans dining.",
      "The Grasshopper is green — deeply, unambiguously, unapologetically green — from the green crème de menthe that comprises a third of its three-equal-parts formula. Equal amounts of green crème de menthe, white crème de cacao, and heavy cream produce a drink that looks like the dessert it effectively is: sweet, minty, creamy, and colored like a spring afternoon. In the 1950s and 1960s, when cream cocktails were at their commercial peak, the Grasshopper was one of the most widely ordered after-dinner drinks in the American South.",
      "The Grasshopper's fall from cocktail respectability followed the same trajectory as the Brandy Alexander and most cream cocktails: the craft movement's preference for dry, complex, spirit-forward drinks left the sweet dessert cocktail category largely abandoned. At Tujague's it survived, as house drinks tend to do when the house is committed to them. There is something admirable about a restaurant that placed second in a 1919 competition and served the runner-up for the next hundred years.",
    ],
    tasting:
      "The Grasshopper is exactly what it presents itself as: mint and chocolate and cream, in a glass. The green crème de menthe's peppermint character is immediate and generous, the white crème de cacao adding a soft white-chocolate sweetness beneath it. The cream unites both into something that is more dessert than cocktail in character. The finish is cooling from the mint and sweet from the cacao, with no trace of alcohol until the warmth arrives on the second sip. This is not a complex drink. It is a correct one.",
    bartenderNote: {
      quote:
        "Equal parts, always. Green crème de menthe, white crème de cacao, heavy cream — 22 ml of each. Shake hard: the cream needs the agitation. Double-strain into a coupe that has been chilled to within a degree of frosting. The green should be vivid, the texture should be silky, and the mint should be immediate. Grate dark chocolate over the top. Serve it after dinner or don't serve it at all.",
      attribution: "— Philibert Guichet III, Tujague's, New Orleans",
    },
    technique: [
      {
        title: "Measure equal parts",
        body: "22 ml green crème de menthe, 22 ml white crème de cacao, 22 ml heavy cream. These are not proportions to adjust — the drink is balanced at equality and unbalanced otherwise.",
      },
      {
        title: "Shake and strain",
        body: "Shake vigorously for twelve seconds. The cream needs the agitation to thicken and integrate with the liqueurs. Double-strain into a chilled coupe.",
      },
      {
        title: "Garnish for contrast",
        body: "A grating of dark chocolate over the surface, or a single fresh mint leaf. The green of the drink and the dark of the chocolate, or the green of the mint against the green of the drink — either choice makes a visual statement appropriate for the dessert occasion.",
      },
    ],
    ingredients: [
      { measure: "22 ml", name: "Green Crème de Menthe", note: "Bols or Giffard — the color is part of the drink" },
      { measure: "22 ml", name: "White Crème de Cacao", note: "White, not dark — for a cleaner chocolate note" },
      { measure: "22 ml", name: "Heavy cream", note: "Full-fat only" },
      { measure: "1 grating", name: "Dark chocolate", note: "Optional garnish over the foam" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.02 },
      { axis: "Sweet", value: 0.82 },
      { axis: "Sour", value: 0.02 },
      { axis: "Herbal", value: 0.78 },
      { axis: "Citrus", value: 0.05 },
      { axis: "Strong", value: 0.42 },
    ],
    cultural:
      "The Grasshopper is New Orleans in a narrow but genuine sense — a competition runner-up made into a tradition, a second-place finish turned into a century of service, a drink that exists because one man decided that second place was not a reason to stop. Tujague's has been serving it since 1919. The cocktail world largely moved on. The restaurant did not need its approval.",
    related: ["brandy-alexander", "stinger", "white-russian"],
  },
  {
    slug: "black-russian",
    name: "Black Russian",
    era: "Brussels, 1949",
    origin: "Hotel Metropole, Brussels — Gustave Tops",
    family: "Digestif & Nightcap",
    baseSpirit: "Vodka",
    glass: "Rocks, over ice",
    garnish: "None",
    method: "Built over ice — vodka first, then Kahlúa",
    image: "https://images.unsplash.com/photo-1559628129-67cf63b72248?w=1200&q=80",
    kicker: "Feature Nº 45 — Vodka",
    deck: "Gustave Tops made it at the Hotel Metropole in 1949 for the American ambassador to Luxembourg. Two ingredients. One of the cleaner results in the canon.",
    tagline: "Vodka and Kahlúa. The bartender's most defensible simplicity.",
    history: [
      "Gustave Tops, head bartender at the Hotel Metropole in Brussels, created the Black Russian in 1949 for Perle Mesta, the American socialite and political hostess who had recently been appointed US Ambassador to Luxembourg. The drink was designed for the occasion — Mesta's American preference for vodka combined with Tops's knowledge of the coffee liqueur that had become fashionable in European bar culture. The result was a two-ingredient drink of clarity and purpose.",
      "The name reflects the geopolitical climate of 1949 — the early Cold War, the Soviet Union's association with vodka, and the color of the drink, which is dark brown from the Kahlúa against the colorless vodka. The 'Russian' component acknowledges the vodka's national mythology; the 'Black' describes what the coffee liqueur contributes to the glass. It is a name that contains its recipe.",
      "The Black Russian preceded and produced the White Russian — the addition of cream to the two base components that created a drink that shared its architecture but not its character. The White Russian became more famous through popular culture in the late twentieth century, but the Black Russian remained the more austere, more direct version: spirit and coffee, no softening, no dilution beyond the ice. It is the drink for the end of the evening when the end is not yet in sight.",
    ],
    tasting:
      "The Black Russian is vodka and coffee liqueur — no mediation, no complexity beyond what two ingredients provide. The Kahlúa's roasted coffee sweetness arrives first, the vodka providing the alcohol structure beneath it. On ice, the cold softens the Kahlúa's sweetness slightly and makes the coffee character read as something more austere than a warm pour would. The finish is long and sweet, the coffee persisting after the vodka has faded. It is an honest drink.",
    bartenderNote: {
      quote:
        "Two ingredients, poured over ice in a rocks glass, in a 2:1 ratio — 50 ml vodka to 25 ml Kahlúa. No stir needed; the ice will do the work. The quality of the Kahlúa matters significantly — cheap coffee liqueurs are sickly sweet and one-dimensional. Mr. Black is an excellent contemporary alternative with real coffee depth. No garnish. No explanation required.",
      attribution: "— Gustave Tops, Hotel Metropole, Brussels",
    },
    technique: [
      {
        title: "Build over ice",
        body: "Fill a rocks glass with large ice cubes. Add 50 ml vodka directly over the ice.",
      },
      {
        title: "Add the Kahlúa",
        body: "Pour 25 ml Kahlúa over the vodka. The darker, denser Kahlúa will descend through the vodka and settle at the bottom. A brief, gentle stir with a bar spoon integrates the two without losing the drink's cold temperature.",
      },
      {
        title: "Serve without decoration",
        body: "No garnish. The Black Russian is a drink that does not require ornamentation and would not benefit from it. The dark liquid against the clear ice is sufficient.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Vodka", note: "Clean and neutral — Ketel One or Absolut" },
      { measure: "25 ml", name: "Kahlúa", note: "Or Mr. Black for more coffee intensity" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.25 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.02 },
      { axis: "Herbal", value: 0.1 },
      { axis: "Citrus", value: 0.02 },
      { axis: "Strong", value: 0.75 },
    ],
    cultural:
      "The Black Russian was made for an American ambassador in a Belgian hotel in the first year of the Cold War, and it carries the weight of that moment in its name. The geopolitics of 1949 are very distant from a rocks glass at the end of a long evening. The drink, stripped of its historical context, is simply vodka and coffee, cold and dark and final. This is enough.",
    related: ["white-russian", "espresso-martini", "stinger"],
  },
  {
    slug: "white-russian",
    name: "White Russian",
    era: "Belgium, c. 1965",
    origin: "An adaptation of the Black Russian — exact origin unrecorded",
    family: "Digestif & Nightcap",
    baseSpirit: "Vodka",
    glass: "Rocks, over ice",
    garnish: "None — or a single coffee bean",
    method: "Built over ice, cream floated gently on top",
    image: "https://images.unsplash.com/photo-1671536055547-99f21db6e297?w=1200&q=80",
    kicker: "Feature Nº 46 — Vodka",
    deck: "The Black Russian with cream. The Dude's drink. A film and a float changed the entire reception of a sixty-year-old recipe.",
    tagline: "That's just, like, your opinion. The cream is not.",
    history: [
      "The White Russian is the Black Russian with cream — a modification so simple that it likely occurred to multiple bartenders independently in the years following the Black Russian's 1949 creation. The name follows the same logic as its predecessor: the 'White' refers to the cream that replaces the dark drink's color with a pale, clouded layer. The exact first instance of this preparation is unrecorded and probably unrecoverable.",
      "The drink circulated in European and American bar culture through the 1960s and 1970s as a straightforward dessert cocktail — sweet, creamy, easy to like, not particularly notable in a decade of cream cocktails. Its position in the cocktail hierarchy was unremarkable. Then, in 1998, Joel and Ethan Coen cast Jeff Bridges as Jeffrey 'The Dude' Lebowski, who consumed White Russians with a frequency that the film documented across nine separate instances. The Dude called them 'Caucasians.' The bar world called them a suddenly relevant drink.",
      "The Big Lebowski's effect on the White Russian was disproportionate in every sense — a single film character's preference elevated a middling cocktail into a cultural reference that has persisted for a quarter century. The drink is still ordered in the same quantities as before, by the same kinds of people, but it is now also ordered by people who have seen the film and by people who have not seen the film but know that a character in it drank this. It is the cocktail most completely shaped by a single piece of cinema.",
    ],
    tasting:
      "The White Russian is its components in sequence: vodka's clean heat first, then Kahlúa's coffee sweetness, then the cream's fat richness softening and diffusing the whole structure. The three layers integrate slowly as the drink is consumed — the cream descending through the coffee liqueur and vodka, each sip a slightly different ratio of the three. The finish is sweet, warm, and faintly roasted, the coffee note persisting beneath the cream's richness.",
    bartenderNote: {
      quote:
        "Float the cream over the back of a bar spoon so it sits on the surface in a distinct white layer. The drink should show its three components visually — vodka at the bottom, Kahlúa in the middle, cream on top. The drinker stirs it themselves, or doesn't, which changes the drink across its duration. The ratio is 2:1:1 — 50 ml vodka, 25 ml Kahlúa, 25 ml cream. The Dude, presumably, did not measure.",
      attribution: "— Eben Klemm, B.R. Guest, New York",
    },
    technique: [
      {
        title: "Build the base",
        body: "Fill a rocks glass with large ice cubes. Add 50 ml vodka and 25 ml Kahlúa. Stir briefly to combine.",
      },
      {
        title: "Float the cream",
        body: "Hold a bar spoon face-down over the surface of the drink. Pour 25 ml of heavy cream slowly over the back of the spoon so it floats in a distinct layer on top of the coffee liqueur.",
      },
      {
        title: "Serve as presented",
        body: "Deliver the drink with the cream float intact. The drinker may stir it themselves. Do not pre-stir — the visual layering and the evolving ratio as the cream integrates are part of the experience.",
      },
    ],
    ingredients: [
      { measure: "50 ml", name: "Vodka", note: "Clean and neutral" },
      { measure: "25 ml", name: "Kahlúa", note: "Or Mr. Black" },
      { measure: "25 ml", name: "Heavy cream", note: "Floated on top over the back of a spoon" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.2 },
      { axis: "Sweet", value: 0.65 },
      { axis: "Sour", value: 0.02 },
      { axis: "Herbal", value: 0.1 },
      { axis: "Citrus", value: 0.02 },
      { axis: "Strong", value: 0.65 },
    ],
    cultural:
      "The White Russian exists in two cultural registers simultaneously: the pre-1998 version, which was a dessert cocktail ordered quietly in hotel bars, and the post-Lebowski version, which is ordered with a certain knowing reference to a film about a man who prioritizes the drink above almost everything else. Both versions are the same drink. The context changes what it means to order it, which is true of very few things and almost no other cocktails.",
    related: ["black-russian", "brandy-alexander", "espresso-martini"],
  },

  // ─── Champagne & Wine ─────────────────────────────────────────────────────
  {
    slug: "kir-royale",
    name: "Kir Royale",
    era: "Dijon, c. 1945 (Kir) — Royale variant c. 1960s",
    origin: "Burgundy, France — Canon Félix Kir, Mayor of Dijon",
    family: "Champagne & Wine",
    baseSpirit: "Champagne or Crémant de Bourgogne",
    glass: "Champagne flute",
    garnish: "Fresh blackcurrant or a twist of lemon peel",
    method: "Crème de cassis first, then champagne poured gently over it",
    image: "https://images.unsplash.com/photo-1677023580982-13706932f9be?w=1200&q=80",
    kicker: "Feature Nº 47 — Champagne",
    deck: "A Burgundy mayor, a blackcurrant liqueur, and a habit of hospitality that became, with champagne, something considerably more elegant.",
    tagline: "Cassis and champagne. Burgundy's most diplomatic gesture.",
    history: [
      "Félix Kir was the Mayor of Dijon from 1945 to 1968 and, before that, a Canon of the Catholic Church who had organized resistance against the German occupation of Burgundy. He was also a tireless advocate for the regional products of his corner of France. The drink that bears his name was not invented by him but popularized by his habit of serving it at every official municipal reception — a combination of Bourgogne Aligoté, the local white wine, and crème de cassis, the blackcurrant liqueur produced from the cassis grown in the Burgundy hills.",
      "The drink had existed in Burgundy before Kir — it was known as Blanc-Cassis or Rince-Cochon ('rinse the pig') in local bars — but Kir's mayoral hospitality gave it a dignity and consistency that transformed it from a local habit into a named institution. When the Aligoté is replaced with champagne, the drink becomes the Kir Royale, an upgrade that arrived sometime in the 1960s and produced a drink suitable for occasions more formal than a Dijon municipal reception.",
      "The Kir Royale is the most forgiving of champagne cocktails — the cassis's sweetness and fruit compensating for champagne that is merely good rather than exceptional, the combination working across a wide range of both components. It is the drink of aperitif hours in France, served in the early evening when the cheese has not yet arrived but the celebration has already begun. Its color — a luminous rose-to-crimson depending on the cassis proportion — is inseparable from the drink's identity.",
    ],
    tasting:
      "The Kir Royale opens with champagne's effervescence carrying the cassis's blackcurrant fragrance into the nose — a fruity, slightly jammy sweetness that is immediately balanced by the wine's acidity. The first sip is sparkling and bright, the berry character of the cassis threading through the champagne's mineral dryness. The finish is long and fruity, the blackcurrant lingering after the champagne has disappeared. The proportion of cassis determines whether the drink is delicate or assertive — the balance is in the pour.",
    bartenderNote: {
      quote:
        "15 ml of crème de cassis in the flute before the champagne — not more, not less. Too much cassis and the drink becomes sweet and heavy; too little and it is pink champagne with an idea attached. The cassis must be quality — Dijon cassis from Védrenne or Gabriel Boudier, made from the Noir de Bourgogne blackcurrant. Everything else in the flute is champagne's job.",
      attribution: "— Olivier Bon, Experimental Cocktail Club, Paris",
    },
    technique: [
      {
        title: "Cassis first",
        body: "Pour 15 ml crème de cassis into the bottom of a chilled champagne flute. The cassis goes first so the champagne distributes it as it rises.",
      },
      {
        title: "Add champagne gently",
        body: "Pour 120 ml of cold dry champagne slowly down the inside of the flute. The cassis will rise through the wine in a swirl of color before settling into a gradient. Do not stir.",
      },
      {
        title: "Garnish minimally",
        body: "A single fresh blackcurrant dropped in, or a thin lemon twist expressed over the surface and rested on the rim. The drink's color is its primary visual element and needs no further ornament.",
      },
    ],
    ingredients: [
      { measure: "15 ml", name: "Crème de Cassis", note: "Dijon blackcurrant — Védrenne or Gabriel Boudier" },
      { measure: "120 ml", name: "Dry Champagne", note: "Brut — or Crémant de Bourgogne for regional authenticity" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.1 },
      { axis: "Sweet", value: 0.55 },
      { axis: "Sour", value: 0.22 },
      { axis: "Herbal", value: 0.15 },
      { axis: "Citrus", value: 0.3 },
      { axis: "Strong", value: 0.32 },
    ],
    cultural:
      "The Kir Royale is the drink of a particular French ceremony — the official reception, the gallery opening, the dinner party at the moment before the table is set. It is served from trays by people who carry it without spilling, on occasions that require something festive but not committal. Canon Kir, who served the Aligoté version at every municipal event for twenty years, understood the drink's function: it signals welcome, it does not demand anything in return.",
    related: ["bellini", "mimosa", "french-75"],
  },
  {
    slug: "bellini",
    name: "Bellini",
    era: "Venice, c. 1934",
    origin: "Harry's Bar, Venice — Giuseppe Cipriani",
    family: "Champagne & Wine",
    baseSpirit: "Prosecco",
    glass: "Champagne flute",
    garnish: "None",
    method: "White peach purée first, then prosecco — poured gently, never stirred",
    image: "https://images.unsplash.com/photo-1601477575182-528c9de1ea27?w=1200&q=80",
    kicker: "Feature Nº 48 — Prosecco",
    deck: "Giuseppe Cipriani named it for the golden-pink glow of a Venetian Renaissance painting. The peach was seasonal. The drink became eternal.",
    tagline: "White peach, prosecco, and a painter from the Venetian school.",
    history: [
      "Giuseppe Cipriani opened Harry's Bar in Venice in 1931 with money loaned by an American patron named Harry Pickering — a gesture of hospitality that Cipriani repaid by naming the bar for the man who made it possible. The Bellini was created there sometime around 1934, when white peaches from the Veneto's summer harvest were pressed into a purée and combined with prosecco. Cipriani named the drink for Giovanni Bellini, the fifteenth-century Venetian painter whose use of a particular golden-rose hue in his work reminded Cipriani of the color the peach purée turned the prosecco.",
      "Harry's Bar became, across the middle decades of the twentieth century, the most celebrated bar in the world — a place where Hemingway drank and Truman Capote wrote and Orson Welles ate and the Bellini was served with the precise seasonal rectitude that Cipriani imposed. White peaches were available for only a few weeks each summer; outside of that window, the Bellini was not on the menu. This seasonal commitment gave the drink a quality of anticipation that most cocktails cannot manufacture.",
      "The commercial availability of white peach purée in shelf-stable form allowed the Bellini to spread beyond Venice and beyond summer — a democratization that Arrigo Cipriani, Giuseppe's son, has consistently and publicly resisted. The Cipriani family's position is that a Bellini made with anything other than fresh Venetian white peaches in season is not a Bellini. This is correct as a matter of origin and irrelevant as a matter of the hundreds of thousands of Bellinis consumed daily in cities with no access to Venetian peaches.",
    ],
    tasting:
      "The Bellini, made correctly, is peach before it is wine — the white peach's fragrant sweetness preceding the prosecco's effervescence into the nose. The first sip is light and slightly sweet, the peach's natural sugar amplified by the prosecco's soft fruitiness. The bubbles carry the peach character into a brightness that still juice would not achieve. The finish is delicate and very short — this is a drink of impressions rather than statements, designed to open the appetite rather than satisfy it.",
    bartenderNote: {
      quote:
        "Fresh white peach purée, strained, at room temperature — not cold, which would stop the prosecco's bubbles from rising properly. Two parts prosecco to one part purée. Pour the prosecco first if you want the color to develop gradually; pour the purée first if you want it distributed evenly. Do not stir under any circumstances. The drink integrates itself through the carbonation. A stir produces a flat, uniform drink that is not a Bellini.",
      attribution: "— Arrigo Cipriani, Harry's Bar, Venice",
    },
    technique: [
      {
        title: "Prepare the peach purée",
        body: "Blanch, peel, and pit fresh white peaches in season. Blend and strain through a fine mesh. The purée should be smooth and fragrant, at room temperature before use.",
      },
      {
        title: "Build in the flute",
        body: "Add 45 ml white peach purée to a chilled champagne flute. Pour 90 ml dry prosecco gently down the inside of the flute. The prosecco will rise through the purée, the two combining in a gradient of pale gold to peach.",
      },
      {
        title: "Never stir",
        body: "The carbonation does the work of integration. Stirring collapses the bubbles and produces a flat, uniform drink. The Bellini's charm is partly in watching it assemble itself.",
      },
    ],
    ingredients: [
      { measure: "45 ml", name: "White peach purée", note: "Fresh, in season — or Cipriani's commercial purée out of season" },
      { measure: "90 ml", name: "Dry Prosecco", note: "Extra Dry or Brut — the Bellini requires the Veneto's native sparkling wine" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.02 },
      { axis: "Sweet", value: 0.62 },
      { axis: "Sour", value: 0.15 },
      { axis: "Herbal", value: 0.05 },
      { axis: "Citrus", value: 0.2 },
      { axis: "Strong", value: 0.28 },
    ],
    cultural:
      "The Bellini is inseparable from a particular idea of Venice: the light on the lagoon, the morning at Harry's Bar before the tourists have arrived, the seasonal white peach that comes and goes and makes the drink scarce enough to be anticipated. That it is now made year-round in bars on every continent using shelf-stable purée is not Venice's problem. The original remains available to those willing to go to the source in August.",
    related: ["kir-royale", "mimosa", "french-75"],
  },
  {
    slug: "mimosa",
    name: "Mimosa",
    era: "Paris, 1925",
    origin: "Hotel Ritz, Paris — Frank Meier",
    family: "Champagne & Wine",
    baseSpirit: "Champagne",
    glass: "Champagne flute",
    garnish: "None",
    method: "Equal parts chilled orange juice and cold champagne — champagne last",
    image: "https://images.unsplash.com/photo-1646588777864-c3f8ca590f0d?w=1200&q=80",
    kicker: "Feature Nº 49 — Champagne",
    deck: "Frank Meier of the Ritz Paris in 1925. Equal parts. By the time it crossed the Atlantic, it had become the defining drink of Sunday morning in America.",
    tagline: "Orange juice and champagne. The drink that colonized brunch.",
    history: [
      "Frank Meier, the Ritz Paris's head barman from 1921 to 1944, created the Mimosa in 1925, combining equal parts fresh orange juice and champagne in a flute. The name came from the mimosa flower — Acacia dealbata, the yellow blossoming tree of the French Riviera whose color matched the drink's gold-orange hue. A Buck's Fizz, created at Buck's Club in London around the same time, differs in using a 2:1 champagne-to-juice ratio, producing a drier, more wine-forward drink. The two have coexisted as the same drink with different proportions for a century.",
      "The Mimosa crossed the Atlantic and found its permanent home in American brunch culture — a meal that did not formally exist as a category when the drink was invented. As brunch established itself across the United States in the 1970s and 1980s as the meal between breakfast and lunch on weekends, the Mimosa positioned itself as its defining alcohol. It was easy to make in quantity, low enough in alcohol to be consumed before noon without social comment, and orange-flavored in a way that suggested breakfast while containing champagne in a way that suggested celebration.",
      "The Mimosa's cultural ubiquity has made it, in some precincts, the least interesting drink in the champagne cocktail category — a reflex order rather than a considered choice. This assessment misses what the drink does well: it is genuinely refreshing, genuinely appropriate to the morning occasion, and genuinely better made with fresh orange juice than with anything from a carton. At its best, a Mimosa is a precise, honest drink. At its worst, it is bottomless and accompanied by a prix fixe.",
    ],
    tasting:
      "A Mimosa made with fresh orange juice and quality champagne opens with orange's bright, citrus sweetness, lifted by the wine's effervescence into something more aromatic than still juice would produce. The champagne's acidity balances the orange's natural sugar, and the two combine into a flavor that is more complex than either alone. The finish is clean, citrus-forward, and very refreshing — the drink's achievement is simplicity executed precisely.",
    bartenderNote: {
      quote:
        "Fresh orange juice, squeezed within thirty minutes of service. Cold champagne from the bottle, not the glass. Equal parts — not the 3:1 ratio that most brunch establishments use, which produces something closer to Fanta than Mimosa. Champagne last, poured slowly. No garnish. The drink does not require improvement; it requires juice that deserves the champagne it is about to meet.",
      attribution: "— Frank Meier, Hotel Ritz, Paris",
    },
    technique: [
      {
        title: "Squeeze fresh juice",
        body: "Fresh orange juice, squeezed within thirty minutes. Strain to remove pulp. Refrigerate until ice-cold — the juice and the champagne must be at the same temperature.",
      },
      {
        title: "Fill the flute in order",
        body: "Pour 60 ml fresh orange juice into a chilled champagne flute. Add 60 ml cold dry champagne poured down the inside of the glass. Equal parts.",
      },
      {
        title: "Serve immediately",
        body: "The Mimosa does not wait. The carbonation begins to dissipate from the moment the champagne meets the juice. The window for a perfect Mimosa is approximately four minutes.",
      },
    ],
    ingredients: [
      { measure: "60 ml", name: "Fresh orange juice", note: "Squeezed within thirty minutes — never from a carton" },
      { measure: "60 ml", name: "Dry Champagne", note: "Brut — or Cava or Crémant for budget-appropriate substitution" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.02 },
      { axis: "Sweet", value: 0.48 },
      { axis: "Sour", value: 0.22 },
      { axis: "Herbal", value: 0.02 },
      { axis: "Citrus", value: 0.68 },
      { axis: "Strong", value: 0.28 },
    ],
    cultural:
      "The Mimosa is the drink that owns Sunday morning in the United States. It is consumed in quantities that no other champagne cocktail approaches, in contexts that Frank Meier would not recognize, at prices that the Hotel Ritz would consider generous. It has escaped its origins entirely and become a category unto itself — the Mimosa as brunch's required element, the orange juice and champagne as inseparable from eggs and late morning as they are from each other.",
    related: ["bellini", "kir-royale", "french-75"],
  },
  {
    slug: "death-in-the-afternoon",
    name: "Death in the Afternoon",
    era: "Paris / Key West, 1935",
    origin: "Published by Ernest Hemingway in 'So Red the Nose, or Breath in the Afternoon'",
    family: "Champagne & Wine",
    baseSpirit: "Absinthe",
    glass: "Champagne coupe or flute",
    garnish: "None",
    method: "Absinthe in the glass, champagne added until the drink louches to an opalescent cloud",
    image: "https://images.unsplash.com/photo-1577067831507-181871336589?w=1200&q=80",
    kicker: "Feature Nº 50 — Absinthe",
    deck: "Hemingway published the recipe himself. He named it for his book about bullfighting. He recommended three to five, slowly. He was not wrong.",
    tagline: "Pour until it clouds. Drink slowly. Repeat as necessary.",
    history: [
      "Ernest Hemingway contributed a recipe to the 1935 celebrity cocktail compendium So Red the Nose, or Breath in the Afternoon — a volume in which famous authors each provided a drink recipe and instructions. Hemingway's entry was characteristically direct: 'Pour one jigger absinthe into a Champagne glass. Add iced Champagne until it attains the proper opalescent milkiness. Drink three to five of these slowly.' He named the drink after his 1932 book about the aesthetics of Spanish bullfighting.",
      "The louche — the phenomenon by which the addition of water (or champagne, in this case) to absinthe produces a milky, opalescent cloud — is one of the most visually distinctive effects in the cocktail world. It occurs because the essential oils in absinthe, which are soluble in alcohol, become insoluble in the diluted solution and precipitate as a suspension of microscopic droplets. The drink turns from clear yellow-green to milky white as the champagne is added — a transformation that happens slowly enough to watch.",
      "Absinthe's history as a regulated or banned spirit in most Western countries through most of the twentieth century meant that the Death in the Afternoon was largely unmakeable for decades — a recipe from a famous author for a drink that required an ingredient that was not legally available. The lifting of absinthe bans in the early 2000s restored access to the spirit, and with it the ability to make the drink that Hemingway described in 1935. Three to five remains the recommendation. The instruction to drink them slowly remains the advice most frequently not followed.",
    ],
    tasting:
      "The Death in the Afternoon arrives as two drinks simultaneously. The first is the absinthe alone — herbal, anise-forward, with the complex botanical character of the grand wormwood, green anise, and fennel that define the spirit. Then the champagne enters and the louche begins: the drink clouds from yellow-green to pale opalescent white, the champagne's acidity lifting the anise into the nose in a different register. The resulting drink is lighter than absinthe alone, more complex than champagne alone, and unlike anything else in the champagne cocktail category. The finish is long, herbal, and faintly sharp — the absinthe persisting through the wine.",
    bartenderNote: {
      quote:
        "The louche is not a visual trick — it is the drink announcing itself. Pour 30 ml of quality absinthe into a chilled coupe. Add cold champagne slowly, watching the louche develop. Stop when the drink is opalescent — not before, not after. The quantity of champagne will vary with the absinthe's proof and botanical intensity. Hemingway said three to five. Start with one and assess.",
      attribution: "— T.A. Breaux, Jade Liqueurs, New Orleans",
    },
    technique: [
      {
        title: "Chill the glass",
        body: "A chilled coupe matters here — the louche is more dramatic when the drink arrives cold, and the absinthe's aromatics are more controlled at low temperatures. Refrigerate the glass for at least fifteen minutes.",
      },
      {
        title: "Pour the absinthe",
        body: "Add 30 ml of quality absinthe to the chilled coupe. The absinthe should be clear yellow-green at this stage. Use a Swiss or French absinthe with genuine botanical complexity — Pernod Absinthe or Jade 1901.",
      },
      {
        title: "Add champagne and watch",
        body: "Pour cold dry champagne slowly into the absinthe. As the champagne enters, the louche will begin — the drink turning from clear to opalescent. Pour until the drink is fully clouded and pale. The total champagne is approximately 120 ml, but follow the louche rather than the measure.",
      },
    ],
    ingredients: [
      { measure: "30 ml", name: "Absinthe", note: "Quality Swiss or French — Pernod Absinthe or Jade 1901" },
      { measure: "120 ml", name: "Dry Champagne", note: "Brut — poured slowly until the drink louches" },
    ],
    flavor: [
      { axis: "Bitter", value: 0.32 },
      { axis: "Sweet", value: 0.28 },
      { axis: "Sour", value: 0.08 },
      { axis: "Herbal", value: 0.92 },
      { axis: "Citrus", value: 0.12 },
      { axis: "Strong", value: 0.72 },
    ],
    cultural:
      "The Death in the Afternoon is one of the rare drinks whose recipe was published by the person who invented it — no bartender's attribution, no apocryphal origin story, no disputed authorship. Hemingway wrote it down, named it, and recommended a quantity. The drink is a document as much as a recipe: a window into the sensibility of a writer who regarded absinthe and champagne together as reasonable, and three to five of them slowly as something close to a prescription.",
    related: ["french-75", "kir-royale", "sazerac"],
  },
];

export const getCocktail = (slug) => cocktails.find((c) => c.slug === slug);
export const getRelated = (slugs) =>
  slugs.map((s) => getCocktail(s)).filter((c) => !!c);
