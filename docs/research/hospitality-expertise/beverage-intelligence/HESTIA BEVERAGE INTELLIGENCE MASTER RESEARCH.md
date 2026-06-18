# **HESTIA: SYSTEM ARCHITECTURE AND BEVERAGE INTELLIGENCE ONTOLOGY**

## **What is Beverage Intelligence?**

True beverage intelligence represents a multi-dimensional domain of knowledge that integrates physical chemistry, history, sensory analysis, fiscal-operational mechanics, and behavioral psychology1. Traditional hospitality systems treat beverages as a flat database of recipes—simple lists of ingredients with volumes3. In contrast, expert-level beverage intelligence treats every beverage as a dynamic, context-aware chemical and financial system4. This paradigm shift requires representing drinks as flexible structures that adapt to changes in inventory, staff skill, guest preferences, and venue identity4.

                 ┌────────────────────────────────────────┐  
                 │       LEVELS OF COCKTAIL KNOWLEDGE    │  
                 └───────────────────┬────────────────────┘  
                                     │  
      ┌──────────────────────────────┼──────────────────────────────┐  
      ▼                              ▼                              ▼  
┌───────────┐                  ┌───────────┐                  ┌───────────┐  
│  Recipe   │                  │ Structural│                  │ Operations│  
│ Database  │                  │ Template  │                  │  Systems  │  
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘  
      │                              │                              │  
      │ Static list of               │ Dynamic ratios of            │ Costing, yield,    
      │ ingredients, volume          │ spirit, acid, and sugar;     │ batch stability,  
      │ specs, and garnishes.        │ molecular balances \[20\].     │ and labor \[11, 25\].

To build an artificial intelligence operating system capable of matching an elite Beverage Director, the system must distinguish between different levels of knowledge:

* **Knowing Cocktail Recipes**: Memorizing a list of ingredients and step-by-step instructions. This level of understanding is static and fails when an ingredient is out of stock, a cost threshold is crossed, or a guest requests a modification.  
* **Understanding Cocktail Structure**: Recognizing that cocktails are built on balanced ratios of base spirits, modifying agents, acids, sugars, and diluting water3. This structural approach allows the system to scale recipes, adjust proofs, and modify sweetness or acidity without destroying the drink's identity5.  
* **Understanding Spirits**: Categorizing spirits by their raw materials, fermentation chemistry, distillation mechanics, wood aging reactions, and regional history10. This chemical and historical understanding enables accurate flavor substitutions10.  
* **Understanding Flavor**: Analyzing flavor through key volatile aroma compounds, taste-to-taste interactions, and physical textures1. This sensory approach guides successful food pairings and creative cocktail development1.  
* **Understanding Bar Operations**: Managing prep workflows, batch consistency, storage shelf lives, service speeds, and station ergonomics6. This ensures a cocktail is physically realistic to execute during peak volume.  
* **Understanding Menu Engineering**: Balancing contribution margins, item popularity, category sales, and supplier programs to maximize total gross profit4.  
* **Understanding Guest Preference**: Adapting flavor profiles, alcohol levels, and presentations to match a guest's demographic background, dining occasion, or dietary needs8.  
* **Understanding Venue Fit**: Aligning beverage offerings with a venue's style, service speed, equipment, and financial targets7.

Within the hospitality hierarchy, distinct transitions define a professional's growth:

* **Beginner Bartender**: Focuses on memorizing recipes, mastering basic physical techniques, and maintaining station cleanliness15.  
* **Professional Bartender**: Understands basic dilution mechanics, executes drink techniques consistently, and manages service speed during moderate rushes9.  
* **Senior Bartender**: Master of raw material profiles, understands classic cocktail families, executes basic prep infusions, and tailors recommendations to guest preferences2.  
* **Bar Manager**: Manages back-of-house operations, schedules labor, monitors inventory levels, tracks waste, coordinates with suppliers, and maintains safety compliance7.  
* **Beverage Director**: Designs long-term menu strategies, engineers pricing models, coordinates supplier contracts, establishes training programs, and balances overall pour costs against guest satisfaction4.  
* **World-Class Cocktail Creator**: Integrates flavor chemistry, culinary techniques, and cultural history to design innovative sensory experiences that remain operationally and financially sound2.

A great Beverage Director uses a wide range of operational data to make decisions. This includes tracking distributor allocations, calculating bulk pour costs, monitoring seasonal changes in fresh citrus, assessing back-of-house prep labor capacity, and reviewing glassware par levels5. Beyond the glass, elite bar intelligence manages regulatory compliance, liquor licensing, age verification systems, camera surveillance, staff training programs, and overall safety7.

## **Spirits Knowledge Architecture**

To enable an AI system to reason about substitutions, flavor profiles, and financial structures, spirits must be represented as complex, multi-dimensional objects with defined inheritance paths10. Rather than treating a bottle as a simple text label, the system must analyze its chemical components, production history, and market positioning10.

| Spirits Category | Raw Materials | Fermentation Parameters | Distillation Mechanics | Maturation & Wood Chemistry | Regional / Legal Classifications | Key Aroma & Flavor Compounds | Common Misconceptions | Cocktail & Sipping Applications | Quality & Value Logic | Substitution & Storage Rules |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Scotch (Single Malt)** | 100% Malted Barley10 | 48–120 hours, Saccharomyces cerevisiae | Double Batch Pot Distillation | Minimum 3 years in oak casks11 | Scotch Whisky Regulations 200910 | Guaiacol, Syringol (smoky peat); Oak Lactones22 | Peated scotch is always harsh and cannot be used in balanced cocktails. | Penicillin cocktail; neat tasting in Copita glassware15 | Age statement vs. NAS; single cask vs. blended malt10 | Sub: Japanese single malt. Store: Upright, cool, dark. |
| **Bourbon** | Minimum 51% Corn11 | 72–96 hours, Sour mash process | Column Still \+ Doubler | New charred American oak barrels11 | US Federal Standards of Identity11 | Vanillin, Furfural, Guaiacol22 | All bourbon must be made in Kentucky to be legally authentic. | Old Fashioned, Boulevardier; neat or on a large ice rock | Mash bill percentages; straight designation11 | Sub: High-rye Bourbon or Rye. Store: Cool, dark. |
| **Rye Whiskey** | Minimum 51% Rye | 72–96 hours, acidic yeast culture | Column Still \+ Doubler | New charred American oak barrels | US Federal Standards of Identity | Vinyl guaiacol (black pepper, clove), Eugenol | Rye is simply a spicier version of bourbon with no distinct category rules. | Manhattan, Sazerac; sipping over block ice | Straight designation; age statements; artisanal millings | Sub: Canadian whisky or high-rye bourbon. Store: Cool, dark. |
| **Irish Whiskey** | Malted and unmalted barley | 48–72 hours, washback fermentation | Triple distillation (Pot or Column) | Minimum 3 years in wood casks11 | Irish Whiskey Act 1980 | Ethyl esters (fruity, apple), Amyl alcohol | Irish whiskey is always triple-distilled, light, and unpeated. | Irish Coffee, Tipperary; sipping neat | Single Pot Still vs. Blended vs. Single Grain | Sub: Lowland Scotch or unpeated Japanese whisky. Store: Upright. |
| **Japanese Whisky** | Malted barley, corn, wheat | Variable, distinct temperature profiles | Double Pot Still, unique shapes | Oak casks (including Mizunara oak) | Japan Spirits & Liqueurs Makers Assoc. | Mizunara lactone (sandalwood, coconut), Vanillin | Japanese whisky is always sourced and distilled within Japan10. | Highball (with high carbonation); neat tasting10 | Distilled age statement vs. world-blended categories | Sub: Scotch Single Malt (Speyside)10. Store: Upright. |
| **Cognac** | Minimum 90% Ugni Blanc grapes | Wild yeast, no sulfites added | Double copper pot Charentais distillation | Oak casks (Limousin or Tronçais) | AOC Cognac regulation | Beta-damascenone (cooked fruit, floral), Octanol | Cognac is a generic brandy that lacks strict production laws10. | Sidecar, French 75; sipping in tulip glasses | VS, VSOP, XO, Extra designations based on youngest eau-de-vie | Sub: Armagnac or high-quality Spanish brandy. Store: Upright. |
| **Armagnac** | Baco, Ugni Blanc, Folle Blanche | Wild yeast, low-temperature fermentation | Single continuous Alambic Armagnacais distillation | French oak casks | AOC Armagnac regulation | Furfural, Isovaleraldehyde (hazelnut, dry fruit) | Armagnac is identical to Cognac but produced by different brands. | Old Fashioned variations; neat digestive tasting | Vintage-dated releases vs. blended star counts | Sub: Cognac (VSOP/XO) or Calvados. Store: Upright. |
| **Rum (Industrial)** | Sugarcane Molasses | 24–48 hours, high-yield yeasts | Continuous multi-column distillation | Variable aging in ex-bourbon casks | Regional laws (e.g., GI Jamaica, Demerara) | Ethyl butyrate (fruity esters), Isoamyl acetate | Rum always contains added sugar and is universally sweet. | Daiquiri, Piña Colada; light sipping | Distillation proof; ester levels; age statements | Sub: White rum or light Cachaca. Store: Cool, dark. |
| **Rhum Agricole** | Fresh sugarcane juice20 | 36–48 hours, wild or targeted yeasts | Creole column distillation | Unaged (Blanc) or oak casks (Élevé sous bois) | Martinique AOC | Ethyl decanoate, Terpenes (grassy, fresh cut cane) | Rhum Agricole is just a French brand name for molasses rum. | Ti' Punch, Mai Tai modifier; sipping neat | AOC certification; cane varietal distillation profiles | Sub: Cachaca or high-ester white rum. Store: Cool, dark. |
| **Tequila (100% Agave)** | Blue Weber Agave | 72–120 hours, yeast with agave fibers | Double Pot Distillation | Blanco (none), Reposado (2-12m), Añejo (1-3y)19 | DOT (Declaration of Protection of Tequila)19 | Terpenes, Ethyl L-lactate, Isovaleraldehyde | Gold tequila is aged and of higher quality than silver19. | Margarita, Paloma; neat tasting in Riedel Tequila glass | Autoclave vs. Horno cooking; Tahona extraction19 | Sub: Mezcal (low smoke) or Sotol. Store: Cool, dark. |
| **Mezcal** | Cultivated or wild agave (Espadín) | Wild yeast, open-air wooden vats | Copper pot, clay pot, or artisanal still | Unaged (Joven) or short oak cask | DOT Mezcal regulation | Guaiacol, Caryophyllene, Syringol (smoky, earthy)22 | Mezcal is simply a cheap, harsh tequila with a worm in the bottle. | Mezcal Margarita, Naked & Famous; sipping from copitas | Agave maturity years; artisanal vs. ancestral distillation | Sub: Raicilla or smoky tequila. Store: Cool, dark. |
| **Gin (London Dry)** | Neutral grain spirit with botanicals | Fast, high-proof neutral wash | Pot still redistillation with botanical basket | Unaged | EU Spirit Drink Regulations10 | Alpha-pinene (juniper), Limonene, Linalool10 | Gin is always harsh, tastes like pine trees, and cannot be sipped neat. | Martini, Negroni, Gimlet, Tom Collins10 | Botanical quality; neutral spirit purification standard | Sub: Plymouth Gin or Gin (Western style). Store: Cool, dark. |
| **Vodka** | Corn, wheat, potatoes, grapes | Fast, highly efficient yeast wash | Column distillation (minimum ![][image1]) | Unaged | US and EU standards | Ethyl acetate (clean, subtle sweetness) | Vodka is completely odorless, tasteless, and has no terroir. | Espresso Martini, Cosmopolitan, Moscow Mule | Filtration passes (charcoal, quartz); water source purity | Sub: Light white rum or neutral gin. Store: Keep cold. |
| **Vermouth** | Wine base, botanicals, fortification3 | Maceration of herbs in fortified wine3 | Unaged or short tank resting | Macerated with wormwood and botanicals | EU Vermouth Regulations10 | Artemisin (bitter), Anethole, Eugenol | Vermouth lasts indefinitely on the back bar at room temp. | Negroni, Manhattan, Martini, Boulevardier10 | Botanicals used; wine base quality (e.g., Moscato) | Sub: Lillet, Dubonnet, or Cocchi Americano. Store: Refrigerated14. |
| **Amaro** | Neutral spirit, bitter botanicals | Maceration and infusion of herbs | Redistilled or blended directly | Variable wood or tank aging | National laws (mostly Italian) | Anethole, Eugenol, bitter Gentian compounds | Amari are medicinal syrups that cannot be used in light drinks. | Spritz modifier, Black Manhattan, Paper Plane | Botanical complexity; sugar-to-bitter balance | Sub: Another amaro within the same flavor family. Store: Cool. |

              ┌────────────────────────────────────────┐  
              │      AI SPIRIT ONTOLOGY ARCHITECTURE   │  
              └───────────────────┬────────────────────┘  
                                  │  
       ┌──────────────────────────┼──────────────────────────┐  
       ▼                          ▼                          ▼  
┌─────────────┐            ┌─────────────┐            ┌─────────────┐  
│ Category &  │            │ Flavor Profile│          │ Operational │  
│ Origin \[2\]  │            │  & Chemistry│            │   Metrics   │  
└─────┬───────┘            └─────┬───────┘            └─────┬───────┘  
      │                          │                          │  
      │ Inheritance path:        │ Esters, phenols,         │ Cost, bottle size,  
      │ Spirit \-\> Whiskey        │ sweetness (Brix), and    │ shelf life, and     
      │ \-\> Bourbon \[2, 34\].      │ ABV \[2, 20, 28\].         │ allocations \[11, 18\].

To represent spirits knowledge effectively, an AI system should model each bottle as a multi-layered object with clear inheritance paths10:

* **The Taxonomic Layer**: Defines category membership (e.g., Bourbon as a subclass of AmericanWhiskey, which is a subclass of Whiskey, which is a subclass of Spirit)10.  
* **The Chemical Profile**: Tracks ethanol concentration (![][image2]), dissolved sugar (![][image3]), titratable acidity, tannin levels, and dominant volatile compounds5.  
* **The Operational Matrix**: Stores wholesale bottle cost, volume, distributor, allocation status, and pour cost targets4.  
* **The Regulatory and Dietary Filter**: Flags compliance data, including geographical protections and Kosher certifications11.

## **Classic Cocktail Intelligence**

An AI system should analyze classic cocktails as structured templates within distinct beverage families3. By treating cocktails as balanced ratios of base elements rather than isolated, memorized recipes, the system can adjust formulas, swap spirits, and scale batches consistently while preserving each drink's structural identity5.

                 ┌────────────────────────────────────────┐  
                 │       COCKTAIL BALANCING ENGINE        │  
                 └───────────────────┬────────────────────┘  
                                     │  
      ┌──────────────────────────────┼──────────────────────────────┐  
      ▼                              ▼                              ▼  
┌───────────┐                  ┌───────────┐                  ┌───────────┐  
│ Dynamic   │                  │  Thermal  │                  │ Chemical  │  
│ Dilution  │                  │ Dynamics  │                  │ Equilibrium│  
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘  
      │                              │                              │  
      │ Calculates ice melt          │ Manages glass pre-chilling   │ Balances sugar (Brix)  
      │ mass to achieve target       │ and service temperature      │ and acid (TA) for a    
      │ ABV and texture \[21\].        │ down to \-8°C \[21, 33\].       │ bright profile \[20\].

The system models cocktail construction through key balance equations. The dilution formula calculates the mass of water (![][image4]) added to the pre-dilution volume (![][image5]) to reach the target proof9:  
![][image6]  
\[cite: 9\]  
![][image7]  
\[cite: 9\]  
Acidity is balanced using the target Brix-to-Acid ratio (![][image8]) of the combined ingredients5:  
![][image9]  
\[cite: 5\]

