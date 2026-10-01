window.NOTES_PART4 = {
  "Mathematics": {
    tagline: "Numbers, algebra, geometry, measurement, trigonometry, statistics and probability.",
    strands: [
      { name: "Numbers and Operations", notes: ["Work with indices, standard form, ratios and proportional reasoning.", "Select efficient operations and check answers using estimation."] },
      { name: "Algebra", notes: ["Simplify expressions, factorise, solve equations and interpret relationships.", "Use algebraic models to represent patterns and real-life situations."] },
      { name: "Geometry and Measurement", notes: ["Apply properties of shapes, angles, transformations, area and volume.", "Use accurate constructions and appropriate units in measurement problems."] },
      { name: "Statistics and Probability", notes: ["Collect, represent and interpret data using suitable statistical measures.", "Describe chance experiments and calculate simple probabilities."] }
    ],
    terms: ["Index", "Factorisation", "Discriminant", "Gradient", "Mean", "Probability"],
    questions: ["Simplify (2x² − 8) ÷ (x² + x − 6).", "Solve a quadratic equation and verify the roots.", "Find the area of a composite figure from its labelled dimensions.", "Calculate and interpret the probability of an event."],
    worked: [["Factorise the numerator and denominator.", "Cancel the common factor, stating any restrictions on x."]]
  }
};

window.NOTES_PART4.Physics = {
  tagline: "Measurement, mechanics, thermal physics, optics, electricity and radioactivity.",
  strands: [
    { name: "Measurements and Mechanics", notes: ["Use SI units, significant figures and appropriate measuring instruments.", "Analyse motion using displacement, velocity, acceleration and the equations of uniformly accelerated motion."] },
    { name: "Electricity and Electromagnetism", notes: ["Explain current, potential difference, resistance, circuits and electrical power.", "Relate electromagnetic induction and transformer action to changing magnetic flux."] },
    { name: "Thermal Physics", notes: ["Distinguish temperature, heat capacity, specific latent heat and changes of state.", "Calculate energy transfers using Q = mcΔθ and Q = mL."] },
    { name: "Optics", notes: ["Investigate image formation by lenses and use the lens formula.", "Relate focal length, object distance and image distance to practical optical instruments."] },
    { name: "Radioactivity", notes: ["Describe half-life and radioactive decay using exponential models.", "Apply radiation knowledge to safety, medicine, industry and environmental monitoring."] }
  ],
  terms: ["Acceleration", "Mutual induction", "Latent heat", "Focal length", "Half-life", "Magnetic flux"],
  questions: [
    "A vehicle accelerates uniformly from 10 m/s to 30 m/s in 8 s. Find its acceleration and distance travelled.",
    "Explain why a transformer requires alternating current rather than steady direct current.",
    "Calculate the heat required to melt 0.5 kg of ice at 0 °C and warm the resulting water to 40 °C. Take Lf = 334,000 J/kg and c = 4,200 J/kg°C.",
    "Describe an experiment for determining the focal length of a converging lens using a metre rule, object and screen.",
    "A radioactive sample has a half-life of 6 hours. What fraction remains undecayed after 24 hours?"
  ],
  worked: [
    ["Use a = (v − u) ÷ t with u = 10 m/s, v = 30 m/s and t = 8 s.", "a = (30 − 10) ÷ 8 = 2.5 m/s².", "For distance use s = ((u + v) ÷ 2) × t = ((10 + 30) ÷ 2) × 8.", "s = 20 × 8 = 160 m. (Checking with s = ut + ½at² gives 80 + 80 = 160 m.)"],
    ["A transformer works by mutual induction: the primary coil must produce a changing magnetic flux in the core.", "Alternating current continuously changes in magnitude and direction, so the flux linking the secondary keeps changing.", "By Faraday's law the induced e.m.f. depends on the rate of change of flux, so a changing flux induces a voltage in the secondary.", "Steady d.c. gives a constant flux, so after the initial switch-on there is no rate of change and no induced e.m.f.; only at make and break is a momentary voltage induced.", "A d.c. supply would also overheat the primary because only its low resistance, not inductive reactance, limits the current."],
    ["The process has two stages: melting the ice at 0 °C, then warming the water from 0 °C to 40 °C.", "Latent heat of fusion: Q₁ = mL_f = 0.5 × 334,000 = 167,000 J.", "Sensible heat: Q₂ = mcΔθ = 0.5 × 4,200 × 40 = 84,000 J.", "Total heat Q = Q₁ + Q₂ = 167,000 + 84,000 = 251,000 J = 251 kJ."],
    ["Mount the lens in a holder between an illuminated object (cross-wires) and a white screen on a metre rule.", "Set the object distance u (say 15 cm) and move the screen until a sharp inverted image forms; record the image distance v.", "Repeat for at least five values of u, each time recording u and v in a table.", "Compute 1/u and 1/v and plot 1/v against 1/u; the graph is a straight line with intercepts 1/f on both axes.", "Focal length f = 1 ÷ intercept. As a quick check, the distant-object method gives f directly as the image distance for parallel rays."],
    ["Number of half-lives n = total time ÷ half-life = 24 ÷ 6 = 4.", "After each half-life the remaining fraction halves: 1 → ½ → ¼ → ⅛ → 1/16.", "Using the formula, remaining fraction = (½)ⁿ = (½)⁴ = 1/16.", "So 1/16 (6.25%) of the sample remains undecayed after 24 hours."]
  ]
};