| Cocktail & Family | Origin & History | Canonical Specs & Ratios | Accepted Variations | Balance & Dilution Dynamics | Glassware & Garnish | Common Mistakes | Operational Difficulty & Cost Profile | Menu Positioning & Strategy | Identity-Preserving Adaptation |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Martini** (Martini Family) | Late 19th Century US; evolved from Martinez3. | ![][image10] Gin, ![][image11] Dry Vermouth, ![][image12] Orange Bitters3 | Wet (![][image13]), Dry (![][image14]), Dirty (olive brine addition)3 | High spirit-forward profile; target stirred dilution: ![][image15]9. | Coupe or Nick & Nora; expressed lemon peel or olives15 | Under-chilling; using stale vermouth left at room temperature. | Low difficulty; high margin with low pour cost4. | Lead classic; benchmark of quality for premium programs. | Sub local gin or dry sake modifier without changing ratios3. |
| **Manhattan** (Manhattan Family) | c. 1880s New York City, Manhattan Club3. | ![][image10] Rye, ![][image16] Sweet Vermouth, ![][image17] Angostura Bitters3 | Black Manhattan (using Amaro), Perfect Manhattan3 | Sweet-to-bitter balance; target stirred dilution: ![][image18]9. | Coupe Glass; brandied cherry garnish15 | Shaking instead of stirring, which cloudy-aerates the texture. | Low difficulty; medium pour cost based on rye selection4. | Anchors the dark spirits section; highly consistent volume. | Swap base whiskey or use high-quality local sweet vermouth. |
| **Old Fashioned** (Old Fashioned Family) | Early 19th Century; the original "Cocktail" formula3. | ![][image10] Bourbon, ![][image19] Rich Syrup (![][image20]), ![][image17] Angostura3 | Wisconsin style (muddled fruit, brandy base)3 | Direct spirit dilution; target dilution: ![][image21] over large ice rock9 | Double Rocks glass; expressed orange peel15 | Muddling cherries and oranges into a sweet paste. | Low difficulty; high contribution margin4. | High volume leader; essential for dark spirit sales4. | Swap base aged spirit (e.g., Rum or Mezcal)24. |
| **Negroni** (Italian Bitter Family) | 1919 Florence, Italy; Caffe Casoni3. | ![][image16] Gin, ![][image16] Sweet Vermouth, ![][image16] Campari3 | Boulevardier, Sbagliato, Mezcal Negroni | Bitter-to-sweet equilibrium; target stirred dilution: ![][image22]9. | Rocks Glass; expressed orange peel or slice15 | Shaking the drink, which over-aerates the bitter compounds. | Low difficulty; highly consistent pour cost4. | High-profile bitter anchor; drives aperitivo sales. | Swap Campari for local bitter; change base spirit3. |
| **Daiquiri** (Sour Family) | c. 1898 Daiquiri, Cuba3. | ![][image10] Light Rum, ![][image23] Lime, ![][image23] Simple Syrup (![][image13])3 | Hemingway Daiquiri (grapefruit and maraschino additions) | Bright sugar-to-acid balance; target shaken dilution: ![][image24]9. | Coupe Glass; lime wheel garnish15 | Using bottled lime juice or low-density sugar syrups5. | Medium difficulty; low pour cost and fast execution4. | High-volume refresher; benchmark for sour technique. | Acid-adjust juices or swap rums to keep the ![][image25] ratio5. |
| **Margarita** (Sour Family) | c. 1930s Mexico; evolved from Daisy style3. | ![][image26] Blanco Tequila, ![][image27] Cointreau, ![][image23] Lime, ![][image19] Agave3 | Mezcal Margarita, Tommy's Margarita (no orange liqueur) | High salinity balances lime acidity; target shaken dilution: ![][image28] | Rocks Glass; half salt rim and lime wedge15 | Over-sweetening or using low-quality powdered sour mixes. | Medium difficulty; medium pour cost based on tequila choice4. | High volume leader; crucial for agave category sales4. | Swap orange liqueur for local triple sec; use mezcal base3. |
| **Sidecar** (Sour Family) | c. 1920s Paris/London; Ritz Hotel3. | ![][image26] Cognac, ![][image27] Cointreau, ![][image27] Lemon Juice3 | Chelsea Sidecar (gin base), Between the Sheets3 | Dry, spirit-driven sour balance; target shaken dilution: ![][image29] | Coupe Glass; sugared rim and lemon peel15 | Over-sweetening with sugar syrup or using low-proof brandy. | Medium difficulty; high pour cost due to Cognac pricing4. | Premium classic; appeals to luxury spirits consumers19. | Swap Cognac for Armagnac or high-quality apple brandy3. |
| **Sazerac** (Old Fashioned Family) | Mid 19th Century New Orleans, Louisiana3. | ![][image10] Rye, ![][image19] Simple, ![][image30] Peychaud's, Absinthe rinse3 | Cognac Sazerac, Split-base Sazerac (Rye and Cognac) | High aromatic complexity; target dilution: ![][image31] (served neat) | Chilled Rocks Glass; expressed lemon peel (discarded)15 | Leaving excess pooled absinthe in the bottom of the glass. | Medium difficulty; high margin with low pour cost4. | Historic classic; anchors regional US cocktail sections. | Split base between Rye and Cognac; adjust rinse spray. |
| **Gimlet** (Sour Family) | Late 19th Century British Royal Navy3. | ![][image10] Gin, ![][image23] Lime, ![][image23] Simple Syrup (![][image13])3 | Vodka Gimlet, Cordial-based Gimlet (using Rose's lime) | Clean botanical acidity; target shaken dilution: ![][image24]9. | Coupe Glass; lime wheel garnish15 | Using synthetic lime cordials or under-diluting the shaken mix9. | Low difficulty; low pour cost and fast prep4. | High-volume classic; high margin and fast service times4. | Use lime super juice or acid-adjusted local citrus cords25. |
| **Whiskey Sour** (Sour Family) | c. 1860s US; first printed in Jerry Thomas' guide3. | ![][image10] Bourbon, ![][image23] Lemon, ![][image23] Simple, egg white3 | New York Sour (red wine float), Boston Sour (egg white)3 | Albumen emulsion balances acid; target shaken dilution: ![][image32] | Coupe Glass; Angostura bitters drop on foam15 | Under-shaking egg whites, leading to thin foam and wet texture. | Medium-high difficulty; medium pour cost4. | Key classic sour; appeals to dark spirit drinkers4. | Use aquafaba or molecular foaming agents for faster service20. |

### **The Logic of Cocktail Families**

Instead of memorizing thousands of isolated recipes, an AI system should group cocktails into structural families based on their dynamic ratios3. This ratio-driven approach enables the system to evaluate balance, suggest modifications, and design new recipes systematically5.

                             ┌────────────────────────────────────────┐  
                             │       COCKTAIL STRUCTURE FAMILIES      │  
                             └───────────────────┬────────────────────┘  
                                                 │  
       ┌──────────────────────────┬──────────────┴───────────┬──────────────────────────┐  
       ▼                          ▼                          ▼                          ▼  
┌─────────────┐            ┌─────────────┐            ┌─────────────┐            ┌─────────────┐  
│   Sours &   │            │   Stirred   │            │  Highballs  │            │  Aperitivos │  
│   Daisies   │            │  Aromatics  │            │  & Fizzes   │            │  & Spritzes │  
└─────────────┘            └─────────────┘            └─────────────┘            └─────────────┘

* **The Sour and Daisy Family**: Built on the ![][image25] template of Spirit, Acid, and Sugar (e.g., Daiquiri, Gimlet, Margarita, Sidecar)5. Balance is maintained by adjusting the sugar concentration (Brix) to match the acidity of the citrus juice5.  
* **The Stirred Aromatic Family**: Built on the ![][image20] template of Spirit and Fortified Wine, balanced with bitters (e.g., Manhattan, Negroni, Boulevardier, Vieux Carré)3. These drinks require stirring with solid ice to achieve a silky texture, low temperature, and controlled dilution without introducing air bubbles9.  
* **The Highball and Fizz Family**: Built on a base spirit topped with a larger volume of carbonated mixers (e.g., Tom Collins, Ramos Gin Fizz, Paloma)10. Keeping these drinks balanced requires pre-chilling all ingredients and using high-quality carbonation to keep the bubbles tight and refreshing15.  
* **The Aperitivo and Spritz Family**: Built on low-ABV modifiers, bitter liqueurs, and sparkling wine (e.g., Aperol Spritz, Americano)3. These drinks rely on carbonation and bitter-sweet profiles to create a refreshing, light, and easy-drinking style8.

## **Cocktail Structure and Formula Logic**

### **Dynamic Taste and Balance Interactions**

A balanced cocktail is a dynamic chemical system where taste compounds interact to suppress or enhance one another1. The platform models these relationships to evaluate balance, diagnose issues, and suggest precise recipe corrections5.

                     \[Taste & Balance Engine\]  
                                │  
        ┌───────────────────────┼───────────────────────┐  
        ▼                       ▼                       ▼  
 \[Sugar-Acid Balance\]   \[Bitterness & Salt\]     \[Viscosity & Texture\]  
 \- Target: 15 Brix      \- Salinity cuts bitter  \- Fat wash adds body \[31\]  
 \- Target: 0.8% Acid    \- Bitter balances sweet \- Whey proteins foam \[23\]  
        │                       │                       │  
        └───────────────────────┼───────────────────────┘  
                                │  
                                ▼  
                    \[Diagnostic Optimization\]

* **Sugar and Acid Balance**: The target ratio for a standard sour sits at approximately ![][image33] of dissolved sugar to ![][image34] titratable acidity5. Sweetness balances the sharp edge of acid, while acidity cuts through heavy sweetness to keep the drink bright and refreshing5.  
* **Bitterness, Sweetness, and Salinity**: Bitterness reduces the perception of sweetness, helping to balance rich dessert-style drinks8. Adding trace amounts of salinity (e.g., a ![][image35] saline solution) reduces bitterness and opens up the delicate fruit and botanical aromas in a cocktail8.  
* **ABV, Viscosity, and Temperature**: Alcohol acts as a solvent for aroma compounds, but high proofs can cause an unpleasant burning sensation8. Lowering the service temperature to between ![][image36] and ![][image37] suppresses the alcohol burn, while using rich syrups, fat washing, or milk clarification adds body and viscosity to protect the drink's mouthfeel9.

### **Structural Diagnostic and Correction Matrix**

The AI operating system uses a structured diagnostic matrix to identify imbalances in a cocktail and recommend precise, actionable corrections5:

| Off-Balance Diagnosis | Primary Chemical and Physical Indicators | Root Causes in Execution | Step-by-Step Professional Corrections |
| :---- | :---- | :---- | :---- |
| **Too Sweet** | Sugar levels above ![][image38]; acidity dropped below ![][image39] TA5. | Over-pouring syrups; using low-acid citrus; under-dilution5. | Add fresh citrus in ![][image40] steps; add ![][image41] of ![][image42] citric acid solution5. |
| **Too Sour** | Acidity levels above ![][image43] TA; sugar levels dropped below ![][image44]5. | Under-pouring syrups; over-pouring citrus juice; using unripe fruit5. | Add rich simple syrup (![][image20]) in ![][image40] steps to restore Brix balance5. |
| **Too Flat / Dull** | Lack of carbonation; temperature above ![][image45]; pH above ![][image46]15. | Warm ingredients; flat soda water; dirty glassware releasing carbonation20. | Pre-chill glassware; replace flat mixers; add a drop of saline to brighten aromatics8. |
| **Too Alcoholic / Hot** | Proof level exceeds ![][image47] in a non-aromatic classic cocktail template8. | Under-dilution; shaking with large, dry ice block; over-pouring base spirit9. | Shake for an additional ![][image48]; add ![][image49] of filtered dilution water9. |
| **Too Bitter** | Bittering agents exceed ![][image50] without matching sugar and acid levels. | Over-expressing citrus peels; leaving botanicals to infuse too long; over-pouring bitters. | Add ![][image41] of ![][image35] saline solution; add ![][image40] of rich simple syrup5. |
| **Too Thin / Watery** | Viscosity below ![][image51]; dilution level exceeds ![][image52]9. | Shaking with wet, melting ice; shaking or stirring too long; using thin syrups9. | Swap simple syrup for rich demorara syrup (![][image20]); use fat-washed modifiers5. |
| **Too Heavy / Syrupy** | Viscosity above ![][image53]; sugar level exceeds ![][image54]5. | Over-pouring rich syrups; under-diluting; using heavy cream modifiers9. | Increase dilution with longer stir time; add ![][image49] of neutral spirit or acid juice9. |
| **Too Aromatic / Perfumed** | Volatile organics overpower base notes; masking underlying spirit. | Over-spraying floral waters; using high-ester rums without balancing modifiers. | Reduce aromatic modifier volumes; split base spirits with neutral alternatives. |
| **Too Simple / One-Note** | Monochromatic flavor profile; lacks complexity, depth, and finish. | Using cheap, highly filtered spirits; single-ingredient sweeteners; low botanical gin10. | Replace white sugar with raw cane sugar; add a dash of artisanal bitters3. |
| **Too Complex / Muddy** | Clashing flavor families; confusing and unidentifiable flavor profile2. | Using too many high-flavor spirits and modifiers in a single recipe2. | Simplify the recipe; limit to three primary flavor components and one modifier3. |

## **Flavor Architecture and Sensory Intelligence**

An expert-level flavor engine models pairing relationships through chemical composition, sensory contrasts, and cultural history1. By analyzing the underlying flavor network, the AI can discover creative ingredient combinations, design balanced infusions, and construct harmonious menus that complement the venue's culinary style1.

                 ┌────────────────────────────────────────┐  
                 │       MOLECULAR FLAVOR COUPLINGS       │  
                 └───────────────────┬────────────────────┘  
                                     │  
      ┌──────────────────────────────┼──────────────────────────────┐  
      ▼                              ▼                              ▼  
┌───────────┐                  ┌───────────┐                  ┌───────────┐  
│ Terpene   │                  │ Pyrazine  │                  │  Phenolic │  
│ Bridges   │                  │ Contrasts │                  │  Echoes   │  
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘  
      │                              │                              │  
      │ Pairs fresh citrus           │ Cuts vegetal bell            │ Matches peated scotch    
      │ botanicals with              │ pepper notes with            │ with smoked sea salt    
      │ basil and tequila.           │ rich, roasted coffee \[10\].   │ and dark cocoa \[28\].

To build a beverage flavor intelligence framework, the AI system must evaluate ingredient connections across five distinct pairing pathways2:

### **Shared Volatile Aroma Bridges**

Ingredients pair naturally when they share key volatile aroma compounds2. The system maps these chemical bridges to create harmonious, balanced combinations2:

* *Terpene Bridge*: Linking blue weber agave, fresh coriander, basil, and London dry gin2.  
* *Pyrazine Bridge*: Connecting green bell peppers, jalapeños, sauvignon blanc, and cabernet franc.  
* *Ester Bridge*: Pairing aged rums, ripe bananas, pineapples, and tropical fruits20.  
* *Phenol Bridge*: Matching peated scotch, smoked sea salt, lapsang souchong tea, and dark cacao20.

### **Structural Flavor Contrast**

Opposing flavor profiles can balance each other, cutting through richness and highlighting delicate notes1. The system calculates these sensory tensions to round out intense profiles:

* *Acidity and Fat*: Using acid-adjusted pineapple juice to cut through rich, coconut-washed rum in a tropical highball20.  
* *Bitterness and Sugar*: Balancing bitter gentian root with sweet carmelized vermouth in a classic Boulevardier8.  
* *Heat and Sweetness*: Using sweet honey syrup to soften the spicy heat of fresh ginger in a Penicillin cocktail8.

### **Cultural and Regional Association**

Pairings rooted in shared geography and traditional culinary history offer a sense of place and conceptual authenticity2:

* *Oaxacan Profile*: Pairing mezcal, agave nectar, lime, and a chili-salt rim19.  
* *Mediterranean Profile*: Matching gin, dry vermouth, fresh rosemary, and green olives3.  
* *Jalisco Profile*: Combining reposado tequila, fresh grapefruit juice, lime, and agave nectar19.

### **Seasonal and Environmental Harmony**

Aligning ingredient profiles with the current season and climate enhances their appeal and fits the guest's mood:

* *Spring / Summer*: Fresh, light aldehydes; bright citrus esters; crisp, herbal botanicals (e.g., fresh cucumber, mint, and elderflower)2.  
* *Autumn / Winter*: Warm wood lactones; roasted spices; rich, comforting phenols (e.g., baked pear, cinnamon, and brown-butter washed bourbon)22.

### **Textural and Temperature Contrast**

Playing with opposing mouthfeels and temperatures creates an engaging, multi-sensory drinking experience6:

* *Foam and Liquid*: Topping a cold, clarified coffee cocktail with a warm, velvety coconut milk foam6.  
* *Carbonation and Richness*: Using crisp, highly carbonated soda water to lift a rich, sweet vermouth modifier in a highball8.

## **Modern Bar Technique Framework**

Modern preparation techniques should always serve a clear purpose—such as improving consistency, extending shelf life, or refining flavor—rather than being used as a visual gimmick6. The AI system categorizes these methods by their physical chemistry, equipment requirements, safety parameters, and overall suitability for different venues6.

| Technique | Scientific Principle & Physical Mechanism | Flavor & Textural Purpose | Operational Difficulty | Equipment & Safety Criteria | Shelf Life & Storage | Cost Profile & Prep Yield | When to Use vs. Avoid |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Sous-Vide Infusion** | Thermal extraction of botanicals into ethanol under sealed vacuum pressure. | Accelerates flavor infusion while preserving delicate fresh fruit aromatics28. | Foundational | Immersion circulator, vacuum sealer; low risk. | 30 days (refrigerated) | Low cost; near ![][image55] liquid prep yield. | Use for consistent house liqueurs; avoid in high-volume, low-prep venues. |
| **Cold Infusion** | Passive extraction of soluble flavor compounds into ethanol over time. | Gentle, classic extraction; prevents extracting bitter wood tannins. | Foundational | Airtight glass jars; food safety sanitation22. | 30 days (room temp) | Low cost; ![][image56] yield after straining. | Use for delicate herbs and tea infusions; avoid for quick-turnaround prep. |
| **Rapid Infusion** | Pressure-driven extraction using ![][image57] chargers to force ethanol into botanical cells. | Quick, immediate extraction of delicate citrus and spice notes. | Professional | Whipping siphon, ![][image57] chargers; high pressure risk. | 14 days (refrigerated) | Medium cost; ![][image58] yield. | Use for quick-turnaround specialty syrups; avoid for large-batch operations. |
| **Fat Washing** | Lipophilic flavor extraction into ethanol, followed by freezing to separate the solid fat22. | Adds savory, roasted notes and a rich, velvety lipid texture22. | Professional | Precision freezer, fine strainer; Listeria safety risk22. | 18 months (refrigerated, saturated fats)23 | Medium cost; ![][image59] yield due to fat absorption22. | Use for rich, savory classics; avoid in venues lacking freezer space24. |
| **Milk Clarification** | Acidification to casein isoelectric point (![][image60]) to bind polyphenols and filter impurities6. | Removes harsh tannins and bitterness, yielding a clear, silky liquid6. | Professional | Chinois, cheesecloth; manage dairy allergens6. | 6 months (refrigerated, sealed)6 | High cost; ![][image61] yield due to curd separation6. | Use for batching stable, clear classic variations; avoid in fast sours6. |
| **Acid Adjustment** | Adjusting a juice's sugar-to-acid ratio to match lime or lemon acidity (![][image42] TA)5. | Replicates citrus acidity using stable juices, reducing fresh fruit waste5. | Foundational | Precision scale (![][image62]), citric and malic powders14. | 7 days (refrigerated) | Very low cost; ![][image55] liquid yield. | Use to stabilize draft cocktails; avoid if fresh-squeezed citrus is required25. |
| **Carbonation** | Forcing carbon dioxide (![][image63]) to dissolve into cold water or liquids under pressure10. | Creates a crisp, effervescent texture and brightens overall acidity20. | Professional | CO2 tank, carbonation rig, pressure gauge. | 14 days (sealed bottles) | Medium cost; near ![][image55] yield. | Use for signature spritzes and highballs; avoid with unclarified juices10. |
| **Force Carbonation** | Continuous saturation of batches with high-pressure ![][image63] inside cold kegs (![][image64])20. | Produces consistent, high-volume carbonated draft cocktails20. | Advanced | Draft lines, kegs, gas regulators; high-pressure lines. | 30 days (sealed kegs) | High upfront cost; ![][image56] yield. | Use for high-volume highball bars and event venues; avoid in low-volume bars10. |
| **Batched Cocktails** | Pre-mixing non-perishable ingredients and dilution water before service6. | Ensures perfect recipe consistency and significantly speeds up service6. | Foundational | Large mixing vessels, storage bottles9. | 60 days (refrigerated, no citrus) | Low cost; ![][image55] yield. | Use to speed up high-volume services; avoid for bespoke, custom orders6. |
| **Pre-Dilution** | Adding a calculated mass of water to batched drinks before bottling or kegging6. | Guarantees perfect consistency and chilling without hand-shaking9. | Professional | Precision hydrometer, purified water9. | 30 days (refrigerated) | Low cost; ![][image55] yield. | Use for draft and bottled cocktail programs; avoid for traditional hand-stirs9. |
| **Kegged Cocktails** | Bulk pre-batched and pre-diluted cocktails served through pressurized draft lines6. | Delivers instant service of consistent, high-volume draft cocktails9. | Advanced | Kegs, draft tower, barrier tubing, couplers10. | 30 days (refrigerated) | High upfront cost; ![][image56] yield. | Use for high-volume clubs, stadium events, and rooftops; avoid in boutique lounges. |
| **Oleo Saccharum** | Using dry sugar to extract essential oils from fresh citrus peels over time25. | Yields a rich, highly aromatic syrup with intense citrus notes. | Foundational | Vacuum sealer or glass jars; low risk. | 30 days (refrigerated) | Low cost; medium yield based on extraction. | Use for punch bowls and classic modifiers; avoid in low-waste, fast-prep programs. |
| **Cordial Making** | Blending juices, sugars, acids, and botanicals into a stable, rich modifier3. | Adds custom, concentrated flavor profiles with excellent batch stability25. | Foundational | Precision scale, blender, citric/malic acids14. | 30 days (refrigerated) | Low cost; ![][image58] yield. | Use to standardize high-volume sours; avoid if fresh citrus is expected25. |
| **Shrubs** | Preserving fresh fruits using sugar and vinegar to create a sweet, tangy syrup. | Adds a complex, stable sweet-and-sour profile with excellent shelf life8. | Foundational | Glass jars, food-grade vinegar, sugar; low risk. | 90 days (refrigerated) | Low cost; ![][image59] yield. | Use for complex non-alcoholic options and seasonal menus; avoid in purist bars. |
| **Fermentation** | Using yeasts to convert sugars into alcohol and carbon dioxide, creating custom bases10. | Produces unique, complex house-brewed bases with distinct flavor profiles10. | Risky | Sanitize equipment, airlocks; monitor sanitation7. | Variable (refrigerated) | Low cost; variable yield. | Use for bespoke culinary-focused programs; avoid in fast-paced commercial bars. |
| **Lacto-Fermentation** | Using lactic acid bacteria to convert sugars into smooth, sour lactic acid. | Delivers a complex, savory sourness that is softer than citric acid. | Risky | Vacuum bags, salt, temperature chamber; monitor pH. | 30 days (refrigerated) | Low cost; ![][image58] yield. | Use for savory, culinary cocktails; avoid in high-volume, fast-prep bars. |
| **Clarification** | Removing suspended solids from fresh juices to yield a clear, transparent liquid20. | Prevents foaming during carbonation and creates a beautiful, clear drink20. | Professional | Agar-agar, gelatin, or coffee filters6. | 7 days (refrigerated) | Medium cost; ![][image61] yield. | Use for carbonated and bottled drinks; avoid if fresh fruit texture is desired20. |
| **Centrifuge Methods** | Using high-speed spinning to instantly separate solids from fresh juices20. | Instant, high-yield clarification of fresh juices and purees20. | Advanced | Benchtop centrifuge; safety interlocks required20. | 7 days (refrigerated) | High equipment cost; ![][image65] yield20. | Use in elite, high-volume prep labs; avoid in small, low-budget bars. |
| **Rotovap Concepts** | Low-temperature vacuum distillation to extract delicate botanicals20. | Captures highly aromatic, fresh distillates without cooking the ingredients20. | Advanced | Rotary evaporator, vacuum pump, recirculating chiller23. | Indefinite (high proof) | Very high equipment cost; ![][image59] yield23. | Use for signature, high-end bespoke programs; avoid in standard operations. |
| **Freeze Concentration** | Freezing juices or spirits and removing the pure ice to concentrate the remaining liquid. | Elevates the sugar, acid, and flavor intensity of fresh juices5. | Professional | Sub-zero freezer; low risk. | 14 days (refrigerated) | Medium cost; ![][image66] concentrated yield. | Use for rich, intense dessert-style drinks; avoid in high-volume, low-margin bars. |
| **Coconut Washing** | Fat washing using virgin coconut oil to extract tropical aromatics into spirits24. | Adds a clean, tropical coconut aroma and a velvety, rich mouthfeel24. | Professional | Freezer, fine strainer, coconut oil24. | 12 months (refrigerated) | Medium cost; ![][image65] yield. | Use for modern tropical classics; avoid if guests have coconut allergies24. |
| **Tea Infusions** | Steeping high-quality tea leaves in spirits to extract delicate tannins and aromatics20. | Adds dry, structured tannins and complex herbal notes to spirits20. | Foundational | Precision scale, fine tea leaves; low risk. | 30 days (room temp) | Low cost; ![][image56] yield. | Use to add dry structure to sours and highballs; avoid over-steeping leaves20. |
| **Saline Solutions** | Blending high-quality sea salt with water to create a consistent seasoning (![][image35]). | Suppresses bitterness, brightens acidity, and opens delicate botanical aromas8. | Foundational | Precision scale, dropper bottle; low risk. | 180 days (room temp) | Extremely low cost; ![][image55] yield. | Use across the entire menu to balance flavor; avoid over-pouring. |
| **Tinctures** | High-proof neutral spirit infusions of a single intense botanical (e.g., habanero). | Delivers a highly consistent, targeted aroma or spice note to cocktails20. | Foundational | High-proof spirit, botanicals, dropper bottle. | 365 days (room temp) | Low cost; near ![][image55] yield. | Use to add consistent heat or spice notes; avoid over-pouring. |
| **Bitters** | Complex botanical infusions featuring a bittering agent like gentian or cinchona bark3. | Adds structural depth, length, and aromatic complexity to cocktails8. | Foundational | High-proof spirit, bitter roots, aromatic spices3. | Indefinite (room temp) | Low cost; near ![][image55] yield. | Use across classic stirred aromatic and sour families; avoid clashing profiles. |
| **Foams** | Using chargers to create a light, aerated, and textured topping for cocktails. | Delivers a beautiful, aerated texture and immediate aromatic lift to drinks. | Foundational | Whipping siphon, gelatin or egg white base, ![][image57]. | 2 days (refrigerated) | Low cost; high volume yield. | Use for visual appeal and immediate aroma; avoid if service speed is a bottleneck. |
| **Emulsions** | Blending oil and water-based ingredients into a smooth, stable, and rich mixture. | Creates rich, creamy textures without relying heavily on dairy. | Professional | High-shear blender, gum arabic or lecithin; low risk. | 5 days (refrigerated) | Low cost; ![][image56] yield. | Use for modern, shelf-stable creamy drinks; avoid if batch sizes are inconsistent. |
| **Sustainable Methods** | Repurposing citrus husks and bar waste into syrups, cordials, and modifiers. | Significantly reduces ingredient waste and lowers the overall pour cost4. | Foundational | Citrus husks, sugars, organic acids; low risk14. | 14 days (refrigerated) | Extremely low cost; high value yield. | Use to improve margins and highlight green practices; avoid if flavors taste dull. |

## **Bar Operations Intelligence**

A world-class beverage program must balance culinary creativity with operational efficiency. A cocktail is only successful if it can be prepared quickly, consistently, and profitably during peak volume6. The AI system evaluates operations across several key areas:

               ┌────────────────────────────────────────┐  
               │         BAR OPERATIONS ENGINE          │  
               └───────────────────┬────────────────────┘  
                                   │  
      ┌──────────────────────────────┼──────────────────────────────┐  
      ▼                              ▼                              ▼  
┌───────────┐                  ┌───────────┐                  ┌───────────┐  
│ Mise en   │                  │  Batching │                  │ Inventory │  
│   Place   │                  │  Schedules│                  │   Pars    │  
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘  
      │                              │                              │  
      │ Maximizes station speed      │ Recommends bulk pre-mixes    │ Tracks velocity to automate  
      │ with structured,             │ and pre-dilutions to shorten │ ordering and prevent empty  
      │ ergonomic wells \[33\].        │ ticket times \[21, 25\].       │ stock during rushes \[35\].

* **Mise en Place and Station Ergonomics**: Bar wells should be arranged to minimize unnecessary movement during service. High-volume spirits, fresh juices, and ice should be within easy reach15. The system tracks physical layout metrics to suggest better bottle arrangements and speed up service.  
* **Dynamic Batching and Pre-Dilution**: To shorten ticket times without sacrificing consistency, the AI evaluates when to pre-batch and pre-dilute recipes6. Non-perishable ingredients can be bulk-mixed ahead of time, while delicate citrus is added fresh or stabilized using acid adjustments6.  
* **Predictive Inventory and Ordering**: By monitoring live POS sales patterns, the system calculates precise par levels, tracks waste, and automates supplier orders to prevent running out of stock during busy periods16.

The AI system evaluates whether a proposed cocktail is operationally realistic by calculating its operational score (![][image67])6:  
![][image68]  
Where:

* ![][image69] is the total preparation time in seconds6.  
* ![][image70] is the number of individual physical actions required to build and garnish the drink.  
* An operational score (![][image67]) below ![][image71] is considered suitable for high-volume service.

## **Beverage Menu Engineering and Profit Intelligence**

Menu engineering is a continuous process that maximizes total gross profit by balancing sales volumes against individual drink contribution margins4. The system monitors sales data to categorize drinks into four classic engineering quadrants, helping operators make smart pricing and positioning decisions4:

| Engineering Quadrant | Performance Criteria | Core Financial Profile | Strategic Action Plan | AI Optimization Directives |
| :---- | :---- | :---- | :---- | :---- |
| **Stars** | High popularity, high contribution margin4. | ![][image72] and ![][image73]4. | Maintain consistency; highlight prominently on the menu4. | Protect margins; retain prime menu positioning4. |
| **Plowhorses** | High popularity, low contribution margin4. | ![][image72] and ![][image74]4. | Increase price gradually; reduce portion costs; pair with high-margin modifiers4. | Suggest lower pour-cost ingredients; adjust spirit ratios4. |
| **Puzzles** | Low popularity, high contribution margin4. | ![][image75] and ![][image73]4. | Reposition on the menu; rename; run active staff sales contests4. | Recommend visual menu highlights or featured promos4. |
| **Dogs** | Low popularity, low contribution margin4. | ![][image75] and ![][image74]4. | Remove from the menu; replace with a higher-margin style4. | Flag for removal; suggest trendy, higher-margin alternatives4. |

                       \[Menu Profit Matrix\]  
                                │  
        ┌───────────────────────┼───────────────────────┐  
        ▼                       ▼                       ▼  
 \[Costing Analysis\]      \[Pricing Strategy\]      \[Supplier Programs\]  
 \- Bulk pour-cost bounds \- Factor vs. CM pricing \- Target allocated brands  
 \- Garnish waste logs    \- Elasticity testing    \- Maximize case discounts  
        │                       │                       │  
        └───────────────────────┼───────────────────────┘  
                                │  
                                ▼  
                    \[Gross Profit Maximization\]

To optimize pricing, the system evaluates the relationship between price changes and demand (own- and cross-price elasticity), ensuring that price increases do not drive guests toward lower-margin options12. It also tracks bulk pour costs, garnish waste, and supplier incentive programs to maximize case discounts and support long-term margins4.

## **Guest and Venue Fit**

A world-class cocktail program must align with the venue's core concept, style, equipment capabilities, and target guest expectations7. The AI system uses a multi-attribute utility model to evaluate how well a cocktail fits its environment, scoring it across several key operational and brand parameters7.

                 ┌────────────────────────────────────────┐  
                 │          VENUE COMPATIBILITY           │  
                 └───────────────────┬────────────────────┘  
                                     │  
      ┌──────────────────────────────┼──────────────────────────────┐  
      ▼                              ▼                              ▼  
┌───────────┐                  ┌───────────┐                  ┌───────────┐  
│ Physical  │                  │  Staff    │                  │ Target    │  
│ Equipment │                  │  Skills   │                  │  Margins  │  
└─────┬─────┘                  └─────┬─────┘                  └─────┬─────┘  
      │                              │                              │  
      │ Checks for draft lines,      │ Matches preparation times    │ Balances ingredient costs    
      │ carbonation rigs, and        │ with the active team's       │ with local guest spending    
      │ premium freezer space \[33\].  │ speed and training \[36\].     │ habits and price targets.

The system models compatibility across twelve distinct venue concepts:

* **Luxury Hotel Bar**: Requires 24-hour service stability, premium glassware, consistent ice programs, and refined classic variations15.  
* **Neighborhood Cocktail Bar**: Focuses on approachable, high-margin drinks, fast preparation times, and friendly, community-focused service4.  
* **Chef-Driven Restaurant**: Requires close coordination with the kitchen, seasonal changes, and deep food-pairing integrations1.  
* **High-Volume Event Venue**: Focuses on quick-service draft cocktails, pre-diluted batches, and durable, efficient operations6.  
* **Beach Club**: Requires refreshing, low-ABV profiles, fruit-driven modifiers, and high heat-stability8.  
* **Rooftop Lounge**: High-energy service requiring consistent draft kegs and fast ticket times6.  
* **Fine Dining Restaurant**: Focuses on elegant presentation, premium spirits, and vintage classic cocktails15.  
* **Casual Restaurant**: Approachable, familiar favorites with low pour costs and easy preparation4.  
* **Nightlife Venue**: Focuses on highly visual, fast-service drinks and bulk batching efficiency6.  
* **Kosher Venue**: Requires strict ingredient screening, avoiding uncertified wine-cask finishes, and using mevushal-certified wines11.  
* **High-Volume Stadium**: Fast-service draft lines and packaged options to maximize transaction speeds16.  
* **Boutique Lounge**: Focuses on rare spirits, artisanal ice, and custom, hand-crafted cocktails15.

## **Professional Beverage Language**

An expert AI must communicate with the authority, clarity, and precision of a world-class Beverage Director, avoiding generic buzzwords and corporate filler6. It adjusts its vocabulary and tone to match different audiences within the hospitality ecosystem15:

                     \[Language & Tone Module\]  
                                │  
        ┌───────────────────────┼───────────────────────┐  
        ▼                       ▼                       ▼  
   \[Executive\]             \[Operations\]              \[Guest\]  
 \- Margin-focused        \- Actionable preps       \- Sensory-rich, engaging  
 \- ROI and pour costs    \- Standard parameters    \- Clear descriptions \[33\]  
        │                       │                       │  
        └───────────────────────┼───────────────────────┘  
                                │  
                                ▼  
                    \[Consistent Communication\]

* **Speaking to Owners and Investors**: Use business-focused terms. Prioritize discussion around pour costs, contribution margins, sales velocity, labor optimization, and supplier ROI4.  
* **Speaking to Bar Managers**: Focus on operational execution. Highlight batch stability, prep times, shelf lives, inventory pars, and station speed6.  
* **Speaking to Bartenders**: Use technical, precision-driven language. Discuss target dilution, temperature bounds, proper glassware pre-chilling, and execution details9.  
* **Speaking to Guests**: Use engaging, descriptive sensory terms15. Paint a picture of the drink's aroma, taste, texture, and cultural origin, avoiding generic descriptions2.

## **Beverage Knowledge System Design**

To support intelligent, automated reasoning about recipes, substitutions, and operational choices, the platform organizes its data across seventeen integrated domain ontologies3:

                     \[Unified Schema Graph\]  
                                │  
        ┌───────────────────────┼───────────────────────┐  
        ▼                       ▼                       ▼  
 \[Taxonomy Layer\]       \[Sensory Database\]      \[Operational Ledger\]  
 \- Spirit inheritance    \- Molecular compounds   \- Pour cost metrics \[11\]  
 \- Glassware & garnish   \- Dynamic taste values  \- Equipment logs \[33\]  
        │                       │                       │  
        └───────────────────────┼───────────────────────┘  
                                │  
                                ▼  
                   \[Autonomous System Reasoning\]

1. **Spirits Ontology**: Defines category inheritance, production styles, ABVs, raw materials, and geographical certifications10.  
2. **Cocktail Family Ontology**: Groups cocktails into structural families based on their dynamic ratios3.  
3. **Ingredient Ontology**: Tracks densities, sugar contents (Brix), acid profiles, and potential allergens5.  
4. **Flavor Ontology**: Maps key aroma compounds, taste interactions, and flavor harmony profiles1.  
5. **Technique Ontology**: Details preparation times, required equipment, and difficulty levels6.  
6. **Glassware Ontology**: Tracks styles, standard capacities, thermal properties, and active par levels15.  
7. **Garnish Ontology**: Models fresh prep requirements, yield values, and visual styles4.  
8. **Cost Model**: Calculates granular recipe costing, bulk pour costs, and dynamic margins4.  
9. **Operational Complexity Model**: Measures the physical touches, preparation steps, and service speeds of drinks6.  
10. **Venue Fit Model**: Evaluates how well drinks align with the venue's concept, layout, and equipment7.  
11. **Guest Preference Model**: Captures regional tastes, demographic trends, and dietary choices19.  
12. **Substitution Model**: Uses flavor and chemical data to recommend smart, cost-efficient ingredient alternatives12.  
13. **Menu Engineering Model**: Automates menu audits and quadrant analysis to maximize total profit4.  
14. **Safety Model**: Monitors sanitation protocols, allergen risks, and pressure safety parameters7.  
15. **Kosher Constraint Model**: Filters ingredients to ensure compliance with religious dietary standards11.  
16. **Event Bar Model**: Optimizes high-volume menus for speed, draft stability, and easy setup6.  
17. **Training Model**: Automatically generates tailored educational paths to help staff improve their skills7.

## **Required Core Frameworks**

### **1\. Beverage Intelligence Framework**

#### **Purpose**

Organizes the foundational concepts of beverage science, operations, and hospitality business logic to replicate the decision-making of an elite Beverage Director4.

#### **Key Concepts**

* Transitioning from static recipe lists to dynamic, ratio-driven structures3.  
* Integrating chemical, operational, financial, and psychological parameters into a unified system4.  
* Providing actionable, context-aware operational guidance for teams6.

#### **Required Knowledge**

* Classic cocktail family structures3.  
* Physical chemistry of dilution and temperature9.  
* Staff workflow capacities and station speed metrics6.

#### **Inputs**

* Raw POS sales logs, transaction histories, and inventory ledger data4.  
* Active staff scheduling and proven skill assessment logs7.  
* Physical bar layouts and back-bar equipment lists15.

#### **Outputs**

* Menu audits highlighting areas for profit and efficiency improvements4.  
* Dynamic prep lists tailored to daily volumes6.  
* Custom upselling and pairing suggestions for front-of-house staff15.

#### **Risks**

* Recommending complex menus that exceed the physical capacity or training of the staff6.  
* Suggesting high-cost premium spirits that raise pour costs above the target budget4.

#### **Failure Modes**

* Recommending hand-shaken, labor-intensive cocktails during busy, high-volume rushes, causing service bottlenecks6.  
* Failing to adjust prep and pars ahead of large-scale events16.

#### **Human Review Requirements**

* A master consultant must verify the difficulty and preparation steps assigned to new house recipes before active service6.

#### **Examples**

* The system analyzes a busy resort pool bar and suggests using high-quality draft cocktails and pre-diluted bottled options to keep ticket times under 45 seconds while maintaining premium margins6.

#### **Recommended Implementation Patterns**

* Use a microservices-driven architecture where the sensory matching engine runs alongside a separate operational constraint solver6.

### **2\. Spirits Knowledge Framework**

#### **Purpose**

Structures spirits and modifiers by their raw materials, chemistry, and market positioning to guide smart substitutions and premium upselling4.

#### **Key Concepts**

* Taxonomic class-subclass modeling of spirits categories10.  
* Chemical modeling of volatile compounds, sweetness, acidity, and aging markers5.  
* Tracking market tiers and dynamic wholesale pricing models4.

#### **Required Knowledge**

* Global spirit production rules, geographical protections, and aging laws10.  
* Organoleptic compound relationships22.  
* Kashrut kosher standards and certification rules11.

#### **Inputs**

* Bottle specifications: ABV, age, mash bill, distillation style, cask finishes, and certifications11.  
* Wholesale purchasing costs and supplier pricing tiers4.

#### **Outputs**

* An interactive, chemistry-backed list of flavor and style substitutions12.  
* Upselling guides to help staff confidently explain premium spirits to guests15.  
* Storage and shelf-life alerts to prevent waste of delicate ingredients14.

#### **Risks**

* Recommending incorrect substitutions that alter the drink's balance or proof5.  
* Suggesting non-kosher ingredients to a venue with strict kosher certification11.

#### **Failure Modes**

* Substituting an artisanal, smoky mezcal with an industrial, neutral tequila, flattening the drink's flavor19.  
* Using oxidized vermouth left on the back bar, ruining the taste of a classic Manhattan3.

#### **Human Review Requirements**

* The Lead Bartender must taste-test and sign off on any major spirits substitutions recommended for signature cocktails15.

#### **Examples**

* To replace Green Chartreuse during a supply shortage, the platform designs a blend of Dolin Genepy, high-proof white rum, and a touch of syrup, matching both the herbal complexity and the proof5.

#### **Recommended Implementation Patterns**

* Store spirits as typed entities in a graph database, using semantic relationships to track age, category, and style similarity10.

### **3\. Cocktail Family Framework**

#### **Purpose**

Groups cocktails into logical, ratio-driven structural templates to guide consistent recipe design, scaling, and variation3.

#### **Key Concepts**

* Ratio-driven template modeling of cocktails (spirit to acid, sugar, and modifier)5.  
* Analyzing how techniques affect dilution and chilling9.  
* Using structural templates to guide creative variations12.

#### **Required Knowledge**

* Classic cocktail history and their physical execution parameters3.  
* Acidity, sweetness, and temperature balance equations5.

#### **Inputs**

* A recipe's ingredient volumes, glass size, ice style, and technique9.  
* Guest flavor feedback and service consistency ratings.

#### **Outputs**

* Standardized recipe specs scaled for single servings, bulk batches, or draft systems6.  
* Valid, ratio-balanced recipe variations5.  
* Preparation guides detailing target dilution, stirring, and shaking steps9.

#### **Risks**

* Suggesting variations that wander too far from the classic drink's core identity.  
* Recommending ice dilution steps that do not match the physical properties of the venue's ice9.

#### **Failure Modes**

* Recommending shaking for a clear, spirit-forward cocktail, resulting in a cloudy texture15.  
* Scaling up a sour recipe without adjusting the dilution, leading to a thin, watery drink5.

#### **Human Review Requirements**

* The Head Mixologist must evaluate and approve any new recipe templates before they are pushed live to the menu.

#### **Examples**

* The system recognizes the Margarita as a variation of the Sour family, using a ![][image25] ratio of spirit to orange liqueur, lime juice, and sweetener to ensure a bright balance5.

#### **Recommended Implementation Patterns**

* Use a hierarchical template design where new recipes inherit their core ratios and preparation steps from parent cocktail classes3.

### **4\. Cocktail Balance Framework**

#### **Purpose**

Monitors and optimizes the physical chemistry of cocktails, ensuring sweetness, acidity, bitterness, texture, and dilution are perfectly balanced1.

#### **Key Concepts**

* Measuring sugar-to-acid balances using Brix and Titratable Acidity5.  
* Analyzing how salinity, bitterness, and alcohol proofs interact8.  
* Structuring a systematic diagnostic matrix for quick, professional corrections5.

#### **Required Knowledge**

* Solvent dynamics of ethanol and sugar-to-acid ratios5.  
* Scientific principles of milk washing and fat-lipid extraction20.

#### **Inputs**

* Exact ingredient quantities, sugar levels, acidity, and proof data5.  
* Post-shake dilution volume and measured drink temperature9.

#### **Outputs**

* Target sugar (Brix) and acidity guidelines for custom infusions and syrups5.  
* Step-by-step diagnostic adjustments for unbalanced batches5.  
* Chilling and dilution guidelines scaled for batching6.

#### **Risks**

* Over-correcting a batch's balance, driving the recipe into an unstable feedback loop.  
* Failing to account for temperature changes during dilution, leading to a flat, dull drink9.

#### **Failure Modes**

* Recommending a syrup change that throws off the acidity, resulting in a cloying drink5.  
* Formulating low-ABV drinks that feel thin and lack a satisfying finish8.

#### **Human Review Requirements**

* All automated adjustments for bulk batch recipes must be tasted and approved by the shift supervisor before service.

#### **Examples**

* The system detects that a pre-batched Sour is too acidic. It calculates the variance and directs the team to add a precise volume of rich syrup to bring the Brix-to-acid ratio back to target5.

#### **Recommended Implementation Patterns**

* Use a closed-loop feedback controller that simulates recipe adjustments before outputting the final correction5.

### **5\. Flavor Architecture Framework**

#### **Purpose**

Maps sensory and chemical relationships between ingredients to guide creative drink design and harmonious culinary pairings1.

#### **Key Concepts**

* Mapping chemical bridges using shared volatile aroma compounds2.  
* Using flavor contrasts and regional history to design balanced drinks1.  
* Aligning beverage pairings with the venue's active culinary menu1.

#### **Required Knowledge**

* Volatile organic compound profiles and taste science2.  
* Traditional food pairing rules and geographical culinary history1.

#### **Inputs**

* Ingredient chemical profiles and aromatic descriptors2.  
* The chef's active dinner menu, ingredient listings, and flavor maps1.

#### **Outputs**

* A list of creative, chemically matched flavor pairings2.  
* Custom drink pairing suggestions for the active dinner menu1.  
* Sensory descriptions of cocktails for menus and staff education15.

#### **Risks**

* Suggesting overly experimental pairings that alienate guests who prefer familiar flavors2.  
* Relying purely on chemical compound matches while ignoring unpleasant flavor clashes2.

#### **Failure Modes**

* Recommending flavor pairings that taste unbalanced or clash with the culinary program1.  
* Combining ingredients that fight for dominance, muddying the drink's overall flavor.

#### **Human Review Requirements**

* The Beverage Director and Executive Chef must physically taste and approve all suggested cocktail-and-food pairings1.

#### **Examples**

* The system identifies a terpene connection between blue weber agave, fresh coriander, and lemon zest, suggesting a tequila-based botanical highball that pairs with a seafood dish1.

#### **Recommended Implementation Patterns**

* Map ingredients in a graph database, creating connections based on shared aroma compounds and regional culinary styles13.

### **6\. Modern Bar Technique Framework**

#### **Purpose**

Evaluates advanced preparation and molecular methods, matching them with the venue's equipment and staff training6.

#### **Key Concepts**

* Classifying modern techniques from basic to advanced difficulty6.  
* Tracking prep times, equipment criteria, and safety guidelines7.  
* Analyzing how advanced prep methods affect batch stability and margins6.

#### **Required Knowledge**

* Chemistry of milk clarification, lipid fat extraction, and vacuum infusions20.  
* Food safety regulations and high-pressure carbonation safety7.

#### **Inputs**

* The venue's prep lab inventory, equipment, and staff training logs7.  
* Prep time budgets and weekly sales volume targets16.

#### **Outputs**

* Precise, step-by-step prep guides with safety and allergen alerts6.  
* Prep yield reports tracking batch losses during clarification6.  
* Shelf-life guidelines for stabilized juices and custom syrups14.

#### **Risks**

* Food safety issues (like bacterial growth during fat washing or fermentation)7.  
* Over-complicating menus in bars lacking the space, time, or training to execute them6.

#### **Failure Modes**

* Over-filtering delicate spirits during clarification, stripping away their bright flavor notes6.  
* Attempting to force-carbonate warm or unclarified batches, resulting in flat drinks and heavy foaming20.

#### **Human Review Requirements**

* All advanced or safety-sensitive techniques must be reviewed and approved by the Bar Manager and the Health and Safety Inspector7.

#### **Examples**

* To simplify operations in a high-volume venue, the system suggests acid-adjusting pineapple juice to lime-like acidity, creating a shelf-stable draft mixer14.

#### **Recommended Implementation Patterns**

* Use an automated scoring matrix that filters proposed techniques against available equipment and active staff certifications7.

### **7\. Bar Operations Framework**

#### **Purpose**

Manages prep schedules, well ergonomics, speed of service, and inventory controls to keep daily operations running smoothly6.

#### **Key Concepts**

* Designing ergonomic station layouts to speed up drink building15.  
* Automating prep lists and stock ordering using sales data6.  
* Identifying and resolving service bottlenecks during busy hours16.

#### **Required Knowledge**

* Ergonomic bar design and high-volume prep management15.  
* Inventory tracking formulas and glassware management15.

#### **Inputs**

* Real-time POS transaction logs, current stock counts, and staff schedules16.  
* Physical bar setup specifications and glasswasher cycle speeds15.

#### **Outputs**

* Dynamic, sales-based daily prep lists and par levels6.  
* Automated ordering guides aligned with supplier schedules16.  
* Service efficiency diagnostics highlighting operational bottlenecks16.

#### **Risks**

* Under-prepping before busy holiday weekends, leading to long wait times and stockouts16.  
* Over-prepping highly perishable ingredients, leading to heavy waste and lost profit14.

#### **Failure Modes**

* Running out of clean, pre-chilled glassware during peak service hours15.  
* Slowing down service due to poorly arranged wells that require bartenders to constantly step away15.

#### **Human Review Requirements**

* The Bar Manager must verify and sign off on all automated inventory orders and daily prep schedules7.

#### **Examples**

* The system flags a drop in speed of service, traces the issue to a glass washer bottleneck, and recommends adjusted washing schedules and increased glassware par levels15.

#### **Recommended Implementation Patterns**

* Integrate the operational planning engine directly with POS sales and active inventory software to adjust par levels in real-time16.

### **8\. Beverage Menu Engineering Framework**

#### **Purpose**

Optimizes the beverage menu using contribution margins, sales velocity, and category balance to maximize total profitability4.

#### **Key Concepts**

* Categorizing drinks into Stars, Plowhorses, Puzzles, and Dogs4.  
* Calculating true recipe costs, pour costs, and net margins4.  
* Testing pricing changes and customer behavior to find the sweet spot12.

#### **Required Knowledge**

* Pour cost analysis and menu psychology principles4.  
* Analyzing own- and cross-price elasticity to guide substitutions12.

#### **Inputs**

* Granular item sales data and precise recipe ingredient costs4.  
* Supplier pricing discounts and volume incentive details16.

#### **Outputs**

* A performance quadrant report with actionable strategic suggestions4.  
* Optimized pricing structures designed to protect margins4.  
* Menu layout recommendations to guide guest focus toward high-margin drinks4.

#### **Risks**

* Raising prices too high on highly popular items, alienating regular guests4.  
* Focusing purely on margin while neglecting drink prep difficulty or service times4.

#### **Failure Modes**

* Relying on incomplete drink costs (like omitting garnishes or prep waste), leading to lower real-world margins than projected4.  
* Keeping low-volume, low-margin items on the menu that slow down operations4.

#### **Human Review Requirements**

* The F\&B Director and Financial Controller must review and approve all strategic menu changes and pricing updates16.

#### **Examples**

* The system identifies a signature high-volume cocktail as a Plowhorse and suggests adjusting its ratios and using a cost-efficient base spirit to lower the pour cost by ![][image76]4.

#### **Recommended Implementation Patterns**

* Run weekly, automated menu reviews integrated with live inventory and POS costing16.

### **9\. Venue Fit Framework**

#### **Purpose**

Ensures all beverage program decisions match the venue's concept, brand identity, physical space, and business goals7.

#### **Key Concepts**

* Scoring menu items against the venue's physical layout and equipment15.  
* Aligning beverage selection with target spend metrics and service vibes15.  
* Adapting drink offerings to support localized operations7.

#### **Required Knowledge**

* Hospitality design principles, bar mechanics, and concept styling15.  
* Regulatory hours, training standards, and local licensing rules7.

#### **Inputs**

* The venue's profile, capacity, target guest budget, and decor style.  
* Physical assets list, draft line counts, and kitchen space availability15.

#### **Outputs**

* Menu alignment scores evaluating how well drinks fit the brand identity.  
* Bespoke cocktail and spirit recommendations matching the venue's setup10.  
* Physical bar upgrades suggested to support expanded beverage styles15.

#### **Risks**

* Recommending drinks that clash with the venue's look, service style, or guest expectations.  
* Suggesting complex, artisanal prep work in a bar that lacks a dedicated kitchen or storage space6.

#### **Failure Modes**

* Designing an overly complex, slow-service menu for a high-volume club, slowing down ticket times6.  
* Serving low-quality, simple drinks in a luxury lounge, damaging the brand's premium image15.

#### **Human Review Requirements**

* The Brand Director and VP of Food and Beverage must approve the system's concept scores and menu alignments16.

#### **Examples**

* The system evaluates a high-volume rooftop venue and suggests a menu centered around elegant draft highballs and clear, pre-diluted bottled serves6.

#### **Recommended Implementation Patterns**

* Use a multi-attribute utility model to score proposed drinks against the physical and operational setup of the venue12.

### **10\. Guest Fit Framework**

#### **Purpose**

Structures guest profiles, expectations, and dietary preferences to deliver tailored drink suggestions and menu selections19.

#### **Key Concepts**

* Mapping taste profiles and drink choices across target guest groups4.  
* Managing strict religious and dietary compliance (like kosher certifications)11.  
* Designing satisfying low-ABV and non-alcoholic options with proper mouthfeel8.

#### **Required Knowledge**

* Global Kashrut standards and allergen-management safety rules6.  
* The chemistry of zero-proof cocktails and botanical modifiers8.

#### **Inputs**

* Local guest demographics, spending trends, and booking details.  
* Special dietary requests and allergen records from reservations.

#### **Outputs**

* Tailored drink menus designed for the target demographic4.  
* Allergen safety warnings and religious certification labels6.  
* Upselling guides designed for different guest profiles15.

#### **Risks**

* Mislabeling an allergen or dietary status, creating a serious safety risk6.  
* Over-focusing on premium options, alienating budget-conscious guests4.

#### **Failure Modes**

* Serving uncertified wine-cask finished whiskeys in a strict kosher venue11.  
* Offering overly sweet or one-note non-alcoholic drinks, disappointing wellness-focused guests8.

#### **Human Review Requirements**

* All dietary, allergen, and kosher certifications must be verified by a certified food safety inspector before publication19.

#### **Examples**

* The system flags a booking for a kosher corporate group and automatically adjusts the back-bar suggestions to feature certified, unflavored spirits and mevushal wines11.

#### **Recommended Implementation Patterns**

* Use strict logic filters that block non-compliant ingredients from appearing on specialized dietary menus12.

### **11\. Professional Beverage Language Guide**

#### **Purpose**

Defines the communication style of the AI, ensuring it speaks with the authority, clarity, and precision of a world-class Beverage Director15.

#### **Key Concepts**

* Adjusting tone and vocabulary to fit owners, managers, staff, or guests15.  
* Avoiding generic clichés and empty buzzwords6.  
* Using technical, data-backed terms when discussing operations and finance4.

#### **Required Knowledge**

* Professional F\&B terminology and structural mixology vocabulary4.  
* Effective hospitality communication strategies7.

#### **Inputs**

* The user's role: Owner, Manager, Bartender, or Guest15.  
* The dynamic context of the interaction: business review, training, or menu critique4.

#### **Outputs**

* Professional critiques, operational guidance, and pricing decisions4.  
* Staff training notes and descriptive menu write-ups15.  
* Supplier communications and strategic management notes16.

#### **Risks**

* Sounding too overly complex or technical when speaking to casual guests15.  
* Using vague, unhelpful descriptions (like "refreshing and balanced") when speaking to managers.

#### **Failure Modes**

* Giving vague, hand-waving feedback during a drink critique without highlighting specific balance issues5.  
* Failing to explain the financial logic behind a pricing change to the ownership team4.

#### **Human Review Requirements**

* The Brand Communications Director must review the system's language templates to verify alignment with the venue's voice.

#### **Examples**

* Instead of calling a drink "delicious and smooth," the system describes it as "a light, crystal-clear punch with a velvety, milk-washed texture and bright citrus notes6."

#### **Recommended Implementation Patterns**

* Use a role-based template manager that translates core analysis into targeted communication styles based on user permissions.

### **12\. Beverage Knowledge Graph / Ontology Blueprint**

#### **Purpose**

Defines the digital data schema and semantic relationships of the beverage program, enabling intelligent, automated reasoning3.

#### **Key Concepts**

* Structuring data using standardized Web Ontology Language (OWL) classes3.  
* Mapping dynamic relationships across different areas of the bar3.  
* Allowing fast, logical queries for real-time menu and business decisions4.

#### **Required Knowledge**

* Semantic web standards (OWL, RDF, SPARQL) and categorical data structures10.  
* Deep mixology, operations, and hospitality business logic4.

#### **Inputs**

* Comprehensive specifications of spirits, ingredients, glassware, and pricing4.  
* Operational par metrics and venue structural data15.

#### **Outputs**

* Query pathways for matching flavor substitutions and pricing changes12.  
* Visual maps showing how changing one ingredient impacts costs and prep workloads4.  
* Compliance audits checking for allergen conflicts and dietary certifications6.

#### **Risks**

* Structuring data with too many complex, redundant relations, slowing down system speed.  
* Inconsistent terminology (e.g., mixing metric and imperial volume units), causing calculation errors21.

#### **Failure Modes**

* Orphaned data fields that are not linked to their parent properties, breaking automated lookups21.  
* Creating circular logic loops that stall the system's recommendation engine32.

#### **Human Review Requirements**

* The AI Systems Architect and Lead Knowledge Engineer must review and approve all database schema changes21.

#### **Examples**

* The system uses the graph to map a substitution for sweet vermouth, instantly identifying a sibling fortified wine with similar sugar levels and bitterness while verifying it matches target costs4.

#### **Recommended Implementation Patterns**

* Build using a graph database like Neo4j or GraphDB, mapping ontologies with defined OWL-DL standards to support semantic search10.

### **13\. Beverage Recommendation Reasoning Model**

#### **Purpose**

Processes operational, financial, and flavor data to output profitable, context-aware drink recommendations4.

#### **Key Concepts**

* Evaluating recommendations using a balanced, multi-variable scoring model6.  
* Filtering suggestions based on live inventory levels and staff availability7.  
* Generating dynamic upselling prompts for front-of-house teams15.

#### **Required Knowledge**

* Menu engineering, flavor pairing, and drink balance parameters1.  
* Operational workflows and high-volume ticket speed limits6.

#### **Inputs**

* Real-time POS sales speed, inventory counts, and staff scheduling16.  
* The guest's preferences, historical sales trends, and active budget goals4.

#### **Outputs**

* Highly profitable, operationally sound drink recommendations for guests4.  
* Upselling suggestions and pairing guides for floor staff15.  
* Prep alerts sent to stations to ensure ingredients are ready6.

#### **Risks**

* Pushing high-margin drinks too aggressively, leading to a pushy guest experience4.  
* Recommending complex drinks during busy hours, causing service delays6.

#### **Failure Modes**

* Recommending cocktails that require ingredients currently out of stock.  
* Suggesting drinks that contain active allergens to guests with dietary restrictions6.

#### **Human Review Requirements**

* The F\&B Director must review and adjust the recommendation weightings to align with changing seasonal goals16.

#### **Examples**

* During a busy Friday night rush, the system detects a slowdown in service times and automatically shifts its recommendations to focus on quick-service draft and pre-batched drinks6.

#### **Recommended Implementation Patterns**

* Combine rule-based logic gates with a constraint solver to instantly filter out unavailable items before scoring6.

### **14\. Beverage Training Intelligence Model**

#### **Purpose**

Automatically designs tailored, step-by-step training paths to help staff master spirits, techniques, and speed of service7.

#### **Key Concepts**

* Assessing skill levels based on live speed and accuracy data7.  
* Creating dynamic study modules covering spirits history, mixology, and operations4.  
* Tracking practical skill completions and technical milestones7.

#### **Required Knowledge**

* Professional bartending techniques and spirits education curricula9.  
* Hospitality training standards and safety compliance rules7.

#### **Inputs**

* Staff onboarding logs, years of experience, and speed records7.  
* The active cocktail menu, required techniques, and recipe manuals3.

#### **Outputs**

* Tailored educational paths and testing modules for individual staff members7.  
* Technical practice drills focused on improving speed and accuracy15.  
* Dynamic menu study guides featuring flavor profiles, pairings, and allergens1.

#### **Risks**

* Overwhelming junior staff with advanced techniques before they have mastered basic workflow skills6.  
* Relying on dry, unengaging manuals that fail to build real, consistent service habits.

#### **Failure Modes**

* Providing outdated training notes when recipes or ingredients are updated.  
* Staff passing written tests but struggling to execute drinks consistently during a rush7.

#### **Human Review Requirements**

* The Bar Manager and Head of Training must approve all educational content and testing standards7.

#### **Examples**

* The system flags that a bartender's average build time for sours is slow, suggesting target training on double-handed pouring and clean station setup7.

#### **Recommended Implementation Patterns**

* Use an adaptive learning model that adjusts the difficulty of lessons based on the bartender's daily performance7.

### **15\. World-Class Beverage Director AI Blueprint**

#### **Purpose**

Serves as the central operational brain of the platform, connecting inventory, sales, staff, and menus to help managers run highly profitable bars4.

#### **Key Concepts**

* Connecting financial, operational, and guest data into a single hub4.  
* Translating sales trends into actionable operations and menu updates4.  
* Automating prep lists and stock orders to protect margins6.

#### **Required Knowledge**

* Enterprise hospitality F\&B systems and inventory control4.  
* Supplier programs, pricing, and local compliance regulations7.

#### **Inputs**

* Comprehensive, live feeds of POS sales, stock levels, and staff schedules16.  
* External market data, distributor sheets, and seasonal trend insights2.

#### **Outputs**

* Strategic business dashboards detailing pour costs, sales volumes, and staff speeds4.  
* Real-time operational directives for daily prep, well setups, and inventory6.  
* Bespoke, cost-optimized seasonal menus matching the brand concept4.

#### **Risks**

* Relying too heavily on automated numbers, overlooking the human elements of great hospitality.  
* Managing complex, bug-prone integrations across multiple legacy restaurant software programs.

#### **Failure Modes**

* Relying on incorrect inventory counts, resulting in inaccurate costing and bad orders4.  
* Failing to adapt schedules to sudden weather changes or local event shifts.

#### **Human Review Requirements**

* The VP of Food & Beverage and F\&B Director must review and sign off on all strategic business plans and menu changes7.

#### **Examples**

* The platform detects an upcoming spike in lime costs, automatically recommends adjusting the acid balance in high-volume recipes, and suggests a seasonal spritz to protect overall margins4.

#### **Recommended Implementation Patterns**

* Deploy as a modular event-driven architecture, connecting specialized services to process live venue data simultaneously.

## **Strategic System Recommendation**

To build a world-class AI hospitality assistant operating at the level of an elite Beverage Director, the platform must move away from simple recipe lookup tools4. The system requires a unified, multi-dimensional reasoning engine that connects the physical chemistry of drinks, day-to-day bar operations, and business profit models into a single, cohesive brain4.

                            \[Hestia System Core\]  
                                     │  
       ┌─────────────────────────────┼─────────────────────────────┐  
       ▼                             ▼                             ▼  
┌─────────────┐               ┌─────────────┐               ┌─────────────┐  
│  Semantic   │               │ Multi-Model │               │  Faceted    │  
│  Knowledge  │               │   Reasoning │               │ Operational │  
│  Graph \[3\]  │               │   Engine    │               │  Ledger \[3\] │  
└─────┬───────┘               └─────┬───────┘               └─────┬───────┘  
      │                             │                             │  
      │ Classes: Spirits,           │ Simulates balances,         │ Tracks real-time              
      │ Cocktails, Methods,         │ calculations, and           │ sales, stock levels,          
      │ & Glassware \[1, 2\].         │ cost models \[11, 20\].       │ and staff schedules \[35\].

At its core, the system must utilize a **Faceted Semantic Knowledge Graph**21. By organizing data into distinct classes (such as spirits, cocktails, and glassware) and defining logical subclass hierarchies (like Bourbon inheriting from Spirit), the AI can make smart, context-aware decisions3. It links these entities using clear relational paths (e.g., a cocktail *uses base liquor* spirit, which *has financial metric* pour cost), ensuring that a change in one variable immediately updates every related operational and financial calculation across the venue3.  
The reasoning engine should follow a **Multi-Model Evaluation Flow**, processing requests through several specialized steps:

1. **Sensory Integration Model**: Uses exact sugar (Brix) and acidity metrics to evaluate flavor balance, design new drink variations, and map food pairings1.  
2. **Operational Solver Model**: Evaluates the physical reality of the bar, analyzing equipment, layout, prep times, and staff experience to ensure consistent execution6.  
3. **Financial Ledger Model**: Monitors and protects venue margins, running detailed costing audits, tracking waste, and suggesting dynamic pricing models4.  
4. **Guest and Venue Filter**: Guarantees that every suggestion aligns with the venue's brand style and protects guests by maintaining strict compliance with dietary and allergen rules7.

By integrating these specialized models into a single, connected architecture, the AI acts as a true strategic partner for hospitality teams7. It helps operators preserve the artistry and creativity of their beverage programs while maximizing service speed, consistency, and profitability across the entire business4.

#### **עבודות שצוטטו**

1. The Science behind Wine and Food Pairing | Georgian Scientists, [https://journals.4science.ge/index.php/GS/article/view/4917](https://journals.4science.ge/index.php/GS/article/view/4917)  
2. The Art and Science of Flavour Pairing \- EPICSI, [https://www.epicsi.co.uk/blog/The-art-and-science-of-flavour-pairing](https://www.epicsi.co.uk/blog/The-art-and-science-of-flavour-pairing)  
3. Ontology Design for Semantic Cocktails 2.0, [https://dh.aks.ac.kr/cocktail/ontology.htm](https://dh.aks.ac.kr/cocktail/ontology.htm)  
4. (PDF) Examining a menu on the basis of the Kasavana \- Smith model in a Hungarian restaurant \- ResearchGate, [https://www.researchgate.net/publication/361725028\_Examining\_a\_menu\_on\_the\_basis\_of\_the\_Kasavana\_-\_Smith\_model\_in\_a\_Hungarian\_restaurant](https://www.researchgate.net/publication/361725028_Examining_a_menu_on_the_basis_of_the_Kasavana_-_Smith_model_in_a_Hungarian_restaurant)  
5. The Cocktail College Podcast: The Ultimate Guide to Acid-Adjusting | VinePair, [https://vinepair.com/cocktail-college/techniques-acid-adjusting/](https://vinepair.com/cocktail-college/techniques-acid-adjusting/)  
6. The Art and Science of Milk Punch (Milk Washing) \- The Double Strainer, [https://www.thedoublestrainer.com/post/the-art-and-science-of-milk-punch-milk-washing](https://www.thedoublestrainer.com/post/the-art-and-science-of-milk-punch-milk-washing)  
7. June 21, 2024 California Fine Wine and Spirits, LLC (A} OBA Total Wine a \- City Clerk \- City of Los Angeles, [https://cityclerk.lacity.org/onlinedocs/2024/24-0767\_misc\_1\_6-25-24.pdf](https://cityclerk.lacity.org/onlinedocs/2024/24-0767_misc_1_6-25-24.pdf)  
8. A Guide to: Flavor Pairings and Recipe Development \- HBG \- Hawaii Beverage Guide, [https://www.hawaiibevguide.com/flavor-pairings-and-recipe-development.html](https://www.hawaiibevguide.com/flavor-pairings-and-recipe-development.html)  
9. Camping with 20 people : r/cocktails \- Reddit, [https://www.reddit.com/r/cocktails/comments/15kj1hk/camping\_with\_20\_people/](https://www.reddit.com/r/cocktails/comments/15kj1hk/camping_with_20_people/)  
10. BEVON: Beverage Ontology, [https://rdfs.co/bevon/latest/html](https://rdfs.co/bevon/latest/html)  
11. Is That Whiskey Kosher? | Alcohol Professor, [https://www.alcoholprofessor.com/blog-posts/blog/2018/05/17/is-that-whiskey-kosher](https://www.alcoholprofessor.com/blog-posts/blog/2018/05/17/is-that-whiskey-kosher)  
12. Menu engineering re-engineered: Accounting for menu item substitutes in pricing and menu placement decisions \- ResearchGate, [https://www.researchgate.net/publication/339786009\_Menu\_engineering\_re-engineered\_Accounting\_for\_menu\_item\_substitutes\_in\_pricing\_and\_menu\_placement\_decisions](https://www.researchgate.net/publication/339786009_Menu_engineering_re-engineered_Accounting_for_menu_item_substitutes_in_pricing_and_menu_placement_decisions)  
13. (PDF) Flavor network and the principles of food pairing \- ResearchGate, [https://www.researchgate.net/publication/51959358\_Flavor\_network\_and\_the\_principles\_of\_food\_pairing](https://www.researchgate.net/publication/51959358_Flavor_network_and_the_principles_of_food_pairing)  
14. Acid Adjustment Calculator | Balance Cocktail Acidity with Precision \- The Forager Bar, [https://www.theforagerbar.com/acid-adjustment-calculator](https://www.theforagerbar.com/acid-adjustment-calculator)  
15. Responsible Alcohol Service Guidelines | PDF | Alcoholic Beverages | Beer \- Scribd, [https://www.scribd.com/document/826163892/BAR-MANAGEMENT-CHAPTERS-7-12](https://www.scribd.com/document/826163892/BAR-MANAGEMENT-CHAPTERS-7-12)  
16. BAR SERVICE Sample Clauses \- Law Insider, [https://www.lawinsider.com/clause/bar-service](https://www.lawinsider.com/clause/bar-service)  
17. Contribution Margin Pricing vs Factor Pricing for Bars \- BarMagazine, [https://barmagazine.com/contribution-margin-pricing-vs-factor-pricing-for-bars](https://barmagazine.com/contribution-margin-pricing-vs-factor-pricing-for-bars)  
18. PENERAPAN METODE TWO-STEP CLUSTER DALAM ANALISIS MENU ENGINEERING PADA USAHA KULINER THE IMPLEMENTATION OF TWO-STEP CLUSTERING, [https://jtiik.ub.ac.id/index.php/jtiik/article/download/2012/pdf/12033](https://jtiik.ub.ac.id/index.php/jtiik/article/download/2012/pdf/12033)  
19. Keep it Kosher: Understanding Kosher Wines & Spirits \- Bar & Restaurant News, [https://www.barandrestaurant.com/food-beverage/keep-it-kosher-understanding-kosher-wines-spirits](https://www.barandrestaurant.com/food-beverage/keep-it-kosher-understanding-kosher-wines-spirits)  
20. The Science of Clarified Cocktails \- SevenFifty Daily, [https://daily.sevenfifty.com/the-science-of-clarified-cocktails/](https://daily.sevenfifty.com/the-science-of-clarified-cocktails/)  
21. A Categorical Model for Faceted Ontologies with Data Repositories, [https://digitalrepository.unm.edu/cgi/viewcontent.cgi?article=1036\&context=ece\_rpts](https://digitalrepository.unm.edu/cgi/viewcontent.cgi?article=1036&context=ece_rpts)  
22. How to Use an Ounce of Bacon Fat to Infuse Your Bourbon with B \- LifeTips \- Alibaba.com, [https://lifetips.alibaba.com/kitchen-hacks/use-an-ounce-of-bacon-fat-to-infuse-your-bourbon-with-b](https://lifetips.alibaba.com/kitchen-hacks/use-an-ounce-of-bacon-fat-to-infuse-your-bourbon-with-b)  
23. How to Make a Smoked Cocktail Without Any Fire: Science-Backed Methods \- LifeTips, [https://lifetips.alibaba.com/kitchen-hacks/how-to-make-a-smoked-cocktail-without-any-fire](https://lifetips.alibaba.com/kitchen-hacks/how-to-make-a-smoked-cocktail-without-any-fire)  
24. Fat Washing: Revolutionizing Cocktail Flavors and Textures \- Felene vodka, [https://felenevodka.com/fat-washing-revolutionizing-cocktail-flavors-and-textures/](https://felenevodka.com/fat-washing-revolutionizing-cocktail-flavors-and-textures/)  
25. Acid-Adjust Your Fruits\! \- Empress 1908 Gin, [https://empressgin.com/2025/02/acid-adjust-your-fruits/](https://empressgin.com/2025/02/acid-adjust-your-fruits/)  
26. Calculators | DB's Hideaway, [https://www.dbshideaway.com/calculators](https://www.dbshideaway.com/calculators)  
27. Sushi and Wine Part 3: The Conclusion and What You Need To Know, [https://aaronberdofewine.com/2012/02/16/sushi-and-wine-part-3-the-conclusion-and-what-you-need-to-know/](https://aaronberdofewine.com/2012/02/16/sushi-and-wine-part-3-the-conclusion-and-what-you-need-to-know/)  
28. Fat-Washing Cocktails on an Industrial Scale | COMSOL Blog, [https://www.comsol.com/blogs/fat-washing-cocktails-on-an-industrial-scale](https://www.comsol.com/blogs/fat-washing-cocktails-on-an-industrial-scale)  
29. Laboratory Manual on Milk Proteins | PDF | Analytical Chemistry \- Scribd, [https://www.scribd.com/document/503740963/Laboratoey-Chemical-Analysis-Protien](https://www.scribd.com/document/503740963/Laboratoey-Chemical-Analysis-Protien)  
30. A comprehensive review on yogurt syneresis: effect of processing conditions and added additives \- PMC, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10169984/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10169984/)  
31. Yiyecek-İçecek İşletmelerinde Menü Mühendisliği Uygulamaları Menu Engineering Practices in Food-Beverage Businesses \- DergiPark, [https://dergipark.org.tr/tr/download/article-file/2281046](https://dergipark.org.tr/tr/download/article-file/2281046)  
32. The Beverage Ontology as an entity-relationship (ER) graph. \- ResearchGate, [https://www.researchgate.net/figure/The-Beverage-Ontology-as-an-entity-relationship-ER-graph\_fig1\_228928406](https://www.researchgate.net/figure/The-Beverage-Ontology-as-an-entity-relationship-ER-graph_fig1_228928406)  
33. How To Acid Adjust Juices \- Kitchen Alchemy \- Modernist Pantry, [https://blog.modernistpantry.com/advice/how-to-acid-adjust-juices/](https://blog.modernistpantry.com/advice/how-to-acid-adjust-juices/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAAWCAYAAABud6qHAAAEdUlEQVR4Xu2YW6hWRRTHV6igeC9FREPUENJD3oPA1IdCRZSsJFAJood88E3wUiDnxQcFe4hCqEQUwkp8EFQkevjQB0WhG4QiCscIxcQEydDCy/rtNev7Zs++fOccFMO+P/zPOTNrZu+Z/6zL7CPSQQdPC0YpB6SdCQanHf9nDFLuVv6s/Fb5bN7cxEjlyrSzlxiiXJJ2PkngJXOUE1KDmCDjlM8k/QgwImpvVP4qNnar8qLyDbH5gPkvKX9UDgx9fcVryvtpZ4Shyq+Vv0X8Xvl5xPeVz/mEgGnBFvPV3AiRL0J/E3jHTeU+sU0tio2K8crLymvKb8TG9Sj/VM4OY8aIiYYNTFE2lJ+KCcgGrip/UZ4LY/qDT5QPlMNSQwAHslh5WGzceeU65duB25S3lf9I3hGIjo+U98TmMT91ovfE9pIBr7mgnBTaPAwRXRDgwvFAJw+YH42ZK7agzaHNxg4qX2yOsDCjr79h6ofD+3lfHVgH4xpSFBlPuivFdZB3j4rNO5DYHNv5MVp5Vrk2b8tE6pGW4gjXCL+rMFN5S/lhaA8X82Q8D3AQJ5UTQ7uv4EDx3i3hd0OKgsSoE442/TC1TVb+LjY3xSvKM/zhnrQiZ7Y+8gj5BPRGODz3tPIrsU12KQ9Ja2FHpHjCfQF585SYpy0V8+46r6sTDofoUXbnuzOw9r1ic4mQGKSJzOPqhGPim6HtwuE9a5Q7ldOlWCywXVe+LJZEyS2Oz6T/BQEg1ndiIhCyrM/TQhmqhEOML4ONwy4D78Jx8LAYeFvW56H6Qc7cclVfGMKRByEVaYPyjtiJecUECPmOWCEg0bqNMO1viDoIz1ioMlFiuHAcJB7EQVLYyN8/SdFZYngu7U76/eAypMWBNtWTl6aCxuDFjCE8q4CQm8S8DcwQE/UtsevKx2FMb5BbtLSKRHfUF6PK4wB79CtKfPAx8Cy8Du8D5L640GWggvwttikWdEnspcviQQkWKP9V3kgNEQhZLwie3PFwPJ2cdVxsQe3AXK4P8d2Mth9cWcjVCQfIt1w9Fif9DkKa+ayZ91NAS1MNpZhLIYPIcQjiCjP5ivL10AZ+/YBlYDOUdi8InhYa0toIucYLUB0QmXGkDOdqMY+4K8VcBNoJx/rjdFQG7KQt8vmxxJYp+0LSh/fhha6wF4tdzRGtUOVSWwYPUX+GF6KGtDZCharLNQ7CJd18fKfrzpsytBOOiMGeXsVisDfGUAxPJLascnJt8NJLeLHpOPesFxOSzxkwVsx70ouyA2+LvRP45ZLQ5Y7HZtILcgrGvCvm1Wk48k8ENs3G8Lr0nwocMjauMF6YGDNVLLdhWx76q0C0MI6UhNA5sCA2w8PYCN6WJkzaO8Ry3x7lH1L8cnB4QShL+iyEkO8SKxD7pfguh3u0E2+N75GIGdshXobYjRJbzL/EvjvbgRRxTqrzqCwUO71VUvz4jfG82PfePKneMB5YyAcBnDiicgA/SKuS/5eBNrPSzscBBPWQrgJeUSV8Bx100MGjwEMZ/hGQj8xLUAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAZCAYAAACl8achAAACQklEQVR4Xu2VP2hUQRDGP9HCoCiKIBJUIiIEJI2CCBYWKSyiQYhgECxViK2IJMW1af0DYnOlBNKJElBQrIIW2gQhGDjFRgXFwkIk0e9j3ubmzb3bO6wU3w9+cG/n7d7c7M4eUFPzRxwr/KdYoot0ewwUXKHvnSt0jt5znqNb0gRyiN4O78gb7h2hZx+fRnmdrqzRn/REDBQM0wl6jf6gd4pn7y/6jY7RDXQnHadT9CusMBfQuaN6vgWbO0NP0k3+hSoG6SvYl76hu8vhEnvoO3o6BmDrtGDr3C+HMFqMnw/jiVN0VxzMcYaehVVbaoFu5JLeQV/CknsSYjp26cfEKuo5/sgsaYL/wmbpjTK5pI/Q77A11AMRjeuYHA7jQ7Cd7hs/oQFbuJWCFeSSfg6bf5cOhJhQwopfDeN6fhjGuqIqz9PLxfNW+gy2cNzCREr6YvHZ+5Z+opN0Y5rg0LFLR1BnXBynL5DvoxK6EV7TA27sOixpP+bJVXo/XYbNnw0xocTU6IrrKhQ3i8+6bfpC27JKP6B9/36BLZqqH8klLbSm5utarKIBi+s79SNUZVW7L3TmHtFLKG+xqvUYdsY2r7/dplfSGldSsgrfrLr+nsKOZV+og9WAasSIqlXV5aJX0vrzyCWtYi3A4g/Q2ZRdUQV1FNTtB9F5nrRtWlRX4N4QG4E1mxrR74Q+a3c07zM96mIRFUrHo4nO767Eb08yVc3fHl69nxo050dYA25DHiWq5sv9if2V7EP1XV5TU1PzP/MbUa2XgQLf3I8AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAZCAYAAACy0zfoAAABsklEQVR4Xu2VvytGURjHH6GU30nIgPwJijIopUwMfi1isioTm2LCH4BsBhNlYZH0bgaTMogMZLKYyCK+357zuPee997rdZPF/dSn3vd5zo/nnHvPuSI5OX/PEHwIeQ134Y5zA/bBcutQIk1w2A/+lHY4AV/gB1x3/+k0PHPxU+tQAtWi7dmvystl4l50sBE/AcZEc9zlUqmTX9g5I604xpJyf0JacUuiuS4vXuMkDaHfBh9pmRfLRFJx/fBZ9J002iRovwaP4C18h7Ww4HLUCt6S4NA9wgXYAs9D8XnXtgibbFZ0ctoBl+EbPAmafsH2F7ARtsKVUK5HdEH+bnIcLmLU5biwb0naOTIuOmCvF2f7PYl/dEnFccE3zk24HU3Hk1YcJyjAQ4leDWzPOzGOpOKILfYSNnu5WNKKIyyCbfi4jazFdcI70f6L0VQ8acVVwAMJ3i8jS3H18BjOiV7U4YOWyJPoZDOw0sU4MC9gniTmOLDB94yxfYn/CgzAVwkWw89ft+jhGnQxjrEq+t7y5BZhF2yaV3DKOkj0KjELEtx7/B3OTXoxa2u768dzcnJy/gWfnwyBmb19PD0AAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAaCAYAAADi4p8jAAACjklEQVR4Xu2XTahOURSGX/kPISIxkBiI/CRGlIH8JDIgAxMzE6VQiom6DEgpyQQhI1KUFDJQFGVCEROFjJSMKBTe566z+/Y5fffWzXXvVuetp+631zr3O2uvn70/qVWrViVpoTlnnpoP5qKZUvOoa7K5ovB9bs6aublDaZputpl95rf5rAi6m0aYg+aHwne72Wwm5E6lap0iIz/N6oYtaZUiey/Nr4ataI0zt80ZRWYO1c29Ins7zB6Fz526uWzNUfTgfsXLX6ibe0X2xppL6nsTihXledNsUSc7ZDVporms6NdX6r+Mi9RxRUZWmK/mmZma2cnsLkVQBPfWzMzsRWueeWRmq5MhgiTY8YpyXVT53lBkmD78b7TVXDejFOP+gSIIypVA8mDemW9mZbb2N+L7OHb+6THD5KQEkzgGCJC1q4r+S+JoIMNkejBEG5xW/TsGVZPMPdUHBr1IgKfM8mwdsc4U5cgYqBha+eBCO819dQ8Q35HNxYGIh68pBsZidV6aiUqmKNUkbMvM98qefFPP7q0+v1H0NFqv8JtmXih6Gdt7s7HyYTMfqh4ga3cV/b9bcXxxPZyluBay6awtrfy7iqsYVzIyknic2V4rzr0x5lbDL7Gp8mcCpxdiY1LP0ltJoxUbOt88UecMbQaYNuyEIqANig0hGD4zyYdclPdHs8ScVJyhvExPZSeLlCKVwr21vwB5joB4lr+B44gN4m8G35CL8qFkziuCpEwPKIJCa80Xs0YxVDhjj1S+eYC8fLIz+JoatgDRUcUFgMFABimz1IuULBnmOrjAfDLHKrClqcwvGsTm0LMzFJk7rMjisAZIfzGRES/V7Vzr6zcmzzKImhOT/wOtWrVqVZb+ADy1gz08KugHAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAaCAYAAAA5WTUBAAABiklEQVR4Xu2UsStHURTHj1AUSUTK/yBJSsxIFguDQVkMJgbMMliVxUAGg1kig0Qxyp9AZoNikfh+O/flvOP9kPeu3/I+9en97j2vd8/v3nOuSEnJV2rgCtx2evbl+3gumMQgvIPv8ApOp95QdkTjN3DOxQqD/5SL7PlAYAYewiYfKJJF0SQuYbOLcbdWwzMqE6JJ8Fi6XGwYtrm5KPTDF/gEe8x8Czw146hwYSbwCofM/BLcMuOosA5YDzySZVgPD+C8fSk2DfBINIlNOBnGUbshC7Zn0qbXcCAd/h94DEziAq5JMS3JHe6AtT5QiTHRJN58APTBRzgVxry8OO418QU4Ds9gNzyBjSE+K9ppP8IPPcNdHxCN3Ycn4SIPcN3EbVe1ww3RO4eOSLr1K8KsWZD8gMcnwYI9l89rnvNJjHBhHmmSBGXH5cInkbUTNolW0S4rlKQmRsM4qyZsEuRWtCgJd6HTxP6E3QlW/G+rnYszkdxHQfxxVIVj0fblJcZWrgr24qozv0sK4wO9OkfwCRmbMAAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAAByklEQVR4Xu2VzytEURTHj1AUSYqUUgpZWVgpSxspCUWxUDYWWBDKajb+AQvKzywsZMHGzkLZKP+AxIKUnYVSpPD9du419x00ZjRP6n3r08w75857Z77n3PtEEiWKV11gG5yDG3AAVgOaQMHH6hjVAgbADrgGo+6ajIE3sAcq3PrYtQTWbRDaEi1uBRSZXN7VAO5Aq02IOsnCzkClyeVdPaIP/+rBt6K5GZuIQ4uiD7cqlnQb+T1WlYFj0QJqQSPoBVPgEnTLH+1K30bOUKgRF/dOVYMTF7sXPVouwBqoc2usOBopG/ypfBvtjmwDj6IuhmKMOa8j0QLrg5hXBziVHI6asI3D0ZR0glfJXFif6O+ng5jXAngG7TaRSf6YeJDPR4V3ssbEbWETouuGghjFNi6Lrk9FU5nF+eBNebKXBHF+P3Q5uloKdkULoov7kn5l8XXWrD+LiG7RqXnJwjW6Q5f44JDwZOd88N9Ois7frOjutI4NgifQH8S8W5wtP6upIP9rVYm+M3nzQhezhbHVV6KzSncp/iluCjq6ITouOW2CbPRdYTxKyl3Mt9GL7XwRLThvsoXNic7duLumy5vu08u3kxsqUaJE/0bvyCln+jAJLNAAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAACRUlEQVR4Xu2WP0iWURTGj5igmKiYoJRgoDlIEoS4iJOLQ1NJZqO46VAOkntE0pBCi38QB0EwwoimgsKhQRcJRAcdFBUKJBQdRKyeh3Pv916Pn9+b4QcO7wM/3u+ec+6957zv/fOJJEqUKE55oBaUWEcg+hjD2GyqCYyDkTQ8C+JSygU9YA8sgG3wUk4mWgHegR/gPdgR7cO+2dB18AD0ggPRvDqcjQWeEqvbAI2uPQ2OQatrF4PPogOVO9t9cAT6XDtbqgTrYNI6QtWDJXAtsHWLfrJC1/4omnBzKkI1DP4Y20XLF9FvHaHonAI51hGIg/CT3jV29v2XIvIlGp+/mVgo+src0yq2CA7It/wCtIFF0X3xSE6udRaQqQiOY3UVfBX1k9vgk+iy/QnGQBF4CFbAPtgVzSNUbBFcQlxK38EbUCD6Nrh0Xkm0seOKYMJW/u22g0PwBdQEPvablWjearAGNsFNF0fFFuED7HJ6LjrJW3BF/q8ILz/HDWNnv8mgzXk4H+33AntsEaWiJ86Asfvk/Ia/iCLsPrBFUGyfuwi/J2yAT85PzmemIjIp60VQdPKoDMUvw8F4N/CY5fO3RPeGFzfnpSjCr/mmwMYNxsR5yVFcz8tgLrAxnv1eu/ZZahA9jeoCG08+Jjsj0cnGl/XB2Xkze7HfFhiVKJbPLtHTLCXe0L/AEBgE3+T0RrwDVsE8eCoaPyHRhWhlj1jCdqexEb8sQ56ksaUjpRxwS/QNPJaz/w/xyG0R/f9SZXyJEiW6BPoLH/mqi9yI8ggAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAAB00lEQVR4Xu2VTSgFURTHz8tHhBQiIZSyYqPYWinJQohY2qJsyEbJ0pqFj4U1C2VhQVE2yoKFhZJCLCgLhaJ8/P/vzvXunOZ51Dy9xfzq17w558ydOfPm3isSERHxG2p0AGTDMhhT8RxYqWJh0QZX4VKA006djwo4D990QsyDXsEnuCtmoEP4CmecujCpgn1wDD7DIzjoxdigj3L4Dl+846c/Hcc2wZyVzY7DLKcuHdh7r+lEEIVwX5I3cQJbdOIfsE1M6UQQ6WwiTxLzib/1PGKu1DtqQm+iFXbBRdgtZmInwx2PNsEdeA3v4QosggPwTMx8e4Sd4ifUJs7hJZyF7fBCzGSr/q7yY99uv5gFYA82ODneZxMuwHxYJ2bMG1jv1ZHQmgjCDv6hEwpbp5vlfdzJymV8w4vzX7aktQl+CgeSut4+hJ4HugnC87Q1MQcf4LAT+6neJWOa4CD2G871Ytwc+Q0H1bv8axO18FjMIHrV6YXbsMQ7Z567NmsnbVESmsWsRo1OjBskr10Xs+SSArjlxbkzW3jdLVyWRC2PI2JWszj8B3hhkPaNxOAovBPztk4l9Y6tl1jK8yEVo3zLOjYREAvyz/AT6oEdsFjlIiIiMoAv5qabDVOpwsUAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAWCAYAAACCAs+RAAACPUlEQVR4Xu2Wv0uXURTGn1AhUTL8Fe21FE0R4mCTRQ3O/g/SVFjU5C45NDQ09EMIC1uiwLGXHBQcmoyWwEKLaoiGggh/PE/nnrj3fvvq99urhPA+8AHvvec9733ee+75ClSqVKlZHSDH8skGNUXekw/kbbZWRl3kGSz3g2ytRjJwgjwlK+lSwxog4+QneZetlVE7uUhuYQcjp8g6+UE2UW4TnaRAuRz1dBo7GHEp8DvKbWLfGzlMWrC9kSPkKOmHxf5NyqMKUWxbwJUb8XfWqFkjulej5DP5RN6QCbKINIfixsgjcoe8Il/DfKyX5Dm5TO6TjzDjLjdyhizBLv832P1J1KyRK2SDXId9GaG/83umr6su5i/UV75Hzv2JAFrJQ6Tm1DxyIyvkLqyTSeqQyx7gataINqxOEksv1vPb5ZCR80jL5CAsn07rKjkZ4mJpfwWsfF0aa8+J/sXItWyunhGdlspGnVFrL1B7cVUqyumobOIT+u9GVAaz5DY5FOb0riewknJ1kBHY/dCdU/7BaH1PjTRSWpdgsXkHKkgf7C7IrLqZSyehRnIjmmvIiB68QH7BulB8pPV0ExavFypeG52AbVrJvTXmRrTpOTJPhskM6Q3j7hAjHUfaEM6SBdITzWmscv0tfcW4Np0Cqftc2tg4LFFBXofxGtLn9S/GJOwi616odcqAYr6QoRA3TVbJ44DKSx/ITznem/KorH28K5Ih/wHTKahE4rbpyn8MdTJ+Sl4BnsvzVapUaRe0BU7lm+uzw7TgAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAAg0lEQVR4XmNgGAWjgDBgBGIVdEF6AZDlWkC8EYgfoErRB+gC8V8g/gbE/4H4Iao0fYExEH9lGHUEeY5wBeJHQNyOLkEuIMcRCxmonI7IcQTVwagjYGDAHQEqMT2A+DcQv4LyiQFUS5iSDBCD0PEBIOZBKMMKgoD4BxDPR5cYBaNgSAMAqNYm0vwoOmEAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAWCAYAAAC2ew6NAAABOklEQVR4Xu2UsUrEQBCG5xALUTkEEcRGxMaDQ0FExE5EtLAU7HwM8Ql8B5sDGxsbK9sDwSfQSoSzsRBsBG1E9BsmCXtL3CJmA8J+8EF2ZhP+TTYrkkj8P1q46BcdtD+DGzji9RpBA3TwCgfDrYJ5vMU7PMMHXHEnxKaLX/iB3/g03C7QgJc4lo1P8VFsAY2yiu9SHnQCX3HJqc2Kzb3HaacenVDQBbG6hsvR8H2xe/TexggF1d5vQXW77Dt1H513LjXu51DQbakeNH/usd+oSijonlQPWjuhoH/59LUTClr2M03ijdixtubUoxMKOoVvuOzU8uNpgHNOPSot3MVPfMnGPs/Yw9FsfCK2sPViRjm1/Uz6ZnSf+fbF9mHOltgiLvBQ7JMfSPmiXNp4jZt+IybjuINH2XUikYAfqcdLBB/u/fUAAAAASUVORK5CYII=>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACTElEQVR4Xu2UTahNURiGX6EI+buRKBIDEemWiYGRGRIDJZkYMCfCUKYGoispISV/E79FOWWiFFEyoZBIQikTJd7Ht5az99r73mPglMF96zn77G+vvde3vj9pVP3XNDO2NBaaUBr+lcabIfPEXDQz6o//aKrZUBpL7SgNSWyy2Mw0Y4pnaLd5Zmab/eaF2ah4D/HOcvPYjEu2Vi0wZwobL68zH8xb81OxwZrKmgGFA/ndhaZjjinWvjHvzVPzPK1pFR6fVtMJQkeIF6X7LeaH+WJWJdug+Wb2pfvJ5pJZku7RxGQbNhXzzV2zR00nXitOX7VvSrZPio1WmK/mQHo+RVEXRAStNPfNvHTfEBE4YbaZ9Wo6cU2xITnPYh02Tk8UKLYH5rwifcvMFUVE0HWNEAG02ZxVONPmBO3GyaraqXDilZmbbFvNR0WKTioOlXVcPYrxnlma/rc5UYrc3lY4cUjdTuFKvVCEB9XtClIxbBoQIeKjWX/jBAV5S5GCkYRTexVRQBwUB4k8LXwE4yxzJy3I6uUEBXzOTCoftIi05GLEIdr1oZmumCVE8/eG3xXeZT5XbBdU34yT43QOMzlerfbJyNob6hYjG+NAR91iPcUP83tOwXZFL/O/OhlJGcVGGLP48FW15zunIRcj36PVO+o6cThda+KEuxQtWY0AH6QI27isZtUThbWFjQMTGdJDp+VhVhN1UG7QUSzOw6qNo6orF2OOYFWk5p1ihuSx0BfRjjdLYxLzBgdfmkeKIu+LSGmvziG6ubhH9f/oFx8Aess9cwZqAAAAAElFTkSuQmCC>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAACOklEQVR4Xu2WTUhUURiGv7AgqSjSfiSDglJcWFKL2UiItGnRysSoZdsCfxbRWtxL0KaSmJULIxRpk4JDbqRWLtQWtkiKUIgQLAhJfd++79w5c7hcL9MMurgPPNw5v/d8556fEcnIyEjiBGwwk2C9y/BQWFBhcnAEPo/xiVcvogAXRRvNwlF40q8AzsI3cBVOwB/wIazxK1WQc/AOfAR/wY/wruUxwBJOw14pDuYA3Ibv4FHLOw6nRTs6ZXldcBMOWLpacGV8gfmwwKdDdNCM0sH0Frxp6beiA26PaihPRetWExfE47DAhzN/1Z4ODmwJnrE0O+EnvR7VUNhxmiAOS7F//g73Hcvq7BmSKogQLq+/osvFwQCSguDAQrgUC6LltBVOwRW4Bl/CY7AHfoIbcB3eklJSB1Er2nhItEGnlM7KbkG4vePjZrcb/oEz8JJXxnbj8Jno+y/Az/ArvGj1SOogQvgCbuJGS5cThMMNwvXlYLu8lz4IX1v+bS+/7CA4G+xsWHTWKhFEuA/CIAjTZQURd8EVRDtbgPXyfxu76kHw/J+D86Lr18ELzw+Cd4R/5Dq4Ofc8CC6VQXgtyGdH32GLpbmeeeS+Fw2c5ES/DpdcEldET6NmL48XK98xJsWT7QictHz/zmK7b/CFFOvy+UD0NPsHT4bfoidFv2jHH2CTq2C0wWUrY72f8JXoy+MIj1jK9L0gj7pl6dsXkxdnBJcSP+F90VngF4qDf/puiP5/OR+UZWRk7AN2ANKdpXOaISnlAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAADQklEQVR4Xu2Xy6vNURTHl1DkTV5Rt4S8IhRFykQYmJAMTMz4B5ChdMvEgBQpZCQyIAOPpBOFKK9IiQF5FEkURV7fz9m/dX777PM7557rnjug37e+uWev/dtr7e9ae+3NrESJEiWKMUAcJy4TuxJbu5ggXhdfihVxeJ21b9gmvhJ/iusSW8dwS3xnuaMD4rC6GT1jqLhWPGadF2G2+Eb8bf0kAplfbaEawFQLzq6Io3xSL7DYOi8COGH9JALZZrMvxMnROGWNwzPioGi8HfxzIpD9feJlqw+6Ynk1tHMsJlr+fTMRRlsQOhY7xRBxhoXqHGn1c1MR8MmazeD+mDc4sQGOGFVfBUIMzG1VPLbgkN7QCpPE0+Ij8a54T9xljSI8FG+IRyxs5qY4M7IDfPH9bnGH+E3cGdldhE3idsv7F+vWNpOBtanuoxZi+2T5cSdmKhwf3dlYIX6JH8WFqSEC2Xqa0TFWvGSNIqRV9Vx8YvXB85usORC3SAQ2jxBgjYVYT/okYYH43vJ+RhUcF1dZEOKgeDGzFYIPyNZGy5UrAo4+i2/FaYmt2XGIscfChuJN8psbar+FWyaFi7A+GqPcyTgEHteHzOZcJN4Rx1sQjHWogpXVryJwJChlAukJnEsWShsqKBKBNwjl90z8Kt63RhEuZGNOKoHKcqQ9AaQieFwcJZIZc6+FPkEFc0TcTw1knSAfiNOzMQJYbsW3Q29F+G7hEUVJIjabT0VgnG/JED3EhfCm1o4IVJDH1QqsScWRlBq2WLghaBoOnOG4CAT7xdo7DnMtzGXcEYswRVwqrojs4JqFsqaLg3ZEYC7f4K8I9KRD1tiUq2csLsOYre7kJRaa59VojEZH8DS+eRYqzEVgow5//ZF1/HMzsBbPdsdh8byFlyjgb77ZbPltNt/C8X2d/QZdFso9XovNb7CQmIrVN/PaYLp5mGavCHPE2xaydM7C1bfV8jW8krwXnBLPirMs7wEETOBskqsZUbnaKpbfHl45cWxkPx5jvlcfb4wfFsRhnKNIQrBze9EciaNZpf8VKEt/uHDe+M9U/PYgAJpjPA/7mMzmv+N5fQUPL9bh2vW+wvojsn+JsRN+SpQo8R/hDzEy4DB4IrfCAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACTklEQVR4Xu2VS8hNURTHl1Dk/U4RmXlE8hiZGpKilGRiYmBGhImJAcWISCRKXhl5pCinTJQiSkoUBoRQSokB/19rr+/ss+85n0e+Mvj+9bv3nHX2Pnft9bpmgxp4jRdDS2OhEaXhX2m4OCoeiotiYvNxn8aJ1aWx1ObinpdPE0MKOy8bm91vE4/N1+4Sz8Qa8/2I/QvFAzEs2Vo1W5wubNPFS/FWXDB//kJ8FIvTmsnmDsTeOaISh82deSXeiEfiSVrTKjw+Zd1O/MjgxcuyNUvEF7Ez3Y8Wl8TcvhVmI5OtMxWzxC2x3dqdqNJ3lxaJz2J3uh9jXhdEBBGxO2JGuu8RETgmNopV9ndOUB93xVnz3C8Ql80jgq5aPxFAa8UZc2f6c4JTbRAHxDzrLVSevRfLxXHzQ4WO2C+K8baYn667nHiaoHO2iq9ir9WVj3BqvXkR7smekYrONCBCRMGE2pxoE+soUFJAKtqEUzvMo4A4KA4SeVr4EMap4mZaEPpdJ1aI7+KDNTsgF2mJYsQh2vWemGA+S26wiB/8Zu5dQO+H7bwYlTa/FivZlBQtCVyXIjrXrC5GfhgHKquL9QQfzG/ynbPJvJe5nmR+gpgRB9mUFOlgAEUb5oo0RDHGrKmsdmJf+m6IQtoirphHIITtXGabYn6qT1ZPzFxEIY8a4sBEhvQwQ2KYNUQd5BMRKvPFOLdfPBcnxTvrnZihKMayfRGpIa3MkBgLf6yZYp1Yas3WzEVkrpfGJP7ecZDD3Def0gMinMtT2aaI7qD+L/0EgQ93vj9UT4QAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAYAAACL6W/rAAACL0lEQVR4Xu2Wz0sVURTHj2iQpBQFShq4KwrSfgiuahVhi2gjCNqivyGIfixEBBfRLgIlV7YJLNqUu8AngdgqCAU3LgxRKNoEtRCsvt937n1z33kz783jjRkyH/jAe+eeOzPn/poRycnJ+RccgydsMCXsd8TEmmGXiWXFOTgDn8f4MMgr0gf/wC34xfgZno9SK7gPd+FH0Yu/hztwKkzKkOPwFhyFq07+HoIDQV6Ra6KFxckHPRqlVsDCbJ8nsDVM2iNmnYlM2gCYh8M2GAMLo/tBzcJGzP8mOA0PmXgcjRTG/cn9SA47QzpE938SNQuzcK3yomnwhZ0R3WO3pfIwsTwVXbIb8BJ8Kbqff8PHov3vwU3R/bsETxV7llNXYRzFZRusAovahm9ED6FFuA7PhkkGzsJF+BMuiBZH5kSLY+yBiw262DPRlRSSujAeEizqtW2ogzZYEJ2RajCPhV0OYv4gehTETorObEG0T0jqwvzohBeulxbRgWmksHDPZlKYX/t3bUMC/aI3fSHlN+XN/pvC2uEH0QvfNG1J+Af5Bk+7WBZLsdHCuGpKcOP/kOTCGGNb2M6Tk4Nx3f1vgndczpSLJcFD6he8GsTGRftOSPSq6YVf4SfY7WKEJ+db+Eqigvm6GBP98inBU+y76IVvhA2OHrgC1ySaHXLBxd6JjiqP51pfHn6pejkj4cB5CzExzjBn2satJTjaV0Q/r/xLMy0cXY48H67TtOXk5BxA/gKdSp2UV9Y/ewAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAA70lEQVR4Xu2Uvw4BQRCHV5CQSEQpJJ5BRCQaDaWGwrN4Aq1OoiBaap1CtF5AdBQKPdH48/tl7y5rcqqzJ5L7ki+3OzPFZHZvlYqI+EwcFmED5kUuNHbwBM/wCXsw9lZhmTKsG3uu77BrxKySgWtHrl2u8AGbRswaHPkQjmDCiF+UPpa2EbMKG5HnzymwkYqIS1rwCAcyERQ2xCnMYVLkJDOlaw8yEYQS3Dvfn5CFK7iRibDg2MdwoXQzpAYLXkUI9JVuIu3s+adMYNWrsAwfJV4u6RbmjDo/vnIx3cdKNkCXMOVV+tOBNziViYiIv+YFCXYtCipoPcMAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACkElEQVR4Xu2VTchNURSGl1CE/OYnJEKJSEpRJkLJT2JAKAMDBjL4FGFsJJJIxIAyISM/GUi3FKKIEokBiTAQRSjxPt/a65599z3XBGXwvfXc2muffc7aa797XbMe/XsNEb3LYKF+ZeBvqa84Jh6Ic2JY63RTg8XKMthLDBdjxMhiLhe7Y55nWVNqh3gkRond4plYZZ4cYs1McV/0SbGm7om74pR4IbZZezkXiufiuvgo3onlViUzwjyB02k8STTEEfNkXoo34qF4nJ5papx5tiF2+VNszWKzxRMxJ40ni9fih1icYsx9FrvSeKA4L6alMeqfYm1HsUh8E/OyGEk0zF+EtqTYKzExxZknFjufJT6JPWk8yNwXVASxkRvmm24T5WRnIbLl5QeyGEcz39wziDOnpDy3OcUw221x1vydM8QFqzZyyWoq0EkLxFMxoZzItNE8gWvmHw+tF+/FXHEiPRc6ajVmzMVVWmO+8KsY3Trd1FixwdwLh8WA1unuCqw1N+Feq24FR1F7DJ3EQna50+qvIcK8d8yTIflOYj3voQpounmCrOEKH0zxWpFEadZSGDA3a504ljAjCXFdaQVDzX11NR7EbNzxXFw1PtCVxhh3mbWWf4X5M7A0i4fwymWrzMiHSaBhlVlP8kNZabE8nPfyL+Yvjzv/No3xQWh1igEJlYpjCDOyWRphw6ok9vFDiQ6JKSmIwhOYNIx10fwmRMXCE528QxWiiYXYJJvleOgh0cy6xYIP4rh5+W+J/eb9IsSZ3jTfCWaie34X2629vYcZy8QQR0OnpYdgzjP55Hjz1r3J6kuLeOlUsU4ssfbrGeI6XimDSSRMgvwH8X/1u170R+IIOyUY4ijiqHv0/+gXq0F8JekkOLQAAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACB0lEQVR4Xu2UPUgcURSFT1BB0WD8IUEQIulCgiKChXUsIwELIQSbQLA3GNTaNpWiiCAKghis/EFQcCFNQDBEEBtTJEUsBAshFhYm5/Dec3buzK6L64LFHvh2Z+68mTlz730XKKv0ekQqbNCo2gbuSlVkmvwgK6Qxfvla9aTPBq3e24BRG3lgg9QwOSRPyCg5Jm/gzEm6p518J5U+lqo2smCDXkpxD8mQuvglNMMZCPc+g1s3CWfmNzkhB+TIr0mVHM8jaeIV+UOuyAXSTXSRv+STP9f1L+T59QqgxsdyluIp2SEfkTSRrddIN9FBzsmYP38I1xfKiNRJvpJWf56QMjBD3sG95DYm1GzfyBJc7V+SVUTr1pEnA1I/WYQzc1sT0ltySrrJLNxHBU3hhmbcJS/8cTEmlIEBuCYcR7QrVIqcZZCUIjVMUDEmrGRqBC4Lkj5UBpV5beHPCj4m235B0F2aUFlCM8qQtuseaYCbJVtapAdewrkLnGXFlkmtFmapUBNq1A1EzagXy0AG0b1z+tH8bjEMwu1lHTchORkLNRHKEJpRz/uF+L0T/j8mNdIQWUMyA5Im5ge4sau5kkvKQq+J6YOVGZVHMyQMs5jUB/8MGbjFYRra68L2T2hGm0FJpdHk1QwJY6Ek0nbctEEvZVIGf5J95M9mUVJJ00qZLWU3zJCy7o/+Az85ZjgwXBvPAAAAAElFTkSuQmCC>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAWCAYAAAB3/EQhAAACwUlEQVR4Xu2WS8hNURTHlzwi5Jm8SsTAhCQUCkURBh5RZEqZSZKJiZGiJFEKyQyJgQiDj4mBkaIkg0+JEFJIyuP/a+99zzr7vnC/+xk4//p1z1573XP2WnvvtbdZpUqV/lcNFFPFMjEp6/MaLGaJpWJA1tdM+E3OjdLw3NCH2ibOiNMZ571T0hPxUrwRP8VWqw9unXgtXoj34pmFZLXTCNEjrloYAIN6JL45n77WbLFZ7LMQD0HThpLmicWuzfN3scnZ0EMxMz6TGHw+iIU1j8ZKwTOIxEcLyey2WMV8b33egdLAgOekL+KHWBnb6SV+2WyMtncWMt1MvJdZ/xdqGTwzeEycEoOc/bOV/zQstvfWPEIfNnznO3uuToIfKka79gQL9SmJfgLkt5FaBo9IQL6/mfU8qJHuGe2y8OJeMaXcVVIKfq04KY5b2Fo+iFzjxWMrVhu15YH4ZGHLrBETLdQf6hTjPWyhIHu1DT4XieAPF63+ZV43LfgdsvrkeRH8LXFQTBNbxFtxwTtlIjHMMkH1irNilIWaQ2GGu9GXb5+IvqujLemPgmdwT+NvK1HkblgY0N+IFcXKmp53ZMKnx4p6lGoUNWlBtKG0Bfc7G/rt4AnkjriXd2RKCerknJ4hXllRUJupWfD5luwoeJY3Z/AlK2ZzkdXvZfpuiyOxTZFcIsbWPMpiSe6xcCJ4Majn1mZQ1k/BH7AQPFUdERT7zC8t+vDBNxWrMeKKhdthI/kzfoizp2XPTbGVuh48lxkccqiuBIdSEWzEZSuOSSozNmY1aZWFASeRRP7DJamd2Nv3xbjY5pc29hXRxkTstPDdo9GWNCfad1hRvOeKazz4mcm5bsX5mTLYCI6uJC4+X8U5ZyNxuy0khqst1+J2N7y0Lfx3UmI9zGi6k3gbKyD3zelXbRDbxXJrfimpVKlSpa7oF4JSyRY49Rj/AAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACVUlEQVR4Xu2VS6iNURiGX7lEyDWXUmImIikmBgYM5BIpCmNzKUIpyUgouZQYIBNSBkgZ2DFRiiiZUEgMzMSEXN7nfGvtf5219z4dcjI5bz179621/vW/a61vfb80rKHXZDOybqw0tm74Vxptzpln5pqZ2r+7rUlmY9kwQp2ux5tpVVspntlh1lbte8wLM9PsN6/MJoU5xHOLzVMzKrX1aYL5Ym6a8+ai+abKaaUV5qvZV7RNVxi4lOL5pmVOK8y8Mx/Nc/MyjWkLE78q1itc99IDxbjSxDL1N8a8182C9ghpXGrrWCCDmWCwWm6OqdPEEvPZHEjxREVesCNoqXlo5qS4n/7EBAnFsfHy2gR9j8xVxS4uMjcU86Nb6rIDWQxidevMWXNKnYmKmHivOazuJtB280kxH/m1s+g7oyoZS2HijTlk5pqt5orihpRiO++bGeptAqPbFEl4UM2t4NmuxzCQSLD3Zl6KuXon1CRrLxO18u6xC2ihwuAWxRVmzp7iKv00q1N8T7EDWYM1wbHkZMQQ1/WxmaKoJXcZRMdusyueaeut4iUbUkwdYQUZYvpze7cVkai31SQjL8ZAS02yXuCHgEYyfkzqQBzHd7MyxbMrjihM8E/Mt6JWPoacjIxjcS01Jo6mf60xs3KgKCg/NMB1sk4qTBxXk3yl2AXmLcUHi53heKghuZj1iSMhCSm3lGxKbK+KmXeurK6QSzXKydjteRb2QVFDSM7LZScfq82Kj9KqsuMvxHW8UzcmUX8w+No8UZSEIRHHU9eYWuxot2Mc1v/Vb9iceMynD8oAAAAAAElFTkSuQmCC>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHYAAAAZCAYAAADkBdqeAAAD+0lEQVR4Xu2YS6hNURjHP3lE5C0U7i1SkiiPAaWbGCiUV1eZKAMGRhRRxMDAwMRIIhlJFAZKMrhREgOPMhEDYkISRVIe3691vnvWWXev/Thnn6LWr/6Ds/Y+a+/fWmuvtfYWSSQSiUQi0W2GaaZoVmp6gmN1M1IzRzMxPJDDanH3mMd4zdiwUJmmGRMW1oB50GZlXfDYKe27VPZ4qPmgeaf5pTkj2RV3AjL9mk+aAc1LzT1Nb/OUKEc0PzVvM/Jcs0hzSPNH80pzSXNF817cdeZKveBiHhfEXaPXOx4DD+4x5oIHmAse56TpUsmDTtwsraPos7iKd3tlnTBB3OB5rJnkla/V/NYc98pCxmnuaLY10qeZqdmkeSrNBqUxqB8fGmO+FD8Z7WAuvgcUeQAex6TpgofvYpgLHiekDReeyruaN+IuYNwX17HXNCO88naxDgzrWyBu5CMRg/u6FRYqTzRbvd80BiO825hL2C7mEXa4Dx5Tg7JZ0gUXRsFpcSOJJ8MYENexdHodU7I/tfjQaQyqr0G5T69mX1DG+nZQWkdxx41REnMJMY/F4QEPPEZ7v/E4K11yocLhQdkLcTfPtJbHMnFrGtNTHtxkXsfyBFRhrwzdSFhjUOfRRma3nBGH+2etXhIeyMBcQsyDJ7oseNyUuAsOTMdVXKKwO2YD5U8NMWgIpp9OOzarobJg+juvuR0eULaIm2HsXngarotzYQ3Lg//g0WnHUr4xPBABFzzCTgVzMcylyCMKFTBCtkvFxbqAujp2qeabuN1lGWzazBoI7VJXx+JS1gNwiQ2EXJiOD4t77ambujr2pFRrPEY+5/MaVxd1dSwuZc8FXPBgs1Uank4W8GeaeY2yyZpVMnT31w5FmyeewiLYbTJdftcsD44B+wKmL5YSg4bjumXqL0ve5onr8CQWYS5ZHrzLmosPLmXrH2SXuJ3xDK+MisKOaJf14hqD7b6/K2QHyU4SkSLs3Jgc9bOe9nll+xvlr72yTjEX3wPMI3ydycJcsjxs4ODigwse04PyKDZdZaVoqmAjw3l9QXkWB8TdbH/jN+v5Rc1HzcJGmQlT56hGmWGdFOtYBg11295ghbgPLXwV6rGTIlhn8epXBlzMA3DxPcA8bkjcJcuDjZy5GOZS5DEI764DMrRD8xrQZ53mi7R+3IiB/ClxUynrC9t81vM13jncz2XND6/M2CPuvpjysq7H2vNI3McVNoB8tnsg5T71UR8e+JQBF/PYIc7F9wDz4L5DzCXLA8wFj6vSdPmn4X2Mz2l8EKeBysJucIO4wWZPZQj18W7Nh3a+aoXv53ViHlwLlyqYS8wDcKFuBk63XRKJRCKRSCQSiUTif+Avr7kKXJF1XSsAAAAASUVORK5CYII=>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAACMklEQVR4Xu2WsUscQRTGn2ggoiEBEdQoJGBIE6MgaCOpRLDQRiUhjYWQKhaaQgL5D9IEwSLRECysDCEiqRQ8tBGtrLQwRUIsFCQEtIiB6Pf5dm5n363nctyhxX7w427fzL6db3bezIqkSpXqIpXHXDeAMhOn7oAH4IZtKLI6wUfwIYbXXr9zVYMTsC5hpyPwCdz0+tWBL2AfLIBD8FJyJ6BYugsGwSg4BpvgWRCjwYho4tTwFlR6fW6DZdFEtUFsAPwDr1ynEqke/ACztsEXTfTZoNE30QF3mfikqOlSypmYsA2+kphgEr7SdhNn4iQmuCxdffE/B+aLbTXBr1ViE/2i64wzy5qoivRQA/lM+LXjxLwZCZdoC1gCP8EBmAG3wFOwI1qHf0CvRJXYxC/wHjwCraIPavP6XGaCOazc7A6Bv2AFNHttvO8rmBKtv3vgu+hY7gf9qEQm4pQRfQh3H6oQE05uEI0mzvv8Yq0An4O4v7wLNjEnmoy/nLVimLB1YE1QvC7IxAvwRqJF5ZJlRAfIJPlM5FPJTbji2xJdv048E5iMxeeu/4PubA8V26/cBNUhYcFRfCNMxF3KfVpwPW+DVdGDj+JuxrfzLri+SI9Fd6OHXoynPJ8xL+HOxh1xMYjzZHbifXtgWsK+/B0R3c2y4qcEE3Lga5J7YlPcrXbBBhgHv0U/Tex27GS3WLc8n5sYccvSZywmFkdWnN0eMCz5Dz6+mSei3y9Npi1VqlTXQGe+7qPBKKMMJQAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAACJUlEQVR4Xu2WSytFURiGP6EIESlCKDIiMlDISMnAxCUyUqYMUORHKCkTl2RMIpmgiIkYGYgBA2JASYqB5PK+1l72Oss+Nx06g/3U0znrstdZ37p8+4j4+PgEIwHmwHpYbLXZZMFymGw3xJg6OA9nPBw3+n1zAO/gNXyDUzAtoIdIHlyBt3AN3sMBmGh2iiEFsBMOwmd4BHucOgYYAFe+RdRukEL4AbdhplPHT5Y5UK5T1wFf4YhT/ivy4SVctBs0XG1Ojp3YWbMvKpBlmAQ3RE240ehDuGPs95foIMbsBg1XfwJuwnSjflfc3WCgHIRbWmv0IRw4kiBSxN1pfjcXjOg7qfuYhA2C8EH7XJ+ImhxXmjCAUEFwYjZclF1R7bQSbsErUfdvDmbAbngGn+AjbJVAIgrCi3f4AGuccrggzF3U6NXtgi9wB5YZbXxuFU7DVFgCL0Qll1KnH4k6CKZNpjD+sLm1vwlCoyfBhGHC5xaNMu8e7yDr24z6qILgkWL+5VbbxCII+x7YQRCWfx0EV30UHou75dmwQdQKcZBQQYTi34LoE5Wh+ELTcCD9I8xSvCfNbvMXvJxxEUS7uBnEVg/G83wK98R9AdaJ2p1JpxyMKlFHtMKo49Hl+EviZjam8nWnnm9mDZ+7gbPi9uVnv6hs9iMNmtrHpxqew0M4LCp7LcjPvycar7FZ7rXqqD6WpkMedV5GDbNXk6j/L0VWm4+PTxzwCRpuqexBoUypAAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACdUlEQVR4Xu2VS6iNURiGX7lEyLUQJWIgIikTigEjl1yKwpixFKHORKYGcikxQCZuKdcy2WWiFFEyoQ6JJCkxIZf3Od9a+1/739s+klMG563nnNa3/rXWt77L2tKgBl7jzdC6saaRdcO/0nBz0jw2F83E1ummxpn1pWGI2r0ebSbVbIhD5irmWFfXHvPUTDH7zXOzQbEOsWaheWSGJVufxpjP5po5Zc6Yr2r1lMVrzTvz2vxUHLCi+GaywoGzaTzbNMwxxbevzFvzxDxL3zSFE2xawoHlTXGIEM9J463mu/lolibbEvPF7Etj9r1k5qUxGpVsLalAfMwG3fRS4Vy+JdqUbB8UBy0yn8yBND9WURdEBC0298yMNG7RnzhxXXEgOc9al2zcnvUU231zQRHFBeaKYn90Qx0ikMVHhHSNOWGOqr1QGXOzUrsUTvSa6cm2zbxX7Ed97Uh2dFy1YiyFE72mx8w0W8x5RYf8TuT2jsKJQ6rqh//UC0V4UFVXkIqOaegmQkwXzKpPJFGQtxUp6Cac2quIApqvcHCzooWPJHtH0Uo/zKr6hCJa/UUqi7TkYsQh2vWBmaB4S4hm38RuszPWNJW7geIrxc3vqgozOV6mzi8j395UVYwcjAMNVcV6mj8MMPJQjUgTiHR8M8sLG3VAsRHGLDa+qs75zmnIxThNcbmGKicOp/9ababmgeIwHqKyndiw/qBlLqu96okC+5biB4vIkB46LT9mfSIlFCEPEU82T2z9xczp6QQtXSoXY7k+i4u9UbwhFOe5cpIfpI1mu1lZTvyFaMdbdWMS7w0OvjAPFUU+IKJo++scUpGLe1D/j34BbGd8YqwDrZAAAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACfElEQVR4Xu2VS6jNURSHlzwi5JlHlEcmIo+EiYGEiUskFMbmUnQpM5kZyKM80iUpjzJAhv9SUoqIDFCXRJGJMCCP33fWXufss8+5tzNwy+D+6junvfZr7bXX2n+zQQ28xouhpbHQyNLwrzRcnBZPxFUxsbm7rnFiU24YYq1ejxaTChti7BQx3VrnoH3iuZgqusUrsdncOcT8ReKxGJZsNY0RX8VNcUacFz+s8FSaLe6LZ+KeeCmWZP2TzR3oSe25ohInzJ15Kz6Ip+JFGlMXTvwp6DL3OsTp2fy6GGUehaPitblzaJn4Jg6kNuteE/NTGzEXW3nA2mAW6E+V+GzNC3Ilb8xPTxQWiy/iYOofa54XRAQtNY/gzNRuUidOEEY2ZOMQ8yrz0zOfZHsgLptHcaG4kcahW9YmAiEGrRAbxClx3FqTjo36coLr25hsO8Un8/XIr93Jjk5akYy5WKxXHBazxHZxybxCQr+tMyeIwA7zJDxkjargKtpeQ3/i5O/EnNRmo06cKIVT+82jgBaYO7jVvISPJXtbkQOcfm1qd3odpbiWSEYcolwfignmb8ldBtGxV+zxOXWxYb54u8Qk+9ngu1ie2UMk6m1rJCMb40BljWQ9x0+chodqROpAnPynWJXaTKb8KMNQlGivmJHZQ3ENkYwxvrKGE0fSv60T06Jh/qD8suZymifeiwvmyUYEuVOcXZmNCxEF1s3FB4vIED2iGI9ZTSxIEvaYP9k8sV3JnmuN+CiuiLPm17DNWsdFMpZ2xME4DG8IyXkx7+RjtUXsEqvzjkKU7fpEXsK5KMc7pTGJ9wcHee4fmT8JAyKuqy8HQ1xFvCGD+n/0Fwf/f+NnMp/BAAAAAElFTkSuQmCC>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAADQUlEQVR4Xu2W2auNURjGH0mReSbqlCJTFEUpdRLFhRsuKH8Al1LIpaRcIkUKuZLhglwYknYUokwZSlyQoUiiKDK9v+/93vba3/72bp9z9rmg/dTT3t+a3rWed1hL6qCDDjpojFHGyTl7gwnG68ZXxopxWE1v37DJ+Nr4y7i60Nc2VIxPjEfkBzlhHJMOaAFDjKuMR9V+EWYZ3xr/qJ9EwIObjQPz7wFyY5fVu4MsVPtFAMfVjyJ0yxdfn7Tx/du4PGlrFf+kCHh+fv4bwNhT48SkrRkYF4duJEIrNWewcbqxyzhCtWOLImCTNRsh7DFuUKEPkGJTi40B0oMCtLbYUYJJxlPGR8a7xnvGHaoX4aHxhvGw/DA3jTOSfrBfPn+ncZvxu3F70h8irDNuVbVQsm7xMKz9Ul7j2NtnVZ3Mns/IbezO2zJEUaORyctUGxllwFvPcgYoppdULwKbv2Icmn+/kEdauvli5CFumQgcHiHASnnaUsgDRPUH48j8myg4ZlwhP9MB48W8rykwdkf1Cgcw9MX4zjit0NcoHVLskttID8n3e+M+uUOKCBHWJG2EO06DIPb1Me8LLpCfZ7xcMNbB4d3ZrAZAbQbuVXlEkJf0Y7yY42UijJWH33PjN+N91YtwIW8LEgnpNV2sCaAoQuyLVCL1Uu6R14kueYqEnQxlxaoiH/DYOK62K0NPRfghf0QRklzFHL4oAu3MxUPUkBAiilorIhBBsa9mYE0iDqdkeXPL+EDurQAPpmYisNmvai0d5sjH0h5IRZhiXGxcmvSDa/KwpoqDVkRgLHOwVwZq0kEVijKhTn6SMykwxgFjA2VYZPxkvJq0UUPYPIVvrnz9EIGDBuL1h9fJcW4G1lqSjDlkPC8v2oD/zNmg6sNunryOvMm/QYR7uhaH57bDMRXVFvMMGCFPzxq3GE8bb6v+CivDbPlYvHROfvVtVDXfaAdRC07K7cxUtQawYTbOIYk8ROVqq6hamCNygoiK99M2xkf08cb4KReHdlIRh9DP7UVxZB+xvwykAmGGyrwcmdATEJbxcCHfeGuEtwDrYSMdR//ovC++03F9BQ8v1uHajbrC+sPzX/bYDjsddNDBf4S/Djzbt8p0gusAAAAASUVORK5CYII=>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACfElEQVR4Xu2VS6iNURTHl1CEvG4eIRIDkUtCBibCjJSkpEwNjCjC+GYgMiB5JUrKY4YMv1IoRUTKozCgSEoRE/x/1l7n22ef79QZXGVw//W7nW/t19prrb2u2ZD+vSaI4aWx0KjSMFgaKU6Kx+KKmNQ+3NJ4sbE0DhOTxXQxpRjLxTzGmdd00z3imZgq9otXYpO5c4j1i8UjMSLZWnooHohz4q3YZZ2HzBF3xVNxR7wUS7LxPnMHLqTvuaISx82deSc+iCfieZrT0kxzb0NE5LfYmdm4PYdfE6PNHTwkXps7h5aJb2Jf+h4rrooF6RuxFltHKtaKn2JVZsOJynwjxO/P1r4hKSFq3J4o9Iuv4kAaH2deF0QELTWPIJfuEHmal33jLU4cyWyEkQM5OISDlfntiQLFdl9cMt9zkbie5qEb1hCBblotXojZmY2DujmBwxuSbZv4JFaI02J7sqMT1lCMuXhKm80X/hDT2oftl/XmBBHYal6EB61+FaSiMQ3dxEI23mu+KeK7FydKsZ59iAJaaO4gF+YJH032RrFxXqy9pqMUaYlixCGeK61gonkvuR0T2ZjqzsWhbL47fTcVJtXPAd/F8sweolBvWl2MHIwDldXFepY/9ARaLJPzXs7GOBFvnsU8P55hKJ7oGzEjs4ciDVGMMb+y2okB/hCiY2J+MqKoCYo0Cosn/F6cTzbWkVMitjLNyUUU1hU2LslliR5RjGb2Vyz4Ik6Zh/+eOGzeL3KtER/FZXHGPFpbrC7eUBRjaUekhsvQQyjOi/ngLPPWvcO6FxkaI9Yn+N0knuOt0phEu8dB2j3/r/JeNKgiXd0cDJGKSPWQ/h/9AVb7gLknTnlBAAAAAElFTkSuQmCC>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAClklEQVR4Xu2VS6iOURSGX7lE7pdcSrlMJCKJgSiJkUukKIxliiKUiQykKLmUKJdMyGWADKQTBkoRJRMKiSSJMCCX9/nX/s63//3/nQycTM5bzzlnr72/vddea+11pB51v4aZ3qWxUP/S8K/U1xwzj8x5M6J5ulNDzYrc0EutXg80IwsbYu1oM16t36Ct5okZY3aYZ2alwjnE9zPMQ9Mn2RoaZL6YK+a4OWm+q/DUmmjuKjaA12ZRNj9K4cDpNJ5sOsxhhTOvzFvz2DxNazqFE78Llim8rkRUbpu1yQ78/dEsSGtmm69mexqz7wUzNY3RgGQrL9hYzAZdiY3xnjDn4tbVzWeaz2ZnGg9W1AURQbPMHUUqW/Q3TmxRROim6k1wiPBvSmOK7Z45p4jUdHNRsT+6qjYRqMSiuWapOWoOqbXoppn3CkeoF6r+rOKm1SFoXVrHftTXhmzuiIpizMUmL8xuM8GsURzAC8mFk+QcR36Zg4oc56pqhSLcpfpVkIq2aehKHEb1T0pjbn5L4dwQ80l1EW9TcxHnws48UUBEFAdXK57wgWRvK54St12cxjQgXgd5R2PNJYUT78yUZC9FWqpixCGe630zXFFTN1jExGazMb7p1EvFAcvT+INZX083RKjJe74uFw5fU12MHIwDHarr6AQ/GGCkUfVLE4h0/DDzs3G7g+aYb2o/V6WhKsZxist1qHZib/qtJYrwVqLYfqr5Oe1RNKZ5ma2qE+bKmiAK7JuLf1hEhvTQQ6pm1hAbUIQ0HVo2LbbsmDi2X+HcZXNK0Zj2qX4BlapiLB1DXOyNoodQnGfySdryKkXeF+YThSgmQg9l96zEc7xeGpPoPzj43DxQtIRuEZEpe0wpUlFGsEf/X38Aug1+M1PaSvUAAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAZCAYAAAB9/QMrAAAC3UlEQVR4Xu2XS6hOURTHl7xD5KpLiMTASHLdCYqSlAyEKDKhGMhAccvgdksGuhmYUB5FBhQDRvIYiAkGGHgUGTBQBpJCIY//v7W3s87yncf3kNz2v35931nrPPb5773X3kckKSlpCGikDww1zfQBaASYAoa5OM2YZo6ngovgPDgFJpuc10rw2nEZnDBsB13xgppiGxeA4T7RCXWDQfDVJ0SNeAU+gpuiL3AXfAH94Zyx4CiYF475e0jU4EaaDjaAXeAnuBKOI7yWbSF7wjV1tBx8FzW4Y6Ljk8B4cEu0wV406alkPbwRjMudITIf7HWxA2COi3nxuXxmn09Ivk0T86lC/dWRVGXSI7DIJ4w49Q6D2eGYI4nHVfWpzCSOwkuieY70f652TaJYky6I1qQz4bhKZSaxPr4Qzft6yBrJ0cJO4H8v3rfjqmNSL1gDjoG1UjxKxvhAiYpM4nQ+F3LXTPxsiLFG7gDPwQfQI9om5uz9FoJnki0OT0Sn4xsTI7VUZtIEcAOsN7EV4Bu4bmKtKJp0ULQzIsvAffAZ7Pt9tipeszMcL5H8qKVB3nR28HtRU2eBe6LXNaUykxoprng/fKJJFY0kisWaqynzdvrwP81bbGJWjUyi2Mlc+W6D/fLnFK5UsyZxdN2R+ucXqcwkarVoR2w2MV7zSYprZJFJXAiOiz5vtMvVUplJnArvwBYTKzu/GVWZRCNoCDenUa2aRG0SNd2Wjtoqe2lOK8a5Ix4VYt3gZYi3oyqTlorWPm4uo1o1iXWJ+71tooV7bj5dLRazh6IN9qsWXb8q2WcG89xU8lzO7XbEnTfvw9Fq6w73WfEZ/iuAHcSaxMXD1xW27QgYkGxDyfvy3R5I9pnDzyfe+7SJFSr2ZCO4pFJsyG7wVnQJfizZ50KrO1u7XBfBz6CTYEa4hopbAEscNf6eHG1bw68/19/DdlBbYg+uA6uk/mdCUlJSUlJSUtL/pl8h2sCsnCifGgAAAABJRU5ErkJggg==>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAZCAYAAACo79dmAAACrElEQVR4Xu2WS6hOURTHl1CEvOqKJAmlRBIiyUBiQHkUhYmJiUwUZaA7MdVFJJGQQmKAMhBfTEgZeYXyiGQgUSQS/197784+6zvn3i+K0vnXr++ctff5ztrrsfcxa/R/aFCkN/X3hn+h1eK1uCfmuLGkfmKHGOAHqjRCLBAT/EAH4tkpYqAfkGaJd2KZmCfeit1idDaH60PiQWar1TnxQhwTl8Xy0mi9Rll49oloiU9ik4UoJe0XL8VYC1E7FW13xCvxRjwUH8XK+EytWPEWZ2OFV8VgZ88138I8nMi1R1wTQ8RQC4sArtHOSBKRvyXGZ7ZKEYHjYomzt8R7Mc3Zc60QH8R0Z8eRlgXncBjHcWZYHN8lNsRr5pDJPiOKRoq7YraznxA/LThUJ0qFOY/EjGgjE2Skx4pS6LbQXESO8bNWvG+7OGgdNhUppJ7qnM3T5dUl7luYB9Rvt7ht5dKYZKEf6PR14qQVjdhR+pNw8nP8zdWJs4h9cbP4YoXTRIr09ya/TbHQ0xbKqrb0Zlro4N9xlpQeFTfFOPHMCoePWPU2ljTXQlQR/3PJimduWMham/6kDKi3p2JivCeabEk890Msjnav4eKKFU3FbkR2F8b7A2J9vC6prsFICS/l5KkT2xbbVK6U3rqFpvG8qfiPvBRpahbdJh44b+2HQMuqazkXGalyiIah+6vGUvrzpiKL+buI8OFiuCyOOuqO9CR9s9C5uVI9pu1so/huYV7aplIdc6r5mmXO3vibiwOJBk3fDCzSH1IlsVdet7BZkxZS5b+A2KYei6nxnvFt4quFaO2z8A1wxsoLTyKqVY1DlHn/1njPITK5GG4XUVhkwdlVbqwv4dhSsdZCs/nIIU6qi96YiaP7ubgg1rixvy4WkI7bOhGwMd7YqFGjRmX9Apd5isqqOVo5AAAAAElFTkSuQmCC>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACa0lEQVR4Xu2Vy6tPURTHl1CEPBLJLZKJyCOhTJS4syslKfkvFF3GMpMBKVd0b0l5zJCBwYmSukVE5FEYUGRyi5nH93PX2r+zz/6dX/0GVxncb306Z6/9OGuvtfY+ZtP691okZpbGQnNKw1RptrggnonrYkmzu6OFYl9pxOsBsUusKPpyzRDLzMe07fSoeCmWi2HxTuw3dw4xf6N4KmaFraPX4rP4Kv6IQ+YTcq0Wj8QL8VC8FZuz/qXmDoxGe42oxDlzZz6JL+K5eBVjOtoidmZt3n+JA5mN3fPxm2KueRROi/fmzqGt4oc4Hu354oZYF23EXGyNVDCwCnhP+il+iz3RrsR3ay5ISj6a754obBIT4kT0LzCvCyKC2CwRJO0NEfKz5sWU54gdkZahaBNGPpjXS9oAY4kCxfZYXDVfd4O4FePQbWspxiQmlPknCmlxxHsvJ3JnD4tvYru4KI6EHZ23lmLsJRxiYUKZqhqn+nGCuRQ1RXjS6vmkoisNvbRKvIlnLj7UjxOlcOqYeRTQenMHKXqO8Jmwd0RO74sHZYf1n45SpCUVIw5xXMfFYvO75F491MNGDjk+OIN2iJXx3laYVD8f4CRty+xJrHPH6mLkwzhQWV2sl+I5KUKDE5xjRAFdtnpxJnP8OIZJ6Yh+sNrZXCkNqRjT+MpqJ07FczI/hLQkhQ2tNb9Rr5hHjdDiOGkiYqWIwt7Cxg+LyBA9opgus0ZeS5iQ/+l2m1/r18SIeRoOWvfxTsVY2hGpYTPcIWx+rNndn+aJwYD3NnEc75bGENc9DnLdP7HuUzhlIl29HEwiA+kOmdb/o7+fkYYY5c4WAAAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAZCAYAAACYY8ZHAAAB3ElEQVR4Xu2WzysFURiGP2EhhBQpSigpZYUs7FgpKT/LPyCRUER2spWykY3sFGWnyGLKgmz8ASxkYWFBFjYWeN/OnHvP/e40zHVncWueerpnvnNO93xzfo1IQkLBUq4DIRTBBlitYpX+b6yUwkUV459Ow314CYf8WBDt8AB+wlffBzgBR+E5rEi1jolJ+KVig3DFLxfDJdiXrk6xAb/FDHrEiTfCU/gGPYkxiTJ4DD/EDMRlHbY4zx1iEnGZgc+wTcVdWO9JjEkswz14JNlJ9MMFv2xngjFLE7yHW04sCC4zT2JM4krMtB9KdhJ6T4z7MQvr2GfAiQXBdp7ElEQVHPbLQUlYaiR7Q/OZb5h9uMzCYP0sLNEV/6UXXjjPYUkEwbfqienDIzVn7Jn8V+10cgbOJHN9R02Cb/VETB8ux5zhoJ4iOC8m8U245pctUZMgq2L6dOsKRZeYEzDKpRkKZ+QRvkhmgrykOCCWt23jX+gUcwfM6QoFNz73j95XOcOjsk4ylxnP+GtJr2/3kyEMDmoH3sJaVeeyC6d0MN/USzoJfn5Ehccv+3JJ6mS41HpULO/Ym9qVg4kCb33ut3cx/Xmv0Dt447QrCLhUW+GYmG+oZsnjPkhISEhI+DM/lFhjNe+dMJEAAAAASUVORK5CYII=>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAZCAYAAACYY8ZHAAACI0lEQVR4Xu2WzytmURjHH2HhV0ZWU35Tkx81q1GUjbBhIb+a8g9IpEzNNNMsZmNhp6yIZE3JUklXNmJhqbAhsdAQSwsz32/PvZz38Xq9l2uh7qc+ve95zr3nnufc8+OKxMS8W/JsIAUZ8CP8YGIF/u+bUAabYbE8fgjLg3AWrsNOP5aMT3AB3sJL3yM4AHvhGsy/vzoi2JkuuArnRR+4n3CFSDv87v/PhOOw6aH6nt/wn2gb3U68BK7AK+hJxEmwMQ+OmHgRnHDKv2CVU64VTcRlCJ7BGhN3Yb0nESfBOXsMJ02cD5lzyi1wzP8fvAnGAkrhoSQmngxOM08iToIjvis6BXKcOEezxynbNdHvxwJYxzbanFgyeJ0nESdBvsnDPG4VHdVNmO1e5MOk7YJmmSPMNjjNUsH6YZhlK6KAO9OdaEcodxbb2acI1hXv4/R8McGenK7u6+R2+Rfmiu5ATIAd4htKB47qsug93IVeDDt1EsJRvU3q4QX86ZdJHdyBp7DSiafih2gSX2yF4TNcknCH5rP8geeSuH0SLnJOr+cWakCD6Blgt2oL2+P6SXeqpsUi3BL9FLCESYKdmhJ9gzzxn2IafrXB11IOD+CGiXOL5foIO2LcfjmtODg2GU61RhOLDG57/MyYET3E+PlxI3qohYXTkOvtWjQZnit0D247170J7DBfMw+jDliYWB0atlcN+0S/oSok/FuNiYmJiXk9/wFiIWO82BWUbgAAAABJRU5ErkJggg==>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAAC70lEQVR4Xu2WTahOQRjH/0KIIuQqREIpJflcUJcoGxsUC9kgkiwsfK2ULCQLK4W6JPlckCxIullIETYosmBBFpJCIR//v2fmfefMe86855436tb5169znmfOmZnzzDPPGaBWrVr/QYNjR3/TpNiRo1lkARkR+ceTy+Q8OUVGZ5szWk7eRFwlJwI2kTH+hZIaQGaTgXFDGXWRI+R73BBoGDlM7pCL5D3ZHrQdI9OdreshMsjZsSaQtWQbeUuuOdujdzUXsdO9U0bd5CcsgKU1DvbSV3f9nW1uaCS5TR44eyK5Rz44eybZ5e699pOpkS+WsqmX7In80hLyDcVzylM3KgTBy08mb8AVsI5vkKHON5zsI1ucrTqgLJnibGWC7Hb1IRUEZdEV2JyUqf9cqSD0wPxa2ZRUEy7AasJpZ7dTKgiqTy9hY2uvhxoL2/cKsu5jxfWqlFJBeArzb4StvLbOY7IMrZOTfLaUUVEQlGlnYePeDPxnnO812UxekE9kHlnl2oTvbw55jmbx1beocKoOyc4oFQTte/lVD/bCVkBb4QfZETxXRX7ch8j+GRToJ7APCyv9KLIINp/7sJrTC/toBX8yueRsSZmiraS+fHDku06+uGcaSgVBD8fbIdyvnagoEyRfjDVGmN66V5DmB75Q6iuvvzWw2naX7EZOFqeC8A7mXx35fWr2Jf1jpYIgrSS/yPrAp3e0MHMDX6iiIGjhjsPmPCRq+6tUEHxNUGqG8kGoVISc2gVBH6oP1uHLq2oQpHWwoCorWpQKQg/MvzXwKZXOOX8naheExbDao8OTV9Ug6JT7DFbgVRinZZutoKji66Pif7sGvUVeoXkOWAibiIpYJ9LJUeMeRDajdM5Q35pPfIrtgtWEpWjd15r7UXIAzYKqfjXGIzSP4TreNxZQD8jII0x/f0LUr0nH44+wM4GKVxWFv7MiPpOTsLG9/BYM8ase96lF2uCu8bPe7rMUWaWgitQMtK5CrVq1avVr/QE4r8uS1E5M4AAAAABJRU5ErkJggg==>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAWCAYAAACsR+4DAAACZElEQVR4Xu2VT6hNURTGP6EIIfmbKAMyQv5FGEkMKAwMGJgxMFOUgUyMXhkQr5SEDEgmyERcjKSMhJT8iSRRFAMlvu+uve5Zd9137pXXK+p99at91t7n7LXXWnsdYFj/tmaSMdmYNCEbhlrbyCXyiCxPc64R5CQZlScmkdVkTp7ooilkXLKNJLPC8xLyoYxXkvfkMOxdl8anyOxga+oyeUXOkOtkU9tsvQ6Sn+QBOU1ukR+kP6w5Tl6XsaJxodj0zhvyjjwhX8qalsaSh2RqeVZIv8JO10ty7FeiD/ZNaTxpFFx6Z094lvbC0tiSnDhL1kcj7EOfyMJkz9Imok5Ks6J4P9gOkZ1lLMeVoS3VtGkyLFpLk/0c7PSbkz2rl2PSEfK2jBVJXQLfbz9qCl5XWPmvc6zXpu7YAliN7ULnZZgHq19dih3kPBld5hTJjoKXlCqlbDCO6ZZdJYvIXfICnSUwn3wmN8mMYlMaO1Lo0sdU6H/rWJYXu97tphWo6k7pvQaLuNrVHRkHm8os1coVdHdsIrmBKlobyTeyBnYZT8hYV/wXYR9Xx67TMtihVDOKlMsPNZC08QG0F/xRmGPuQ/PC+QlzQ22gffFA8h72EVZDUq9UegpjwesgcS9Frin9Du7BQuxS99YNivIG6i1kGmyTDeVZ0dhd1vQXW5QidQy2LkrN9juqf2hb+Twlt2GNT6HVR3S9ox6TZ6iiIy0uNjXJBuz3FDt/lIpah8lS9LT/PjIX1pBbUl9ZB3Nsa5z4A/m7iuT0NOdSitdmY9Aq8pI8J9vT3JBK6cspzNIB4yUa1v+v3wKXf/kp3qrGAAAAAElFTkSuQmCC>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAYAAACL6W/rAAACR0lEQVR4Xu2Wz0tUURTHj2iQJFgGSiq4S2yR/VCEFrkJcRMtDFrkwn8iyhYi7qSNRBAkCLoRLNqku6BJQQgXbQpEaFGEgq5tIaR9v557p/POPJ/ZTD+Q94UP8+a8M+/O99x7z30iuXLl+luqBq2gF5xz97J0FpxyMT6r2cUqpQtgEjxLYdjkFbUK1sEm2AN3QFUiI133wXfwTvThr8EOeGqTKqgGcAvcBR8DvL4Nekzevi6Da+Y7r/lnB0zsINEYC2F5BGpt0h/SdCBVdaAQ4HXUN7ALbphYmmiM/AtlGuNymxBdOjUmvi1a/ZsmlqZyjHF/cj9SJwNWjeC0i1llGqNozu8nzhbNXXVxr2isXXSPDUppM/F6LFq0z+AKmAVfRMccF/39PfBVdEssizY2r0ONedEkB54DJ9w9L5raAC9BJ3gLPoEOm+TEWeC+ZuHeiJqjOB7NMfYgxPpD7ImUFv9IxtrAWvj8HcU9y8JkiXl+RcRG9NDEePRwZguS7AHULxurF23Xi/7GEcR9+kLKM2b3bNnGuOS4R56LGqR4LrQUM0rVJTrojCQH5WD/jTGe2jQWzx9Wfgp0FzNKFf/IFjgfYpVYiuUaK3Z3HsR8oGcFnAk5bPsxHo8AtuMl0Be+V4GhkMPjI0ts9Twrr5vYqOhvx+Rn07oo+jb0XpKrh53zlegKi4Z5XIyIvvkkKuxZCMlUG/gg+uoVZ4e6FGLzos9hez7szSMu1QhnxBYuUkiJcYbjGZtFRcTqsvL8c03uXq5cuY6hfgDg+6PaedhjbgAAAABJRU5ErkJggg==>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAAWCAYAAAB64jRmAAACx0lEQVR4Xu2WTciNQRTHj1BEEfJS9JavIiV5EVZKYWEjsmShLCwV2bK2sVSvspXIDkkTysfCR7ERCxJREqEsfPx/78zc5zzTcK9Y3Ff3X7/uc8/MnGfOzJkzj9lAAw3Ur5ogZouNYrho61VzxQ3xQgQxvdXaB7ot3oqX4ps4Kaa1enTXVLFdnLY+DJKd22pxN9EC8UNcFTNypz/QGuuzINktgnku5js7aUeg58QkZ+9FfRcku3dCXLH2pII1u9lL2g5ZM74W5GQxR0x0z6WmWFxoqC0QYxnHeOTfWYq+Sy3WmTERKEavxxaD5Gz+TvPEWfFI3BP3xVFrB3nGoi+yZb94Ij6IkdSOZolXFvsCz9iyso/PYq+4mfp8F7fEstSPWPaIp+KguJDsVTH4vVhdNjhxlpkwZDGxy9YOcqbFAJkkBW5Raj+S2vHDIvnzzzO2XOm9DxZyRbJvsThPQCvFG7Et/a+KVDgldltTiGpaJT6K1xYn7VVLV/5/EWudDS0X7yxW9VLsmvcfkg3/XvjEN/YN4qvFG4IdX+z6jYmUJdW4SrpphzUp6AsW+lWQtQly5WQ/pQicjGK3ULC6D97PeObExhyy6DPTEY2HxUOxJNlIvU1Wr67/Kkjvp1ROTxYCBav78EFmLbRYND85m+2zWGEpJFkM4sDXxIvKdPJtwXoLMqcrqV+K/rTRB4VkK33kufDLrh9zbbkS205rb6/Hr06pdRYP/DVn40PiunhmsQjkc00F5NxsdrasYYvFyy8wz77woGBxTv4jJReeXPxyZnDsOmK1Q2ooqa1aKarcXYs7ftFiMAes8YEdSt+5smYRFItwJ8Gzv0JQSPbj4kH6z5k9b3FxEUGyOJfEqLU34K/FuaDMI1KEj/Xy7u0mxnHBQyfNnII1C4/v2kcDHxSAaGce40rBesuuca1g/3mQ68UuR75WBkI/AXRMvavIt+0aAAAAAElFTkSuQmCC>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAWCAYAAADafVyIAAACCUlEQVR4XuWVMUhQURSGf0nBUEktkEAwIh10SIhsqSVqcHFpMWwSggY3wdDJJUJpKQjEISgIgiKIChpCxEQFF4nKBiUU0c0gyEVE/79z7nv3Pt8grf7wwTvn3nfPveecdx9wHFVFmorOElUXHUfRdfKLvCX95EQ6nKmR9BSdQdphK6kv+C+QTTLg9gJ5R9pJhfsU8CZZIZXuy6RBvfyHLMIWG4MFlEZ97KLbfeQ9eUW2yDrZJj/JN5+TaBI26bLbenGP3HD7I1kjZ93WvGdId3qaTJFrke+fOsh3ciby3SXDpMbtN0gDXCUvkAdQzrWJU24nuk9eIs9lmZS+HeQn1DuhHtIs6YrsTGonRX5IuskSLNe3kXZJM1mGpVJ1+eI+SfagPx+S0qL0fCVPyUnYSXbJI+RFls7BCqtidkb+O0jnJVJOldtiih6QfVjuD7Wcq5Z8ILfcVnF/uz0E2zAaYG054pOClGMFKBY/SJvRIhOw3evkn8g0LLCKreBZDbRgrBAg7pxYV8g88jqch30Pz7MZwJPwoMUyw6UTKcBn5K0aawb21QZdIn+RBsg2rRxrULsKWoUtXtbX6vmiPzSLsqGsiNfxBH25KtBjMk7mkB8/Vgus58ukVt2A3VsquIJlUtHaSC/snim7KXVSdca94oBLxdb9pdP/QNrKR1YdyoPH0k38X/+DY6gD6ZpdrsFEAgIAAAAASUVORK5CYII=>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAWCAYAAACsR+4DAAACLElEQVR4Xu2VTyhmURjGX6EIqVGiFEmTNBaaELGxsmHBwsIeC9mokVlMShazsSAWUsLKUkhKUVY2s5qQiJE/UdQs2Ejjeeacc7/zvXxf9xZFeerXd897znfOc9/znnNFPvS2VQgydFApRwdeW21gAfwC1arPKQVMgDTdQbGzTAdDiJn4ArJ1B1QFLu1zLbgAP0BeMMI8T4IiL/ZfNFQBFsFxfFdSpYI+cA1m7e9PkO6NGQN/7DOzMW9j2+AEnIEd8NeOCVQJHsAd+CexScKoR8z/mmy7HJyDQdtmBjctTgOg22tTnIfb+Ky+glsJb6xVzIvw7X1xYcapLLAOtmLd8h102mcaXxYzV0JFNTYixgCN+GqxcachcGqfM8UcAq5F9UuSgneKaow1lcyYOwilYuqW9dgB5iRWg8zkk4LXimpsRcIZoz6DG7AKCmyM/Um30CmqMdZOWGNaNRKrO27vEpgC9WDDDXKKaizsVmrlism2y1azmHUbxFxb4zYeKKqxRMXPW55xLqLF2DeJL3jOw3XdgeCLxSmqMR55GphWcf+60HJb6Bc8M+8bY+YC8U2Y0ntwZdtaXIy4N+KYYTGT8lNDlYBDMGPbvpipUXk6Ny9bXtLVth3sAL/6blGfTYmvk99gT8wJc+IFShP8rHSBA7AGPnljnFjU+TooJnu7oBcUizlULyJmgGa5tfzVGaH4go066KkOHIF90K76XlU0+5xhX7x0E53kD71PPQJ12n3wpYuYXQAAAABJRU5ErkJggg==>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAACvUlEQVR4Xu2XT6hOQRjGHyFEEa6rEImFFfJ3ga6ysLGiWMiGhYUsKMpKyUJSl41CIQtCIlkoi5uVEDYobFgoC0mhkD/Pc98ZZ877ne985zvy59Z56td35p1zZuY8Z+ad+YBGjRr9BY30gaGmGT7gNIHMRfGLTiWXyHlyikzMV+e0hrxyXCUnEraSSfGBihpG5pPhvqKKeslh8sVXBOkFr5A35Bp5S3Yg62wMOQozSNLvQTIilL2mkQ1kO3kNa1PliJ7VWMTO8EwV9ZFvMAMrawrsoU/h90e+elDjyS1yj/SE2HrylewO5XlkV7iO2kdmu5jXODJA9rq4tJJ8RvGY2qkPNUyIioMp6vAG7IVXuPgxZPdreRwis0JZM0HlomWTqswEzaLLsD40U/+4ykx4ST6SRS6ugaf3a8lcgOWEM6HcSWUmKD89h/WhtZ5qMmwpymRde6ndrlVmggwoM2G0i/tymdqZMJacg7V/M4mfDTF9mG3kGXlPFpN1oU7E9haSp8iS72NY4lQeUjmn3zGhlutBsd/7yO8MylGPYC+WZnrtTsth/d6B5ZwB2Fhk/kxyMZQlzRQtJbUVzVHsOuydcvrXJviZIMWE7PvQtUxaksRSqa2i9pTMlTRvkz1oXWL/pQnSWvKdbEpieqZoPFHtTFCiPQ4b8yhXN6gyE6omxjrqZIL6VN86fEXVNUHaCDNVs6JFZSZoSupBnfJSaWBF93ejTiZoW9b2rMNTVF0TlpInZAssMc7JV1tCeQh7Kb+3T4dlWK0lrVNpGWwg/fGmmtLJUf0eQH5Z6ZyhBKnx+FNsLywnrEbrutbYj5D9yBKq2lUfD5Adw3W8//UBdYMKRSgzRy0gL8hd2MnwHTkN28rqKN3O2vGBnIR9hKi4RabEr+7b1EfaHH79vbHcteTyKtjZvtMfrUaNGjUacvoJP17KGUOOTCsAAAAASUVORK5CYII=>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAWCAYAAAA8VJfMAAABn0lEQVR4Xu2UyytFURTGl1BeeaRIKZfMzMjMyMyA5BFFJib+ABOmMlD+ACmJkZKRSFEMDMwMGcrAgGJkwITvu+uce9ZZ9xz3dstj4Ktf9+619t7fXmc/RP71x1QOanwwRY2gDTSDsiDG8amad+1KsAROwBY4jqdjqgdr4AM8g0dwJ2o8G3WLKwN2XIyLmJZoxdWgM0rnNAiewCuoNfF2sA9eTCwnVrQt+aYroMnFplx7DLyDB9DrctSZaPUxdQSJRck3ZZWTps1Ku02bX4ATXoEGE7eqAkc2wAo3RL/5sOSbhnt6IMl72ipquuriXsu2MQ52RSdPMg3FfFIlA6KmMz7h1G8b56An+P+VaZo4hqb8LUojonsUqhTTIVFTHqaCagGnLlaKaZeoaWzPEsTFZQ14zO8NvNBhbE/i9y1NFaKmPJ08pWnK7jk78KmyzIleZP+EFdKb6KPQ5xOBuLDEL8jTuQAOpbgKrTh2XbTia5fjwi9F34KYuAoOsFyAOtOnkDg5n8IbcCt6pzdFF5GJun2PaM7zMgFG5QcM//V7+gTjiEo+j3GZ/QAAAABJRU5ErkJggg==>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAABP0lEQVR4Xu2TzStFYRDGH4nI3Slhc+0t1V0rSx+FsiFLydraH2EhKQkbS2uU84dQSFmxYkM+nufOOae5c+8pB+ku7lO/mnfe950z550ZoKN20lR0FGiUdAffABkMvlxj5Do6C5SQZ3JK9sg+eSVz7kyuHnJAPuNGgRLYWc8M6XJn6qqSC7KJ7wdXxhPRGaWMd8kKmcUfB18kR7CPlA1eI9Nkh2yjucC4JOOpXSb4GbkhW7BnXSLHsI6pS5XtzxYoF7yVXsi9jCFy3rj36+AP5EOGAqkv7xxPsOCyT+B+MUjt9kjWgv8WaXJ9ZCSwmm7K1qQ19WyqCuycitrr/HqWN7fOpW5Zh12KGR/CstJHMyVk2K1Vu3e0mFBdzqYsI4FlKC3AptcXfwNWPN3V6F+hYEJ/Kj3dPFkmk41bHf2nvgD3CEWUmmncKgAAAABJRU5ErkJggg==>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAAAWCAYAAABud6qHAAAEYElEQVR4Xu2YSYiURxTHnxghYuIuQVTECII6uKAxRFzmoCiEiKASUBFCLh68CS4JyFw8KChBEgJxQ0GMigchkRByaMxBUXCDMCIRZkRGVFQIKi64vF+/et3V1d/X3dMYBrT/8J+er15VddW/3lJfi7TQwruCocr+aWOCD9OG9xkDlD8rryiPK4dXmksYolyWNjaIgcolaWNfAe8Yq1yoHJ3YAIJ8ouyXtCPA4Oh5o/Ifsb5blf8ql4uNB4yfpryk/CC09RaLlK/SxgiDlL8qb0b8S/lLxG+VI3xAwKRgizm/oofI3tBewjVlj/Ku8rXya6kUCTG7lXeUx5SHlF3KB8qZoc9IMdGwgU+VBeWPYgKygdvKq8rO0KcZ7BFb40epIYADaVeeEuvH3tYqVwZuUz5WPpfKPRId3ytfio1j/JjIDr4R20sRbHxu2Vb8n8ErojYXjgmdTPBZ1GeW2II2h2c2dkI5udTDwoy2ZsPUD4fv5/tqgXXQryDVIuNJz6R6HeTd38XGHU1sju38YcJCYDz5E7FwICwAwhXCZx6mK/9TfheePxbLc3ge4ID+FksJzQDvwHu3hM+CVAsSo5ZwefsGE5S3xMam+EJ5nn9YzA9iCT3OOXgOA78Kz40IR747pzwiNm+b8qSUF/abVJ9wb0DePCvmaUvF1ljL62oJRwh2KTsqm4tg7QfFxhIhMUgTRY8DdEyTPt4WL8yFw3tWK3cqp0j1OGz3lHPEkii5xfGTNF8QAGL9KSYCIcvGPC1kIU84xNgXbBx2FvguNMDDYuBtaVsJiMGkhJlXQ4S7HkhF2qB8KnZi3gcwlsJCISDRuo0wbTZEHYRnLFSWKDFcOA4SD+IgKWwPlZelHE1Z8FzakbT7wVVhvJg4fNYDX8zCCM88IOQmMW8DU8VEpfBwXdkd+jSCdNFeJDqithh5HgfwNL+ixAcfA8/C6/A+QO6LC10JPtmZ1JCDecoXyvupIQIh6wXBk/sF5TCxnPWH2ILqgbFcH+K7Gc9+cFkhV0s4QL7l9tCetDsIacazZr5/jWSkGlRHfa4KvojPpXyPYXCPcnF4Bn79gFlgHkq7FwTEQrSClDdCrvHKXQuITD9ShnOVmEdwrcjKO/WEY/318iR2Kiz5/HRiK4KwQTivIih7QMr3tG6xSXaFZ+ChyqU2Cx6ifkpslnkKUt4IFapWrnEQLunm4ztdR6WpiHrCETHY8aQ8sDf6UAyrIpF8gzGlhxRYL3Yh5HUGjAp2Eq2/OcTA22LvBH65JHS547GZ9IKcgj7rxLw6DUdeE9k0a8Xr0h8VOGRsXGG8MNFnopiTYPsytOeBaKEfKQmhS2BhhWBMySb9FwxCeYfyhnK/2KtZ+ubg8IKQlfRZCCHfJnZghyU/ObtHO/HW+B6JmOma8bJae3I+EnvvrAdSRKfk59GGMU7sfW+25G8YD8zMB2InjqgcwEVprHr3NRYoZ6SN/wcQ1EM6D3hFnvAttNBCC28DbwA8XBAbl49DUAAAAABJRU5ErkJggg==>

[image48]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAWCAYAAACMq7H+AAADiUlEQVR4Xu2XW6iNURDHRygihFyKyDW3FFF4kSiKFx4o5FHyIh503kTCm7wd1zxIkRAKiRPlWi7lUvJCLiFEKOU2vz1rzjf7O/vb54ii4/vXv2+v26yZWTOz1hYpUaJEiX8XvZQDE/8H9FNeUj5RvlV2rx5uiSblfeUesYUHlb3jhHaIrsp5yr3KH9KKk/DoGmXH1O4gtuistLKwnWCy8pO0YutMMacsCX20vytnh772ijY5iciZmL4OnPRA2T/01QLRN0jZR9lJOUKq5QBqHXI65/odyPBa2CU35qCf8SJDkOHy+U121ANzXVaRk7BrZK6vGWzwTbkoPxCAIxYrHykblUeVH5QXJNtslPK68rHyrvJ9WuNO5EtNYHy/8qTYvtskM5i6uEv5PM3hG+vlerEDhTOUW8QK8VPlZTFDIwYoD4ntc1N5S9mg/CyZ3m4bdq1OfRV4EdsspvQsaRkREeOVL5VzQ98yyZxEZL5WnlP2FDN6n5hyc9J8DoH2ztRmf4zF2awfIuZclwH40qYfsNcE5W0xo+MhUC5wKBEOkPcwkYgHOPuMVBdut61VsOiGtDwJxzTlFzEjjyiHS1b4AYa+SfM8lSYpX4jJ9Qg4JcUpxnoiIq+Dp8ew0EeULQxtwGFDf9KgE/vHdSCfbm4bdq3wSbWAchixXWpHFH3rJAt1SOpNSeO02eiAWKREbhUzijl8i8B4NNKB09AvXirIWRDaIO+kInl5J+Vtq8BPOqJJbMI9Zd/qoSoMVq5UfhSbT80glIsUcvyOk2jTT3o6/qSTHNhFaldy/KryjtgN5eBBWc9JnOLG0KbmbBBbg3BShY1RoBY83VCiW27MgQyvTxFu1JjQ1xYnsaYt6Za3rRJam8TqRQQGIDAqEoFCzGmQrBbNVz5TjpOs6L5TTk/jOGO3ZLfmKrGadjG1wVSx4s8NiwyKLIfIrQT40vbCDZB7QrlUquviKzF9Rqc2stHnvGS3I6nL/thCwcYfbluUVbnZuAKPKdcqD4td3VzhRUAQip4W+zvDxly9MQV6KHcov4qlL+PLpfoJwC3Ke+xamoPCQ9M4wCn8VUI/5vBtlNpPAEhEoBsRFPub0vyxYrbxHDmuvCIW+axjnkcktvnftGaQagxyGry83ZAicCP5rUSYcvJVng9gXr3HJHuREjw6i8DaejJ+Fezl+7ls199tw658/SpRokSJv4qfZIDnxfuoU30AAAAASUVORK5CYII=>

[image49]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAWCAYAAACyjt6wAAABqUlEQVR4Xu2VzSsFURiHX6GIIqTYKRH5KoWllWywUcTCzsregixsJDs7HyULC92VZKdM2ciKP4FY2LMhH7/fPXPuvPfcwTTuSJqnnjsz73nPOW/nnjMjkpLydygNeW6GJU68WCzB7RB3YKfKy1INn+GFBImPcA9WqLxiMgwn4RF8hyv+8wSsC9IMLJBJ2g1YqZMSYlHMfP1ug4YFjrnBX8IW2OQ2aH5SIPdqg7pvhLVBcxaOX+7ELJELHIeDcFPMHqzKyyjEDkyf4Bq8hXfwFXbANnjmx9/guhQWGrlADrwFu2CvmEH7dJID+3TDK/gCpyQ48aPwEp7AVj/GA8dCpv1nS6QCw/DEdFxw4i77YvI0nOzGv1pmxeQxXxO7wAMxHXn96l0YtUDu8dgFzsNlyS/ETuyJ+Ts/I8kCy/jDyT14DetV46mYjrsqFkaSBbbYmwEJNjPhSrITT7N76jQ86cdicvWnsgfew3YV47/EvEMJxuR11Y8PiZmXcqHsFybHA8yIKepcvv+S6NcM5auGq8SV03EPzjgxG3djYeaogSNwTuK/tFNS/h0f12J6UWaBDBgAAAAASUVORK5CYII=>

[image50]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAWCAYAAACcy/8iAAAC1UlEQVR4Xu1Xz4tOYRR+hCJEaQxFKBYilF8lP2ZhY8FiEPIHsLAiUaQsrEiSKCkrC4UIJVlMNmosWJANC5KikAU1fj/PnPf0vfd897tzx8hQ31NPd77z/rjnOe+557wDtNFGG0PAeHIaOSn9HkFOSM9hxYxoCJDDc8nRcaAC98k+8iX5nlxPriVvwQKxK405n5OXyHOJZ8gt5Dg0YzMa85wH0Zirp9sL6CSPkV/iQMJU8ir5hrxOviN3kyPzSSVYTh4hx2a2B+R3sgcmeB7M8X2wwFxMv51yVn59JLeiCK09TP4gf8J86yJHpXE9D8HW9mMK7OWf01OLIiaSd2GOdiTbJvIrudcnlUAib5OTg30O+RoNwQ6l/AtyQ2ZzTCfvwfyLn8ES8lMa2x/GHN3RoBf3oFywUk/iVgX7KZTPd7gjUbCwjryD+oIdyqrHsINy5IJbrW2yVwmWE9pQG+dQNMvmO2aTr8gTKKa0oEzZjkbqCXUEL4O9c1tm++OCtVmV4DHB7lDqnYTN0Teoz2JnspehjmDN0X7nM9tfF5ynZYS+f83J+RZWfKLwwQhW8LwS/1OCc6iVzYdVTK1TuivtHYMRfBmNz8HXDbtgCdQJR8yC9Vqt3ZHZ6whWG9K6vBrngvdk9hxNe1YJ/t2ipfnXojHhKFo73uRcho3kB3JBZssFt2pLTYGoEqzvRY1drSSHCkfZfIcEP4zGBA+WiphjIMGq9DfIsyhWd+/32k+BjFCtOB2NM2HOaVG8NqrpP4U1fk/RFbBTVxVuBS8mB1BsSythpxQdXwgraGo5XtD0XA3r2fLtSrJHyOfjsIOJLfAR7KLUD52sNipjHunF5DOyF5YecvgCyu+3Dgl+AgtUHyy9dU38huJaP+1WVEu7CQtU1VVWY+rt8s3v4rodlnWEWlAU18DutwP9kyF0kIvS352wANZdOxQshWWJCmJXcaiNNtr4X/ELyGzU9tjPsBEAAAAASUVORK5CYII=>

[image51]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAWCAYAAACG9x+sAAABeElEQVR4Xu2WzSoHURjGH6GILCgSUq5AKTeAhYWNXICVZOE+JBsr+Vi4D2kWSlZcAAt2UkRRlI/n6czR/F9npjOpYXF+9Wua854z533PfJwBEolEiDHbEEk3naBtNlCTHnoT8IIe0F2U5DhEN+mbDUQwQ89pRntbQ7XpoEv0kH7S1/zcu5a3b/sBg/SdvuRHBWNZpff0CW5cht8X4FmAu+a1DZAjBPLUxBkCgQj8ZBmaKcDHWviLAtR3mA7g57tTVcAiAnk2WUA/3YN7347hkrykk4U+VQVsIJBnkwXoGX6g04Vzjd//7lFeQCd9pnemvbECRugHnbUBg7+mko2iqQKm4JLSsYpUQB3qFKBHSH3nbcBQu4BxuN1Ug/SiFNFkapdbJia0oSl2SkdNLMQZ3Ka5DPf51Hw7cNcR7XQF7praYHVeilbMJ2fVKgh9q0/oI53L24RfJWuG6jvRB/croCJu6RVdh0u0LB/9Wvw7uuAWx97xRCIRwRcuqIYRysz54gAAAABJRU5ErkJggg==>

[image52]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACiUlEQVR4Xu2VS8hOURSGl1DkLpIiMnOJ5DIyw5CEUpjIgIGZch8wMKAYiJQYUBIyUMhAOTFRiigpkUsihFIkcnkfa69z9tn/95XBL5P/rafz7bXXPnudtdben1mf/r1Giv6lsdCg0tBbGiiOinvinBjdnq41QiwtjSGim5GeuXj5ONGvsPOy4dl4s3hg7rtdPBbLzNcj1s8Ud8WAZKs1RBwS38RF8VLMzebHi+fijTgrTopn4oOYnXzGmAfAHJoiKnHYPJgX4rW4Lx4mn5auiRtiQhqzCBvBoQjiVwY+89I8miM+i61pPFScF1NrD7PBydajFCy+bO0S7BULszFBVOnZTbPEJ7EjjYeZ9wUZQWTspjUf2hIbxsJu+psg6I9b4rR57emtC+YZQZesQwYQ6Sbt68yb6qn4IqblTtYEwVetFvvNfcpGZe6dmC+OibXZ3BHr0Iwoan1dbDM/29Tto/mLcr9HifVik/gqdlvT+YigVpk34c5sjlJ0LAOKIMpyYPspFhX2XEvMG5QSUIpOIqgt5llA080DXGF+hA9i5Dw/ERuSU6gy3yA6vZMWiO/ivbVPQC6yGc1IQBzX22KU+d5XcYqeWO5ralXWDoLFr8TicLDmSAK/S5EdTl00IxsTQGVNsx5Pzz+no/xiLh2CWJPGcUccqD2acnABxTHMFWWIZozSV9YEwd5/RCNSkslhkH6YvyS6f6M4Y83lNdb8q2jguDFzkYU8a4h7iMxQHu6QuMxqURKi3CNOiV3W7np+7zMP9oR4az1vzFA0Y3l8EaWhrNwhNCd71eJoUlfSvzKfKDTRfJ7/lTzIXGTmSmlMYh8C5GPuiEnt6d4TwUXZuolSdPuIPv0//QYmqn/oUmjNSAAAAABJRU5ErkJggg==>

[image53]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAWCAYAAACG9x+sAAACM0lEQVR4Xu2VvWsVQRTFj6ggKAoqUUlECDZWRoRATGGTRCxiIVonVRSLlJH8CRY2VpKPIr1/gUh4oEVCisQinRaGgKiEYEAhAT/OeXfuc9+82X37XrDbAz+WvXN39t6ZO3eASpUquY6Qc+QWuRKNldElMkR6YHMdRifJVoINskjmyOWGd9AK+Uq2yS/yAjZRGd0m67CJ9dxsHu5Yx8gDskT+kP3w7jwJdsVYl1b8Dv6tXF9weEPOuFOOBskuORrej8MSudHw6F7jsDg+xQOw2DRWX2W9yEll4HobHF7BViSla2SHrEX28+Qz6Y/snaooAR+rr/pz8pqcyjjUgoOSyysln6QW2TWP7Hcje0ry1cLp/MVnpyiB+wgJSPrQS8ClOm6qs4SeojiBR5E9q7NknhyQZViQH8hAxqcogWfIJJDSb1htF9VyuwQ0niftrObXGfJ3fbPQ8MhPQOfsB/kW2evyQ/gQrVsaq9sEemELNBIPRPIEFGwpqYxmYe20jLpN4CYsKD2L1FECWu0Z8p5cDTbV6TDyu1C7Q6zxlP5LApOwTnQxY9MEukzydJ3sofXiugBrr2qzKamEFFi7LlU6AW9JKXwV9TO3qe267sFubj8veqoMRxseaa3CvpuEfaOz95I8DuMq5ynY/36G96S03TW0Bu6Z+zarV78j39EcnH6uq10tUde8nvphuwZwGtailcQX8pFMwwL1EowpqoZDSzs1QcaQf/GldAK2ONqBSpUqdai/HI2ZEPgzrGgAAAAASUVORK5CYII=>

[image54]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAWCAYAAACffPEKAAADCElEQVR4Xu2WS6hNURzGPyFEEW6X0JUYGCHPvLpKMTHxiIGkGBjIgCJ3pGRgoDBRKGRASCQDMjgxEfIYcAsTkqIkhUIe33f+a7XX/p/3iSvaX/06Z62993p8a63/+gOFChXqAw30Ff+C+pFRZD7pcs+8RpApqD7RMeQ8OUOOk5H5xzktJS8dl8jRhE2wcbUizWUa6e8fNNJt8pa8It/JYTI094ZN8CJ5Qy6Td2Qrss6GkEMwgyT97iMDQtlrHFlNtpDXsDZVjujbr4Ft4Ztm1A2bgwxsWlr5ZTAHpfHkJ7lBhoc6/ap8l3SEulXkG9kRylPJ9vA/qodMcnVew0iJ7HL10iLyBTaeZtWNFk3QamtyL8jYpP4WrOMLsJW8CpvwwuQdSTsmDlDHYz+ZGMraCSpXOzap6pmgvjUG9dHpnv02afUPkOuwwUSVkO0GGSWTPpGZyTuSBp6uko7MWVhMOBnKjVTPhAnkGayPuFOjRsOOokzWf690Pg2lxn0QeQzrWCstyYB6Jgx29b5cT7VMkPmnYe1fS+pPhTotzGbylHwgs8iK8EzE9maQXmTBV3NT4FQcUrmmfpD3sAakRia05LpTNOEe8jfDZ/IQNrF0kXQ7zYP1q4CumFOCjUXmd5FzoSxpp+goqa1ojuquwOZUIT3UANYgv/36wgS/E6QYkH0f+i+TZid1qdRWtfYUzBU0b5KdqDxiZbd3w65Kr79lgrQctjPXJXX6ptp4omqZoEB7BDbmQe5Z2RE584hMDnVKdBbAPmw2MLajRiaoT/Wt5CuqXROktTBTtSty2gi7IdJorrOoICRpS+pDZXmpNLA/bYKuZV3PSp6i2jVhDnlCNsACY1xwrEQWUT0yQlIC1Qs7SzGBmgsbyMFQblfKHB+QvcgfK+UZik8ah7LGVJ2wmLAEledacU3X/h5kAVXtqo/7yNJwpfflBYyr4CcvvNPTyXNyB5YZ6vY4gcr0ulml11ktPpJjsEWIildkSlx136bmsD78+ndjuWXJ5cWw3F6JTKFChQr9V/oFlznU/f9ZXa4AAAAASUVORK5CYII=>

[image55]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAWCAYAAAC2ew6NAAACn0lEQVR4Xu2WS6hPURTGP6EIIY8IucnEK+9ERkJXYUCiKGYmZoqUqUzlEYlkRBhQKLqD65EBJYoUySUZKESYyOP7/muvc/bZ7XPuf6A74H716979+J/zrbX24wD9+rc0mAxPOxONIAPSzr7UIvKKPCbrUW/mKmqC0Q+mp52RND6eLCUDk7FYytYCMiodoCaTZ2QX6SDPyXEyJZozjOwj86O+lmRgJrlCeqpDhTrIPfKEnCQvyLx4Auw5a8kHchr2rPNkZDRnJ/lGFob2AdjcG+QNeQsz/zGMF5pDfpLv5Dd5XR0uJIOXyNDQPkhewgJwrSI/yI7QHkcekDM+gToLe8fE0F5HDpfDLek5KntWilCR5oxqnShLM6I+vUhzn5KxKH9/jQyJ5smIEuA6BcualoC0AZZVaRA5RnaHdlZNRqehmgVJ5rtRlnErzJAyFsuf65tiC/lKFsOWyhHYhpL0t3YDuZqMaqzOqMwpa3vD/3VG/bdjyF3YOl9Groc+6Q4yGyhVk9GV6N2o1lk7RqUJ5AJ5iHI5qeyNJXc1GV2D3o1q7bVrNNVUWJYlLYdDpAt2VN7ySa4mo3+z9Kl05p5Amc3Z5BNszUs6bytqMprbTLretKZ0rGlj1G0mjWmO5ue0EdUN5M9R8JJ8VdRkdDT5QuZGfX489ZBJZDnsDFXJdLO4/HhSSVN5yeMN5JVxo0pSIT2kE/ai96Gd6h3s4FapJF1xCmxJMQPYBrs8Noe2bqTbgZwuorxAXNq4v2Dnq+RHVysziiClG9XzbAUsiHOws1Dl3IRqUApiP/kMK+F92I2W+35QNmelnbB33iRHYYFerg63J5V0Ndke/q+TPjBkVMsp9/HiN1CdFNgj2NfVnmSsz1W3uVwKMPf11a//R38AGCagWhU5KsgAAAAASUVORK5CYII=>

[image56]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACmUlEQVR4Xu2VS6jNURSHl1Dk7cojiqQkckMMFEoMJPIYKMwZU3QZykCKCSkZeCRFmCAD6YSBUkRJiUIiSaIYKI/fd9Za5/8/+55rdGVyf/V1z15rnbPXXmvtfc0G9O81VgwujYWGlYb+0lBxQjwWF8X4dndLY8T60ojIfqGYWjpqGiQmimnW+aS7xVMxSfSIF2KDeXKI788Xj8SQsLVE1p/FGfOAFe3upmaIe+Z+eCtW1vwTzBPgN9BM0RDHzJN5I96LJ+JZxLREaZ6L6bEmWxJa0Iow6xJ3xJbwA5+JWxYxi8Q3sTfWI8UlMSfWaHjY2loxTjwQ2+pG6bV4ZVVr+GGyp8x1ceo8ebf4KvbFepR5hakI4lB3zVvZpinmG64r7Nh+iVWx3iV+i1tW/QgJUf6dsaai98V580rNE5fNK4KuWR/D+Lck2HRTrOeKj2H7YT7158xPmpugrRG3RJwU22u+49ZhGFG2Y0dhZ+jYMPuL1pr3HDtVOmre47pyVhjC/VbdClrRqw11lYPJ+oP5ZpkcJ79tfvrR4kv4YY/55p2EHT9VQFSUBDebX+EjYW/qgvgeAfT5pfkGa8LPA8TtIEE0WVyJGBKeHfZStCWHkYS4rlSeDjBTN6tQF88oV5FgZuKTVdeLz+UNotT0nUTKmUIkfN2qYczWN6yao1Pxt9nXWbkIURWqk4PELHTaaLF5bCdftiF/Iy9Bw6okDsbf5g3gKuWQUcKyzwfMH6alNVvOCb5yJqjC6sJGpakM7eENycesKb6Ag9Ji5GQ51SkSPCx+iqvitPnDdMh6x+YwlokhWvPO/A1hOM/WncvNe77RfC76EsNE6aF8PVNcxxulMcQ/PRJk8B9adSP7XVRmRGksRCvKCg7o/+sPJkeF3WbCFF0AAAAASUVORK5CYII=>

[image57]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAXCAYAAABj7u2bAAACP0lEQVR4Xu2Wy6tOURiHf0K5ZOASyUCGIpQRYcRIGchAmZhRbiMkJVMDJcqAUzJQMjFwCYmBicsfQEohKSZKyCWX3/O9e3XWWt/+LjpG+p56Ovtbe621137fd619pBEjhmaSnWsXNn9bWWXv2tf2md2nGJhz1F605zIZNyzMt8J+sW8Uz/pkD9rpWb8Oi+w2e8D+th/s8uw+k621++1ne8xutjOzPv2YY6/YryrHTLY/7b2srWCLfaVY1PHyVocpdkfdOICl9kUj1zVHFM/rYpa9rogMEaLT3qKHtM7Ortr6MV8xz+76RgbzPakbgdXfVERhTDHRw6KHtKv63Q/SfMo+Vp/iVQTiQd0IpOJCc73GfrO/xm93FkodDEuKdB3lGnYbZdIFUUn1QdXfUkRpatNG4be+SQ8OK8bnm6MNyuBH3UgeSVdedFsVESJasNHeUewMdthZe1rdxwNMszcUCxpUc2nhBdQGk9cQ7reKt7yqWNRLjdcSaeQ30ctJaeh6UAuURtGPN7ykiEjNEkXny4p08eB39mTWh3NpdfYbUqEOWhClQZ9reeM8e1/tZwQwAEkBqZihSBvwMpy6LDyHdjYI4xjTC46D53Zx3khR3Va8VRvpTCLXNcvsIbXX0XpFOnoVNRn5riwQaWunCKQo1NDvkSKSCXbeGbsza2uDSPLtem9P2O3N9VO7qbk/YYgGxc63j+s9dmXRo4TFb1AshmNlQXl74pCi84oFIUfBP3/I3/BRZZr5t2XYr/6I/4c/kAZymjyQu2YAAAAASUVORK5CYII=>

[image58]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAChElEQVR4Xu2VS6hOURTHl1Dkdb2SkJLJ5UaeIzFhYEBepTAzYGCmyDUxMaAYkRIDSkJmyPArE6WIkhJ1SYRQipTC//etvc7Z3/7u0R1cmdx//Tp3r73O/tZZj33NRvTv1SNGl8ZC40rDcGmsOCcei+tiWud2pSlic2lERL9czCk3zA+fJUYVdg6bnK0PiqfmvkfEC7HF/H3E+0vEIzEm2SoR9RdxydxhXee2zRavxHtxzdxvQHwWy5LPDPMA2EMLREucMQ/mtXgnnohnyacSX/NczE9roiWgOBxFEL8zOHhV5rNCfBOH03qiuCF6Kw+z8cnWUYqp4oHYnRvNf3DA6tIQRCs9m7RUfBX9aT3JPMNkBPFR98TctK4UX7ipsGP7Jdan9VCCIKP3xRXzbPaJm+YZQbesoRn/FgQp35bWEQRftUucFIusu1HZ+yhWi/NiT7Z31gZpRhTl2FfY35gHEfUlCPoG9ooD4oc4ZnXnI4Laad6ER7M9StFVhlxlY7JmCgiiDC4X2cOHEvDOYCKoQ+ZZQIvNA9xuPsKnk72tq+J7cmDMXpr/wMbcqdAa8VN8ss4JyEVZohkJiHEl81SAu+Ru7eriGp1u7kxP5Ifz8luxIa1RjCTwdymyc9vqZozSt6xu1gvp2Z7dhbFIIitkJxopGvVU5VGXgwsoxjBXlCHOiCFoWR3E8fRsTwCjRDCIFHJA3vn7zYOakNYzzb+qvNRCZCHPGiLTZIbycIfEZdYWL7DBSGEkC3nHI9YnzHvlovhg3TdmKJqxHF9EaSgrdwjNeTnfXGt+a24174smzRM7xErrDjREZu6UxiT+vRMgH/PQ6okcdhFclK1JlKLpI0b0//QHOrCA/0OLghgAAAAASUVORK5CYII=>

[image59]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACeklEQVR4Xu2UzatOURTGl1CEfOYmimQi8hl3dpVQBuQjKcz9AYowlpkRKZQoKZcZMjylpBQRKR91SYSkFEM8v7P2Oh/befUOrkzuU7/ed6+9zz7rPGvtbTamf68ZYnwezDQpD4yWJoqz4rG4Jma1pytNF9vzICL7NWJ+PtHQODFXzLPuLz0knokBcVS8EjvMk0M8v0I8EhNSrBJZfxWXzBdsaE+XWiTuiafirngpVjXm55gnwB5osSjEafNk3ooP4ol4ntZUwpoXYmEaky0Jra5W+Nfz8utisrkLJ8Vr8+TQWvFdHEnjqWJYLE1jxLPEWqWYKR6I/c2g9EaMWF2aQnyx9oaUhHV8PS6sFN/EsTQ/zdxhHEF8FA4uSONKsdG2LE7sp9iUxthIjPUhvrQw/3pcwNH74oq5m8vFjbQO3bQezfi3JH6JXWnMi3olwbp4fp/4LNaLc+JAiqMz1tGMKMpxMIu/M9886osr/SSBA3vNm/C41aeCUvxRhqbyxmT80XzzSI7//SSRi6QOm7uAlpknuNv8CJ9K8VJXxY+0gEaj69l8a5rvtxy5KEs0IwlxXHGeCnCX3KmXurhGZ5sv5oXN09DVmHQ/LyD5dY14CEdvWd2MUfrC6ma9kH7Ls7skBklsjDvRSDzM8eMYhqKpR6z7lo0yxB6xvrA6iRPptzwBHCWSQVjIBjgSIsn34qJ5szFHTSnTYGNdCBc2ZzGcxhncw8W4zErxABMcKYK4EF3d1Ebxydyh8+br9lg7WRTNmMcRpeFjuENozsvNySHzW3OneV/00hSxJcH/LnEcb+fBJK57EqTxH1p9IkdduNgrwRCl6HJ7TP9XvwF0KoeNpW5jZwAAAABJRU5ErkJggg==>

[image60]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAWCAYAAABtwKSvAAACRklEQVR4Xu2WO2hUQRSGf0kEg/EBSkQIaGFjoVEsohEiAVNYCIqComBjkVQWgoqNjVUamyCEoEi0tEinhYKghYWd+ADRQvGBNmKhEPD1/3vO7J0d9zELN4nK/vCxe+fMnTn/3DNzL9BRRx3Np66S6YRTHjtWJ3beY7nqJ6vTxhZaQnaRvjTQSofJGTJHfvn1oMc2kwvkp8cuR7EcLSXXyPo00ER7yEsyQ14ksSxpstewhFPtIF9hsf1JrJWOwBYi18wh2FwnYQsxURvOU9lmlMgUrCQ1bo6ZKzDje/1apXagCANrYQNLy5x6KtuMVvg62YB8Mx/IW9geq9E52ORK4jR5COso55NkZdG1orLN3CWbUIybY0bjPyI7yT3yEbaX0Uu2Rx02Wn+c9TZNtsrbpNhMenrNojgAcsx0k3H/366ZV+QObCGGyOcQlCGtqFY21hgKQ8u9rawnoxLRqga1ayYtM1VYRY3MKCHdGE9Shhlt2EsonorUrpmnsH0eVJ1voc1oDJXJe/LG0X/dp9/HZEu1959SvwdkRdTW0sxxzE+ZdcHe2BorMEDe+e86FCdrPek0S5+itkRFMqMEbqBIOhwAtzwetJV88piSijVCvnnsaBJrJpXdNti4Gj9WWJzqnqBGyQ/Yu0n36oC6H4JKVklcJM9gnwffYW/VntAJNmiK+krhiK8Xa6ZQyjFxldwmX8huv5Zk4AQs55vkCXkegnGZhRJo9NL8m7SGHCTDiMqy0Z75J/XfmNGnuz7lA/tQu086Wgz9Bm2lsM4n1vStAAAAAElFTkSuQmCC>

[image61]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACi0lEQVR4Xu2VS6iOQRzGH6HIXS4RkbJwieSyspCiLEhRymVlYyEbRZyNjQVFiJRYUHLLDll+sVGKKClRSIRQSim5PL9v3nln3vm+ryyObM5Tv3POXN6ZZ/7//8yRBvTvNdYMLjsLDSs7+ktDzWnzyFw145vDtcaYdWUnwv1yM7scUFh8shlU9LPY6Ky92zxRmLvPPDfrFb5HfL/APDRDqr5auH5mzpmW2abmhlPMK/PeXDHnzUvz2Syq5kxQMMAYmqWw1kkFM6/NO/PYPK3m1MIlrvMcsvjWrB1N/M5g4aXZnMXmm9lbtUeaa2ZOPUMaXvV1pGKtmV/0sVBLYSGECdr87qWF5qvZX7VHKUSYiCAidtdMq9oNrVEID7mKum2OKaXkb0xQH/fMRYXvONh1pYPcUJcIRE1SCvEJhYpmsXzDaIJTbTaHzVx1FipjH80yc0bNlJ5Sl2LMRdFEI78UbkouTFC4sN3sNN/NAaXKR5japLBeXzZGKrqmIYpiuWOmmpUKBYcZTpJvUIpaYh5RIxXdhKk9ClFA8xQMblC4DEer/vbdnhkb1giFxX+aFVl/Kd6UH+aTmjcgF2mJxYghrut9M07hLaH26rtdCvcYideNj9+aVfWMdCWBv0sRnZtKxcjGGGgpFetZfsT7Xwrnb5RMxDfiSD0jpYMHKF7DXDENsRjjXi0lEwer3+0KppjySschdzzWxA5zSSFVaKLCqb4ovZi5iEIeNcQ/LCJDenhD4mPWFi8llc7gLnPcXFaz2DBzyLxQeNo/qPPFjIrFWF5fRGpIK28IxXkhH2TD1WaL2ajuC6DpCuNL1PvmEJlbZWclDoxBDvPAzGgO958wF9PWS6Si1yEG9P/0B4QPfqhcBmfUAAAAAElFTkSuQmCC>

[image62]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAWCAYAAABdTLWOAAACLUlEQVR4Xu2Wz0tUURTHT1RgFFoUaQtNgqBAaNEuxIXoQjAClQqyVVD7XPgHiIuKNi2KxJCWQQsj2rUYRNy2URSxRRCCxSAFChX9+H7nvDtz3uHN3JlZTLOYL3xg3rnnnne875xzFWmppebWMdCXUKt6wBVw3C9kqBu0e2M1egK+g1cJD8CRlEe2DoAbIAdegE2wBHpLLkV1gkfgJ7jq1qI6DLbBBWPbBc/AIWPL0jj4JZos1QHeg/Wih8hpsAL2wW/wV+pIkqd4y9nuiQabdXarIfAHvHb2iyAPTjg7yykndSQZNvpNfGYwnspRtxY0Lerz0tnPgE/gkrNXmyTrmqdPFd4dAvpNIck1cMqtBTG5SknypK1iSY6CHfAFfBat8ULZxJLkGn2yFEvSx4wlyXqdkVJ9/xDti7IBG50kG44N2G9sjLHHH+UCNjpJnh7ttoH5yVf5I9Y4OVGfLMUa57KzV0qSyov2APedF52nY2FxXnTkWN0XDcbxVE4joj7vnJ1dzYvBN1wsyefgmmjDMGbqC3LzR0nfEnx+K6VbJyREHgcnaEq04IN4MSyAr8YWdBZ8EI1x261RnLns7EUwB56CSevAG2EL3E3gfOwy6/yrlsE3MGzsTIpXKIf+TfBG9EWDxseeoMeeKMeNXydFHRStBRYuXxbGQLWaEN07IJp4rTon+pntxdEGrpvn/y72gG+0phNLKFV/iar5T6yhOgnuiI60DfBQ0rXdvPoHv/OXeGRe2fwAAAAASUVORK5CYII=>

[image63]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAXCAYAAACBMvbiAAACOUlEQVR4Xu2WP0hXURTHv1ENZhQimJrVzwYhRBIkIlBahagh2hpsE0JwEAwnAycHQRIc/EM0FSluQUGDQ5NBU5SDQzUYBS5RgorZ9+t59+d91/fzvp9IRPiFD/7euffce869550ncKj/QEdINakjJz37cVLpPWfJ+Qr93rfkfJVski2yTNZIgVSQKXLXTQ7UQCbJKszvJ/lOemBJlKVaMkd+kxZyNLHr7zvyivwglxO7LwX6iwySU4lNfr2wxCYSWy61ki+wBW8FY9IQ7KTekqpg7DSZITcCu6STHoX55tICbPIASt+xaucz0lekufKR73PPHsr5tocDWdJi70lNOOBJCyroS56tDXaSqqlrnj2UC+ZmOBCqERaMimwvacE7sNqQjpGnMN+Xnj1LqjHVWjSYblh2yrIcXSRfkS8R1aDmRa/pCbKLMqbbsA02EN/kEWzueViRjyc2tZCi1MzmYQHF9Aw7r6z0ALaBakFXWEqdsFahuvoEuwnJXfPZ5HnbMIt8wTwMnrVoLBiXrObp9f5GRrxxJZQqD913rAAL5Fxg09XoilaQfsN89cECeQ3rRSew00jVFh7DXqCitImOsMM3etIiL0Ij0lmXKuB1WMu4EA5QzbCT2tXXrpMl2MKLZJp8IG9IkzcvS1fIR9jGaojDsO+RbO4UfOkbNUbuISMQJznquNVLusiZ9PCecr4KRr2kHtkbyaZT1B5uPOs791fUD/uqKxhxH+UlfaBSF1Yp+MT+NzrUv6M/frZu6uG6HX8AAAAASUVORK5CYII=>

[image64]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAWCAYAAAA8VJfMAAABuUlEQVR4Xu2UyytFURTGP6E8yiNJSl6ZGCmSkgxkYqAQUcz8D8RUBspfoCQDE48ZMpBuMlAGhgyZGBBKGTDh+84+9559tnPOvZeJ5Kvf7e691llrP9bawL9+mQpJmTsZoypST2pIgT+n70OSUy9pdA1UMVkgR2SdHIbNIVWQFfJBnsg9uYFJPBO4Adu+QQH3yZBtpGbJFIIVl5KWwJzRAHkgr6Tcmm8gO+Q5PaEAF6TWHyvwC+lJO1BLpNoaS5POeIy8kzvS6dikY5jdewk2yGDIDKTII2n3x9rlRMZqFtpmjRVHAc9JpTVvq4Qc6I9Wr112hczAJkyQYX+cvtM9RN9pHYz/sjPvalE/qq5bxCedd+aVPGonfTD+067BUbd+dHw6xlyTxkknYp9MojpgiuanSVXt8lcxZVW+xxunVhh/784S5LViXCFtIY+VU0Uw/qpOVWmcvDuX8y6+PgYpmAZ3F5OkNyR/o1w6QU96G08Rrko1udv82aTKXoXZ8aVjUx+fkSZ78oqcwGxfvTaHiMc5Bym4nkLFu4bp6TWYRTQHbkZaZT9M0lHH9h0pudpnnIwgIuG//o4+AY6vUjqCTAYqAAAAAElFTkSuQmCC>

[image65]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACeUlEQVR4Xu2Uy6tPURTHl1CEvG5JlBIDEaHuRDFhoJDHQGHuD1CEoUwNRLdkgqS8Jp5l8isTpYiSEnVJJEkpZh7fz1l7nb1/+x7XwJXJ/da301p77bPX/q61ttk4/j1miRNrZ4UptWOsMFkcEp+Il8U5/cstZorbaicg+zXignqhAIcsFeeKE6o1cEB8Js4TD4svxe3m+wB7VoqPxUnJ14KsP4vnzAM29C83m7eIH8S34k/zA8q4AfME+AdYLPbEU+axb8T34lPxeYppgTQvxEXJ5kASWt1GuHRIvCTZu8Xv5nGDybdW/CoeSvZ08Yq4LNlgavL1lWK2+FDcWzqF1+Kw5dJgc/u4JdiZfJ/MD1olfhGPpPUZ5gqjCOBS98WFyW4x3/yArZUf3w9xY7JvmB9IzQPswcftUQFFH4gXzdVcIV4zVwTctN8042hJcAC3BYwbNyux3zxm2LJie8SP5iU6I+5LfnDaOpoRRDn4YYlovqhvDWp71zzmmOVJ4Uu/0IRHLU8FpRhRhhJ1Y2IzBRxQJxegIe+Yx44GkjporgJYbp7gLvMRPpH8DS6J31IAY/bKPInNZVACyV4Qp9ULHaAs0YwkxLiiPBXgLUHNPvCMxiNET0TXl+Dm9yzLTI3XWffLSOwty80Ype9Zbtaz6dvUN+Y/gCqoUzYScTQbMgb48XXrrneUIf4RQ9CznMTx9G0mgFHiEICE/CCaDWBTni5etZFdjwqbKh9KowzlYdLiMWvABha4JU5UCLkDMbJdPFnEgWjG8hIBSvPO/A2hOc+Xi+vNX80d5n3xN2Acb9fOBN4bEqTxH1meyDEHKv5pcihFrfY4/j9+AdiShAwS9YdTAAAAAElFTkSuQmCC>

[image66]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAAChklEQVR4Xu2Uy6tPURTHl7hF6CKRKJKJRx55zb1mJI8UJkb+AOU9uQPd2R2IFEqUlMdAIQPlREkpIjJAHokiKcVAeXw/d+11Htv55Q6uTO63Pp322nuftfZaa2+zIf17jRPDc2OmkblhsNQljomH4ryY0Jwu1S3W5cYQ0c1L3zYNE5PEFGs/6S7xREwW+8Rzsd48OMT++eKBGJFspUaLw+K7uCzeiiWNFWYzxB3xWNwWz8TC2vxE8wBOp/FMUYgj5sG8Ee/FI/E0rWnohrglpqUxm7ARHOL0OL8oRplnoVe8MA8OLRZfxZ40HiMuiNlpjNiL7Y9SsPmqNUtwSKysjQvxyZo/pCSvzU9PFhaIL2J/mh9r3hdkBC0yz2ActCEcxsZOIo04xHGIkxbmp+cgNNtdcda89vTWpbQOXbGWDCDSTdp3mDfVS/FNzKkvMnfUKYhfYm2ybRUfxTJxXGxPdnTUWpoRRUpvir3mtaZun81/FPqZ1v0tCDKwxbwJD1h1KyhFaxlQBJGXAxuOV6UxjgYSRC6C2m2eBTTXPMCN5le4DyP3mQ7fmRaFCvOfR6cPtBy5yGY0IwFxXe+J8ea+r7MoemKD7ylVWDOItsak+3FADy2t2UM0KrcumhHHBFBY1awn07f/doSzENeOILalMZu5flzDUJTylZhas4eiDNGMsb6wKgh894tGrD866If5T0ghmiXeiVPmzYadmlKm5WlNXWRhdWbjHSIzZI8sxmNWipIQZY84Iw5a1dmhFeKDOCdOmJdhs1WBhqIZczuiNByGN4TmxFcpriYPDunfVJ/IRA+tScSTnovreC03JuGHAMn8fTG9OT14IoOdAgxRijzTQ/r/+g1gJIZ2h9o0BgAAAABJRU5ErkJggg==>

[image67]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAaCAYAAADxNd/XAAACKklEQVR4Xu2XTyhnURTHj/yJMEPkTykzmqZkNpPYsLDCAknKhGxt2MxmdjZSJptJxMLGQhI7K7L4xcLShpQoJKKk1MxG/ny/3Xd7Z26/3yvl13vqfevT7/3Oub3fPfeec+79icSKlXYVgUqQ6TqirllwDy7BOXgE0+CDHhRF5YEpMAlKlL0N3IEj8EXZI6UKsC1mosnUB57ApuuIgtbBM/gDMhyfVRZYEzMucuKkmO9B6cHAlsSMzXV8oapczKRmJPXqUwUgIREMoEtMbre7Dkc14EoilkL5YAvsgELHp8Wd4Q5x8heOL1TZtCB8TiXWBmuEAYw7vlBlCzMhwQGwO3Hy+6DM8YWuX+AAlLoOJZ7EPB8alY2FzAaQrWwUF4WHoG4I1ha0SFoc574jUJwgT9lqZeP9px/8BV+VndoQ/6Su8j6ZZqegB/SCB9AC6sA3bww1IubEpxbBIVgFo2LOmgUxEye/wbI3NlAd4Ab8A/NgAhx7tgE1zor3oz0wDD57tp/gTMzlT4vv0g2iATR7zwyAh6NVLbgV8w4yBE6UP1Bc8XrwA3SDT5J6C5vArpi6IBzHySQLgHadOvyNTuUj2scdtwGQtNRcq/fJ/GeaMY1YS2yxNqWseIstVt+5+noHdAD2rEm7VsTPY64Si5m5fg0GPTtvsKyF7/J/DTBQuyNuAKyBOfHf/RGM+e63U46YlGPnStaF3G5D22u6EDscU+fd/ZGKFSvWK/QCV9pbW6unrRMAAAAASUVORK5CYII=>

[image68]: <data:image/png;base64,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>

[image69]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAaCAYAAAAqjnX1AAABtElEQVR4Xu2Vvy8EQRTH3wUJCSEhEqESjYrQKhUUdJJL0FDQaHRU/gTRSESjUpCIiFAKjehFK0JUqBQKP77fezPZ8Wyzt2dvi/0k39zOezu33515b1akoCCfNEI7CbSg07KlH/qEjiUy8gZ9Q9fQIrQFXbnYqU7LliVowMSeRQ1NB7Em6EjUcKYMQic2KNGKNQcxlsU+NB7EMoH1tWFibaIm1028FToQfbG6QxNfUocVS8IsdA/1mnhu6IJuoVWbyBOj0Ds0ZhN5gscRm4Yrmkt4xByKmiyZXLXwfzpFT4bU8DycEe3qD6jhd7rCHnQJtYs++AbaFn055u5EPwo8plZEa3uiMlPvL7trltSruyZzZvwH3yhcvTix0z00Qnl4jvLLxM8q49wFGvYwNwL1OO26OE0++JtAH/QYjFNhTU6JNhkfanPkCRqSyGSHi1uTLIWLYJwKa8SupDX5IvFfJ2uy5it5DrVIfE1akyyj5WA8734T12QSvJGSJOtWbrPfauJXks3aLfFNWjVxq1UNdrtrxppo/bFRNk0uCcPQmejJMWlyqQm3JM32cC7LhYTHVcG/8wPyjV+i/yNZqQAAAABJRU5ErkJggg==>

[image70]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAaCAYAAADovjFxAAACsUlEQVR4Xu1Xz4tOURh+5Ed+/8hEkgWhSKjJwlA2NhJJZOEPsPFjMUpRmtLUWNGklNQ0C5GUDRLKFxZ+LKSIBYWFWU1WFprC88x7Tt97z9y5ZvF93+J2nnq695zzvt93zvO+57znAhkZGRmTYyv5hPxOfiJPkNMKFsA5cpi85ii/2mAleYg8Rf4lf5Kb3LgE6SFPkr/I8+Recp6zqQ32k99gQvQVh8YxgzyadtYJC8h7sAxQJkiI4wULYCe5JOmrFTaQD2DRvg4T4WXBAjiWtGsHpflQeN9O/ib/NIfHxbnt2rWEoh/3+xzyISwbZoY+HZ7Pw3st0U0+RnG/L4Jthyuw6nCG7Hfj7cRG8iMsCPrfjkB7fTDthB2MP2CH5V1ytxtTeTzt2q2GDmplXkdEUJRvkAfTAWI1LBq3YBPSlohQ1lxy7VZjPtlAh0ToIp/CqkMZJIJ4n5zt+o+Qj1w7QjbLyOnpwH8gvxXhKUxFhPhfHjrD1D8LE2+9pdBEn8H2/lqUO90kx2B3BA9NruHa8r0cnsJy8m14T1NbT13KtGjZN2CLXki+gC0iiqD5CWednfx1cOsAFzT/NbCr/zrY/w0E20rEMhgjHaOdQnavYBnjkYqgSYy4dtxmKq1pVL0IEqss2tFHixdk8wVm/4G8CPMX9Vs7YGJ8hmW1hCgLakuRiqAKo+8KD31waTFVIsivSoQyHz0vhPcopLbBelggFVB94MXy3jZEEfYFSv1RN64MuBOeVQvSYRuj7VHl8wYTq9li8jAs+rvIr+Q2b9AOqKwqLQ+Qe2CLvYpmCq4i34d3lVPtVy1E47p7+DPhNbk02Gqf645SJUIv+Q7NQ1EiboZd+5UV8lVJ3xLG2wodrGkVqKoOSs94eityHlV+k0G/FYWQ31yYqL6KZWRkZGRMFf8AlKaBCMB8WtoAAAAASUVORK5CYII=>

[image71]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABMUlEQVR4XmNgGAVDETACsQoQM6NLYAEgtVIMmGq5gVgYTQwOQJq0gHgjED8AYkkUWeyAB4gPAPEXIN4AxLOA+AoQ/wJiP4QyBGBlgGgyBuKvQPyQgXiLtjFALADhSQwQ3xAE5FgE8glIH0lg0FtkBsTeQDwNiK0YMBMHBiDHop1AHIwklgDE/4G4mQGSwLACUi3CBmBmPAFiRTQ5OKCGRUpA/ByI/wGxC5ocHJBqUSEQvwXiNCQxkD6QflDw+SKJowBSLTrAADEQlCDYoGIwM34DsQ1UDAWAIs6DAaLgFRAboEqDAchQZJe6MkAsk4ApAII1QPyXAUfJAHI9zBBkfIABkrJgAFS83ABiNSgf5LgsBkjELwTiuUD8EYh9oHJUB6ACNBCIo4GYA01uFIyC4Q4AV6xFdhVMc5IAAAAASUVORK5CYII=>

[image72]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAWCAYAAAA2CDmeAAADTklEQVR4Xu2YS6hNURjHP6HI+03ohgzIYyCJmIgyYWCCSMoAU4WIkRQDJTERYWQiJaQkXRF5FIrIo5BHEUoMkMf/d7+13H3WOfeec48u+2j/6t85+1tr7332+tb32MesoKCg4L+gqzRUGiZ1DzY+e/2eUfDX6Cl9kt5IL6Sv0mDpoLQ4M68WxklXpPfSeSsc2mFGSTek8RlbX+mb9E6akLHXAuculH5Ke5OxzmKENCg1NiJLzRdueTogzlj9C0p0vZbGpgOdCCl3rnRduhmOG4ou0mFzh7CjU05Ji1JjjUyTmqXeif1vwHNNlF5Jq62BUiY/lByPQ46UDrWAM4akxgAPHQt/JdZIO1JjQrZ5qER/qz6nPUZL+83T7tZkLLdQH0gtOCWrE9lJgVhrbofvTdJD8/lEWoR0dc/K01U8/4k0JdgmSfettE7Nlz6E7zhjp/SgdbhuVprfm2ej8cgtFMTdVu6UNN2ck75IczI2diBziYjIbPOGoEfGBnet/PyZ5g4ZE467Scelq+F4srlz7oTjP4H6Qm2hxsQNkWtwwALzH8wiTy8dbrFR6ONCx5T32bxmRDaZz03BxmKz6KQ82mkibF1mDr+h2XzuPKmPefeUbo6OQEtPdBAZ1BbunUvaekhy7yMrLfT9rDwSSEmkO9LQgGCLO5wIycI45/Nu8jxom/m9srBY2600UndZfXUER1I7qCFEcq5hl69KjQEKKWkEJ0SIAOoC9SFC0WbBaJlxBA0Au/qHuVNmSFPDXNIiL5zUkbYYbn5NrodjaFtZUO5B1FWDc0hFZ81/fz1O/Gewu/dZ5fBdYeU7nKLbbKVRRWr7aL7oXA9nbTFfwPXSMXMHAc6t5BAWbbN5reBfAc7Nvt2T1nBwvE5b4Lxr0mVpVjhuKHjA79ISa3UKn7S6/IWyMdgi5OGn0shwPNB8oZ6Z7/61wR6jhnR32kqjLN4vgnOIJNIJjsEhdHAxqrjHBelAGG8PuqZc14dqsHAs/lvppXRUumXe0SyzyjuM/6folJj72DzlEUkXpUthDjud+kCXlL5sbjCPqJPSIfP70fnERWwy74JocRln7h5roBe7goLcQvqL3Vs18XKYTZ0FnQApllpWq9KX1oKCglzyC9UdrsOV9IsxAAAAAElFTkSuQmCC>

[image73]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAXCAYAAABgWeOzAAACvElEQVR4Xu2YTahNURTH/0KRr0QPRT4GisTAKxImPiKRMFAMpERJ3ggDA4miDKQMiIEkhRhIMdENRUYoKWVAPjLAiJTC/986u7PP6t7jvnNfOpf9q1/vvr3Ovb23ztrrrH2BRCKRGDBG0kl0qFv3vycqcIS+o7/oZ/qN7qPD6VQ6K78US+kT+oa+ooejWDMmw66Vj+ixYvjfR0k8Tl/TbXRMtj6aXqJ3YIkcm60LJf0Q/Qm7Kc+jmEc74CzsutN0E11WuKKIdtIOv9jNTKT3YAlQsj3j6GNY3LOT3qVv6QcXi9lIz9BPKO6GVgyC7ZQHdBEdXAx3FzdhybuC8n67AZYgz326kN5C85ugzzxBF9BTmVWYAtsB+ht007sKJeYLneMDDiW54RdhVawWcg7Nk6wKPghrOw26rhDtP0qwEq2EK/G1ZwIsMZfpEBfzqBK1fT2hMvejeZIvwBKjFqHkzCiGK6GWtp2+p9dhraW2bIYlpmp16caE966FfVZ8s/R6SfZ6Cyw+Ig93jPr0GvqQ9rpYbVAV6mFVtbrGI3+ILaY/6Kg8jBXIq6xVO+kEffZc+pKudLFaoBGpkanXZeyiu/0irEUE1Ho04s2H/fMaB5VkobWvsAmkU7QTQpuYjZq3CqHqaqA8yZqXb8MSFTMMNpkEwk1bDUvuSeStQ2OeqlgTSFXU1/UA/Qg7iXYN6skvYFXYCp329CT3D0ad3nRqi9FDri/7qbjQ+67BkhxXfrtMp+dhp8S9GNie/lfogf3zW30gQtUXTn8xq+gNt3aUfkfxQaq+rZOg+rX6druEfvuMrkf5DF97ZiI/zWle1tFXs6+25Z7oukA4QgcvIj+NLYcdtYW299PouuC8LP7foaqZBqsYfaegiaGrj7GJRG3QtHIV+Vejf/KAvS3RH9TC1Nc1rrVj2RiaSCQq8xsioIcsXFjWJAAAAABJRU5ErkJggg==>

[image74]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAXCAYAAABgWeOzAAACpklEQVR4Xu2YTYhOURjH/0KR70yGUoMFKbGwIBkbH5FIWCgWsqEkVmZjMWkUZSFlQSQkJbGQGhZ6Y0GyYCErC/KRBVakFP7/nnu65z7decd7Z+K+4/zq19z3PPd9553nnPuc5wyQSCQSw8ZEOouOdeP+daICffQd/UU/02/0MB1Pu+jC/Fasos/oG/qKHo1iZcyG3Ssf0+PF8MhHSTxBX9PddEo2PplepXdhiZyWjQslvZf+hE3Kiyjm0RNwDnbfGbqdri7cMcKZSR/AEqBke6bTJ7C4Zy+9T9/SDy4Ws42epZ9QfBr+C27DkncdzevtVliCPA/pcnoH5ZOgzzxJl9HTmcPFKLqYvqTrXKxWKDFf6CIfcCjJDT8IW8UqIedRnmSt4COwstOgmwvRaoymG+lT+ih7XVs6YYm5Rse4mEcrURudJ6zMHpQn+RKs3KhE6EmYVwy3zAT6nl6mC1ysluyAJabq6tLEhPdugn1WPFm67s6ud8LiSlIVNFHamD/CWsu2QatQm1XV1dWBfBNbSX/QSXkYa2F1UwxUTgZjLr0IewoOovok/RN02Ghk6roZ++h+PwgrEQGVHrV4S2GJ1apTkoXGvsI6kD9lKr0He1JqXXMHQ6urgeZJVr/cD0tUzDhYZxIIk7YBltxTyEuH2jytYnUgrXITVoP3oLy9rD2qyWp/tAoHQqc9HR78xqjTm05tMdrkDmU/FRd63w1YkuOV3wqqwfoOKhnqVNqKGbA/fpcPRGj1hdNfzHp6y40do99R3EhVt3USVL1W3R4KagM16RdgtbptmI/8NKd+WUdf9b7axQ9E9wXCETp4BXnNXAM7agt1A8+j+4JLsvhQ0e9cAeuT1TPXvm5ro5pDt8D+p6COofZfOkLlqdcPJhKJRCKR+Iv8BiLufSzlYOl3AAAAAElFTkSuQmCC>

[image75]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAWCAYAAAA2CDmeAAADOElEQVR4Xu2YS6iNURTHl1Dk/SZ080rkMZCkmIgyYWCCSMoAI6UQMZJiQBITEUYmUsJE0pUij0IRedQlEkKJAfL4/+7a2/3OPufee+4l91ztX/0751t7f4+z116P75hlMpnMf0FXaag0TOoebHz2+j0j88/oKX2S3kgvpK/SYOmItKQwrxrGSVel99JFyw5tM6Okm9KEgq2v9E16J00q2KuBcxdJP6UDyVimFZaZL9yKdECct/YvKNH1ShqbDtQA46W61FgLdJGOmTuEHZ1yVlqcGqtkhlQv9U7sHck86XrQtGSsJiC3k+NxyPHSoUZwxpDUGMCZsfBXYq20KzUmFJuHSvS31udUA/VxlXRammz+7DUL9YHUglOK4uFTYq25E74T9o/M5xNpEdLVfStPV/H8p9a0Q6dID6y0Ti2QPoTvOGO39LBpuCrGSK+lzeY1rVMxQtpr5U5J080F6Ys0t2A7ZD6XiIjMMW8IehRscM/Kz59t7hAWELpJp6Rr4XiquXPuhuOWYOfjaJ6zwf48sjocHLBQumG+yDNLhxttFPq40DHlfTavGZEt5nNTsLHYLDqLRztNhK0vzOEZ6s3nzpf6SIOCvSV4h7pl/uzUCo47Hc39yNHSYyst9P2sPBJISaQ70tCAYIs7nAgpwjjn827yPGiH+b2K4KidVhqpe6z13c67D89BxNV0jWgOdvnq1BigkJJGcEKECKAuUB8iFG0WjJYZR9AAsKt/mDtlljQ9zCUt8sJJHWmO4ebX5HosKrt8u/k9iLpqmWheA9dYJ3opZXcftMq7aaWV73CKbr2VRhXp4aP5onM9nLXNfAE3SifNHQQ4t5JD2PlbzWsF/wpwbvHtnrSGg+N12sI+88JOhJH2ahp+4HdpqTU5hU9aXf5CoTspQuvYII0MxwPNF+qZ+e5fF+wxakh356w0yuL9IjiHSKIxwDE4hA4uRhX3uCQdDuPtAcduME+RsXGoSVg4Fv+t9FI6Id0272iWW+WiyP9TdErMfWKe8oiky9KVMIedzo+nS0pfNjeZR9QZ6aj5/SjAcUPUmRdmWlzGmbvf/k7awaGkXDowUmmlzJDJZDKZTCbTfn4B+L+jIx/7lx0AAAAASUVORK5CYII=>

[image76]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAaCAYAAABGiCfwAAAB7UlEQVR4Xu2UzytFURDHRyhC8iNSSomF2EiUhR0LCz9iYcEfYE2RrC3JRiISZUNkQVkoykJRZCEbFqQsFDux4vu9c897c+99vSsbpfetT72Zc+6bOXNmjkhGf6BFcA32wRYoDS57KgYHoDe8YJUFykAVqADZwWVPN6BSdO8UuAO5Zp3+K9Gkcow/oktwAVbBA3iXYMBysG7sWnAiGvAJPIJncAuqk9ui4mK/sXnCczBqfC1g0tiFYNvYVL7ElI/qAW+gyfh4iiNQ4Nupgu0ZmxqXmPJRrHWdsZnhIZg1Pl78puheiont+L8ZmE0Te6pU6gCfoCbkfwFtosksgxHfzxMtyA9O5cQ2HhT9kw+wG1z2NCTaCK9gWrQTm8GpxDRFWAzWB4ZFS8h5ciVLp/BM8Tve/4ok7zutmDGHdkLSB+SaLV+jaHU4MpzDOX9PQBxkzpEVu+8LjIX8Tu6lcCoRnVM2ixNP12lsb6Z4dH6YZ/ytosFsuzsxW56ap3JiwnwMbLAZ0bFKiM/PvUSDDYh2ZLvxObEjj0WfNSf3PzbYGug2tpflPKg3Pndn7Ez79lGufF0hPxOlv8i33QvTkNjhi3/ADloSvaMz0RJynqxc+VJevGhXuleIjbIh0WR/LH4Y1848EUv66yAZZfTP9A0ikk33QMlIDAAAAABJRU5ErkJggg==>