window.NOTES_PART4.Chemistry = {
  tagline: "Chemical quantities, structure, energetics, electrochemistry and industrial processes.",
  strands: [
    { name: "Chemical Quantities", notes: ["Use the mole, balanced equations, concentration and molar mass to solve quantitative problems.", "Convert between mass, amount, volume and concentration using appropriate units."] },
    { name: "Structure and Bonding", notes: ["Relate ionic, covalent and metallic bonding to structure and properties.", "Compare allotropes such as diamond and graphite using bonding and electron mobility."] },
    { name: "Energetics and Rates", notes: ["Interpret energy profile diagrams, activation energy and enthalpy changes.", "Explain how collision frequency and activation energy affect reaction rate."] },
    { name: "Electrochemistry", notes: ["Predict products at electrodes using the electrochemical series.", "Apply electrolysis to electroplating, extraction and purification of metals."] },
    { name: "Metals and Industrial Chemistry", notes: ["Describe extraction of iron and the role of the blast furnace materials.", "Evaluate industrial processes in terms of products, waste, energy and sustainability."] }
  ],
  terms: ["Mole", "Allotrope", "Activation energy", "Electrolysis", "Cathode", "Blast furnace"],
  questions: [
    "Calculate the mass of sodium chloride formed when 25 cm³ of 2 mol/dm³ hydrochloric acid is neutralised by sodium hydroxide.",
    "Explain why graphite conducts electricity and is soft while diamond is an electrical insulator and very hard.",
    "Describe and label the energy profile for an exothermic reaction, including activation energy and ΔH.",
    "Explain the electrode reactions and observations when aqueous copper(II) sulfate is electrolysed using copper electrodes.",
    "Describe the extraction of iron in the blast furnace, including the functions of coke, limestone and hot air."
  ],
  worked: [
    ["Write the equation: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l), a 1 : 1 : 1 ratio.", "Moles of HCl = concentration × volume in dm³ = 2 × (25 ÷ 1,000) = 0.05 mol.", "From the mole ratio, moles of NaCl formed = 0.05 mol.", "Molar mass of NaCl = 23 + 35.5 = 58.5 g/mol.", "Mass = moles × molar mass = 0.05 × 58.5 = 2.925 g ≈ 2.93 g."],
    ["Both are giant covalent (allotropes of carbon), so the difference lies in their structures, not their bonding type.", "In diamond each carbon forms four single covalent bonds in a rigid tetrahedral lattice, so all four outer electrons are localised in bonds.", "In graphite each carbon bonds to only three others in flat hexagonal layers, leaving one delocalised electron per atom.", "These delocalised electrons move freely along the layers, so graphite conducts electricity, while diamond has no mobile charge carriers and acts as an insulator.", "The weak van der Waals forces between graphite layers also make it soft and a good lubricant, unlike hard diamond."],
    ["Draw the energy axis vertically (enthalpy) against reaction progress horizontally.", "Place the reactants line higher than the products line, because an exothermic reaction releases heat to the surroundings.", "Draw the curve rising from the reactants to a peak (the transition state) and then falling to the products.", "Activation energy Ea is the vertical distance from the reactants level to the peak; it is the minimum energy colliding particles need.", "ΔH is the vertical distance from reactants to products, measured downwards, so ΔH is negative (for example ΔH = −92 kJ/mol)."],
    ["Electrolyte: CuSO₄(aq) contains Cu²⁺, SO₄²⁻, H⁺ and OH⁻ ions; both electrodes are copper, so they take part in the reaction.", "At the cathode Cu²⁺ is discharged in preference to H⁺ because copper is lower in the electrochemical series: Cu²⁺(aq) + 2e⁻ → Cu(s).", "At the anode the copper electrode dissolves instead of OH⁻ being discharged: Cu(s) → Cu²⁺(aq) + 2e⁻.", "The cathode therefore gains mass while the anode loses an equal mass, and the blue colour of the solution stays unchanged because the Cu²⁺ concentration is constant.", "This is the principle of electroplating and of refining copper to high purity."],
    ["Raw materials are charged at the top: haematite (Fe₂O₃), coke, limestone (CaCO₃), with hot air blasted in at the bottom.", "Coke burns in the blast of air, releasing heat: C(s) + O₂(g) → CO₂(g).", "Carbon dioxide is reduced by more coke to the reducing agent carbon monoxide: CO₂(g) + C(s) → 2CO(g).", "Carbon monoxide reduces the ore to molten iron: Fe₂O₃(s) + 3CO(g) → 2Fe(l) + 3CO₂(g).", "Limestone decomposes, CaCO₃(s) → CaO(s) + CO₂(g), and the lime removes silica as slag: CaO(s) + SiO₂(s) → CaSiO₃(l).", "Molten iron (pig iron, about 96% Fe) is tapped from the base with the less dense slag floating above it; waste gases leave at the top."]
  ]
};

window.NOTES_PART4["Business Studies"] = {
  tagline: "Accounting, markets, company law, marketing and enterprise decision-making.",
  strands: [
    { name: "Accounting Fundamentals", notes: ["Apply the rules of double entry to record capital, purchases, sales and liabilities.", "Use the accounting equation to check that books balance."] },
    { name: "Financial Performance", notes: ["Calculate cost of sales, gross profit, stock turnover and gross profit margin.", "Interpret profitability and efficiency ratios for business decisions."] },
    { name: "Markets and Government", notes: ["Explain demand, supply, equilibrium, subsidies and market intervention.", "Evaluate how policy decisions affect consumers, producers and public finance."] },
    { name: "Forms of Business Organisation", notes: ["Compare private and public companies in ownership, capital, liability and control.", "Explain incorporation, transfer of shares, accounts and commencement of business."] },
    { name: "Marketing", notes: ["Develop a marketing plan using product, price, place and promotion.", "Identify target markets, competition, distribution channels and customer feedback methods."] }
  ],
  terms: ["Double entry", "Gross profit", "Subsidy", "Private company", "Marketing mix", "Target market"],
  questions: [
    "Record these transactions using double entry: capital introduced KSh 100,000, stock bought on credit KSh 40,000 and cash sales KSh 25,000.",
    "Calculate cost of sales, gross profit, stock turnover and gross profit margin from opening stock KSh 60,000, purchases KSh 300,000, closing stock KSh 40,000 and sales KSh 500,000.",
    "Explain how a government subsidy to maize millers affects supply, equilibrium price, quantity and stakeholders.",
    "Distinguish between a private company and a public company in membership, transfer of shares, raising capital, accounts and commencement of business.",
    "Prepare a marketing plan for a small poultry enterprise selling broilers and eggs."
  ],
  worked: [
    ["Transaction 1 — capital introduced: debit Cash 100,000 and credit Capital 100,000 (the business receives cash; the owner is the giver).", "Transaction 2 — stock on credit: debit Purchases 40,000 and credit Creditor (supplier) 40,000.", "Transaction 3 — cash sale: debit Cash 25,000 and credit Sales 25,000.", "Posting to the ledger: the cash account shows debits of 100,000 and 25,000, giving a balance of 125,000; purchases 40,000 debit; capital 100,000, creditor 40,000 and sales 25,000 on the credit side.", "Check the accounting equation: assets (cash 125,000 + stock 40,000 = 165,000) = capital 100,000 + liabilities 40,000 + sales revenue 25,000, so the books balance."],
    ["Cost of sales = opening stock + purchases − closing stock = 60,000 + 300,000 − 40,000 = KSh 320,000.", "Gross profit = sales − cost of sales = 500,000 − 320,000 = KSh 180,000.", "Average stock = (opening stock + closing stock) ÷ 2 = (60,000 + 40,000) ÷ 2 = KSh 50,000.", "Rate of stock turnover = cost of sales ÷ average stock = 320,000 ÷ 50,000 = 6.4 times a year.", "Interpretation: stock is replaced about every 57 days (365 ÷ 6.4), and the gross profit margin is 180,000 ÷ 500,000 × 100 = 36%."],
    ["Draw the normal demand curve DD and supply curve SS intersecting at equilibrium price P₁ and quantity Q₁.", "A subsidy lowers the cost of production, so the supply curve shifts downward and to the right, to S₁S₁.", "The new intersection gives a lower equilibrium price P₂ and a higher equilibrium quantity Q₂; demand itself does not shift.", "The fall in price is usually smaller than the subsidy per unit, because the benefit is shared between consumers (lower price) and producers (higher revenue per unit).", "Effects: maize flour becomes more affordable, consumption rises, millers' output expands, but the government carries the cost and the market may be distorted if the subsidy is withdrawn abruptly."],
    ["Membership: a private company has 1 to 50 members, while a public company has a minimum of 7 with no upper limit.", "Transfer of shares: shares in a private company are transferred only with the consent of other members, whereas public company shares are freely transferable on the securities exchange.", "Raising capital: a private company cannot invite the public to buy shares; a public company issues a prospectus and sells shares to the public.", "Publication of accounts: a public company must publish audited accounts and file them for public inspection; a private company's accounts are not published.", "Commencement of business: a private company may begin trading on receiving the certificate of incorporation, while a public company must also obtain a certificate of trading.", "A private company may restrict directorship to family members, so control stays closely held, unlike a public company run by a board answerable to many shareholders."],
    ["State the marketing objective, for example to sell 300 broilers and 2,000 eggs a month within the first year.", "Describe the target market: households, kiosks, hotels, schools and event caterers within a named estate or market centre.", "Product: live and dressed broilers plus table eggs, graded and packed in labelled trays, with hygiene and freshness as the selling point.", "Price: base the price on cost per bird plus a mark-up, compare with competitors' prices, and offer a discount for bulk buyers such as hotels.", "Place (distribution): sell directly at the farm gate, supply kiosks and butcheries weekly, and deliver bulk orders by motorcycle.", "Promotion: WhatsApp and Facebook posts, posters at the market, introductory offers, referral discounts and sponsoring a local event.", "Competition and strategy: name the main competitors, state your advantage (reliable supply, cleaner handling, credit-free pricing), and note how you will collect customer feedback."]
  ]
};
