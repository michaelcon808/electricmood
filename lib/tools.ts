// Tool registry: page copy, formula, assumptions, FAQ and recommendations for each /tools/[tool] page.
// The calculator UI for each slug lives in components/tools/ (see components/tools/registry.ts).

export type ToolInfo = {
  slug: string;
  name: string;
  icon: string;
  /** One line for cards. */
  short: string;
  /** <title> and meta description. */
  title: string;
  description: string;
  intro: string;
  /** Lines shown in the "How it's calculated" box. */
  formula: string[];
  assumptions: string[];
  explainer: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
  /** Post slugs for the recommended-products box. Posts that aren't published yet are skipped. */
  recommendedPosts: string[];
};

export const TOOLS: ToolInfo[] = [
  {
    slug: 'range-calculator',
    name: 'E-bike & e-scooter range calculator',
    icon: '🔋',
    short: 'Estimate real-world range from battery size, rider weight, speed, terrain and temperature.',
    title: 'E-Bike & E-Scooter Range Calculator',
    description:
      'Free e-bike and e-scooter range calculator: estimate real-world range from battery Wh, rider weight, speed, terrain, assist level and temperature.',
    intro:
      'Advertised ranges assume a light rider on flat ground at low speed. Enter your own numbers to get a realistic estimate.',
    formula: [
      'Battery energy (Wh) = Volts × Amp-hours',
      'Usable energy = Wh × 0.90 × temperature factor',
      'Consumption (Wh/km) = base × weight factor × speed factor × terrain × assist',
      'Range (km) = Usable energy ÷ Consumption',
    ],
    assumptions: [
      'Base consumption: 13 Wh/km (e-scooter) and 9 Wh/km (e-bike, normal assist) for a 75 kg rider on flat ground at 20 km/h and 20 °C.',
      'Weight factor = 0.4 + 0.6 × (rider + vehicle) ÷ (75 kg + vehicle). Vehicle weight: 15 kg scooter, 24 kg e-bike.',
      'Speed factor = 0.5 + 0.5 × (speed ÷ 20)², because air drag grows with the square of speed.',
      'Terrain: flat ×1.0, rolling ×1.2, hilly ×1.45. Assist (e-bike): eco ×0.65, normal ×1.0, high ×1.5.',
      'Temperature: about 1.2% less usable energy per °C below 20 °C (minimum 60%).',
      '10% of capacity is held back by the battery management system. The ±15% band covers wind, tyre pressure and stop-start riding.',
    ],
    explainer: [
      {
        heading: 'Why real range is lower than the spec sheet',
        body: 'Manufacturers test with light riders at low, steady speeds in mild weather. Heavier riders, higher speeds, hills, cold and stop-start traffic all raise energy use per kilometre.',
      },
      {
        heading: 'Speed matters most',
        body: 'Air resistance rises with the square of speed. Riding at 25 km/h instead of 20 km/h can cut range by around 20%.',
      },
    ],
    faqs: [
      {
        question: 'How accurate is this range calculator?',
        answer: 'It gives an estimate, usually within ±15–20% for typical riding. Use your own ride logs to fine-tune expectations.',
      },
      {
        question: 'Where do I find my battery voltage and amp-hours?',
        answer: 'They are printed on the battery label or listed in the spec sheet, e.g. "36V 10Ah" or "48V 14Ah". Some brands list watt-hours directly.',
      },
      {
        question: 'Does cold weather really reduce range?',
        answer: 'Yes. Lithium-ion batteries deliver noticeably less energy below about 10 °C. Storing the battery indoors and charging it warm helps.',
      },
    ],
    recommendedPosts: ['best-electric-scooters-for-adults-reviews', 'how-fast-can-an-electric-bike-or-ebike-go'],
  },
  {
    slug: 'charging-time-calculator',
    name: 'Charging time & cost calculator',
    icon: '⚡',
    short: 'Work out how long a charge takes and what it costs per charge, per month and per year.',
    title: 'E-Bike & E-Scooter Charging Time and Cost Calculator',
    description:
      'Calculate how long your e-bike or e-scooter takes to charge and how much each charge costs, from battery size, charger amps and your electricity price.',
    intro: 'Enter your battery and charger details plus your electricity price to estimate charging time and cost.',
    formula: [
      'Battery energy (Wh) = Volts × Amp-hours',
      'Charger power (W) = Volts × Charger amps',
      'Time = (energy up to 80%) ÷ power + (energy above 80%) ÷ (power × 0.5)',
      'Cost = energy added ÷ charging efficiency ÷ 1000 × price per kWh',
      'Monthly cost = cost per charge × charges per week × 52 ÷ 12',
    ],
    assumptions: [
      'Charging runs at full power up to 80%, then tapers; the last 20% is modelled at half power on average.',
      'Charging efficiency (wall to battery) defaults to 85% to cover charger and battery losses.',
      'Charger power is estimated from the battery’s nominal voltage; real chargers vary slightly.',
    ],
    explainer: [
      {
        heading: 'Why the last 20% is slow',
        body: 'Lithium-ion chargers switch from constant current to constant voltage near full charge, so the current tapers off to protect the cells.',
      },
      {
        heading: 'Charging is cheap',
        body: 'Even a large e-bike battery stores less than 1 kWh, so a full charge usually costs less than a coffee, often just a few cents.',
      },
    ],
    faqs: [
      {
        question: 'Is it bad to charge to 100% every time?',
        answer: 'Regularly stopping around 80–90% and avoiding storage at 100% can extend battery life. Charge to 100% when you need the full range.',
      },
      {
        question: 'Can I use a faster charger?',
        answer: 'Only one the manufacturer approves for your battery. Higher current generates more heat and can shorten battery life or be unsafe.',
      },
    ],
    recommendedPosts: ['best-electric-scooters-for-adults-reviews'],
  },
  {
    slug: 'power-station-calculator',
    name: 'Power station size calculator',
    icon: '🏕️',
    short: 'Size a portable power station for camping, outages or charging your e-bike off-grid.',
    title: 'Portable Power Station Size Calculator',
    description:
      'Find the right portable power station capacity (Wh), inverter output and solar panel size for camping, power cuts or charging an e-bike off-grid.',
    intro: 'List the devices you want to run, how long each runs per day and for how many days. We’ll suggest a capacity, inverter size and solar input.',
    formula: [
      'Daily load (Wh) = Σ watts × hours × quantity',
      'Battery energy needed per day = AC load ÷ inverter efficiency + DC load ÷ 0.95',
      'Required capacity (Wh) = daily battery energy × days ÷ usable fraction',
      'Inverter (W) ≥ total running watts × 1.25',
      'Solar (W) ≈ daily battery energy ÷ (peak sun hours × 0.75)',
    ],
    assumptions: [
      'Inverter efficiency defaults to 85% for AC devices; USB/12 V devices are assumed 95% efficient.',
      'Usable capacity defaults to 90% of the rated Wh.',
      'Assumes all devices could run at the same time when sizing the inverter, with a 25% margin. Motors and compressors can surge 2–3× on start-up, so check surge ratings.',
      'Solar estimate assumes panels deliver about 75% of their rating in real conditions.',
      'For fridges, use average watts (or watts × duty cycle), not the peak rating.',
    ],
    explainer: [
      {
        heading: 'Capacity vs output',
        body: 'Capacity (Wh) decides how long things run; inverter output (W) decides what you can run at once. You need enough of both.',
      },
      {
        heading: 'Charging an e-bike from a power station',
        body: 'An e-bike charger typically draws 80–200 W. A 672 Wh battery needs roughly 800 Wh from the station once inverter losses are included.',
      },
    ],
    faqs: [
      {
        question: 'Can a power station charge my e-bike?',
        answer: 'Yes, if its AC output exceeds your charger’s wattage. Budget about 1.2× your e-bike battery’s Wh in station capacity per full charge.',
      },
      {
        question: 'What does LiFePO4 mean?',
        answer: 'Lithium iron phosphate, a battery chemistry common in power stations. It is heavier than NMC but lasts thousands of cycles and is very stable.',
      },
    ],
    recommendedPosts: [],
  },
  {
    slug: "ride-finder",
    name: "Which electric ride is right for me?",
    icon: "🧭",
    short: "Answer 8 quick questions and get a scooter, e-bike or e-skateboard suggestion with matching reviews.",
    title: "Which Electric Ride Is Right for Me? Scooter vs E-Bike vs E-Skateboard Finder",
    description: "Not sure whether to buy an electric scooter, e-bike or electric skateboard? Answer 8 quick questions and get a suggestion plus the reviews that match.",
    intro: "Tell us who is riding, how far, where and on what budget. We weigh the trade-offs and point you to the reviews that fit.",
    formula: [
      "Each answer adds points to the rides it suits (e.g. long trips → e-bike, stairs or transit → scooter or e-board)",
      "Highest score = suggestion; second highest = runner-up",
      "Reviews are picked to match your answers (budget, rain, hills, campus, carrying)"
    ],
    assumptions: [
      "Scores reflect general strengths: e-bikes for distance, hills, comfort and exercise; scooters for low cost, portability and easy learning; e-skateboards for short, smooth trips and portability.",
      "Rain counts against e-skateboards, which grip poorly on wet ground and rarely have a water rating.",
      "Children are steered to scooters with kid-specific reviews; e-skateboards are not suggested for them.",
      "It is a starting point, not a verdict. Local laws, storage and how far you can carry it matter too."
    ],
    explainer: [
      {
        heading: "Scooter, e-bike or e-skateboard?",
        body: "E-bikes cover the most ground and climb best, and you can pedal. Scooters are cheaper, lighter and fold. E-skateboards are the most portable and the most fun, but they need practice and dry roads."
      },
      {
        heading: "What to check before you buy",
        body: "Look at real-world range (not the claim), weight if you carry it, the water rating if you ride in rain, brakes, and the maker’s maximum rider weight."
      }
    ],
    faqs: [
      {
        question: "Is an e-bike or an electric scooter better for commuting?",
        answer: "For trips over about 5 miles, hills or carrying a bag, an e-bike is usually better. For short trips mixed with a train or bus, a folding scooter is easier to carry and store."
      },
      {
        question: "Are electric skateboards good for beginners?",
        answer: "They can be, with a forgiving board and low speed modes, but they take more practice than a scooter. Always wear a helmet."
      },
      {
        question: "Which is cheapest to run?",
        answer: "All three cost only cents per charge. Scooters and e-boards are usually cheaper to buy; e-bikes cost more but last longer and carry more."
      }
    ],
    recommendedPosts: [
      "best-electric-scooters-for-adults-reviews",
      "best-electric-bikes-and-ebikes-for-adults-reviews",
      "best-electric-skateboards-reviews"
    ]
  },
  {
    slug: "airline-battery-checker",
    name: "Airline battery checker",
    icon: "✈️",
    short: "Can you fly with it? Check an e-skateboard, scooter or spare battery against the 100 Wh and 160 Wh limits.",
    title: "Airline Lithium Battery Checker (Wh): Can I Fly With My Battery?",
    description: "Check whether a lithium-ion battery can fly: convert volts and amp-hours to watt-hours and compare with the 100 Wh and 160 Wh airline limits.",
    intro: "Airlines judge lithium batteries by watt-hours. Enter the battery’s voltage and amp-hours (or Wh) to see which rule applies.",
    formula: [
      "Watt-hours (Wh) = Volts × Amp-hours",
      "Up to 100 Wh: carry-on, no approval needed",
      "Over 100 Wh up to 160 Wh: carry-on with airline approval, max 2 spares",
      "Over 160 Wh: not allowed on passenger aircraft"
    ],
    assumptions: [
      "Limits follow the FAA and IATA rules for lithium-ion batteries carried by passengers.",
      "Spare (uninstalled) lithium batteries must be in carry-on baggage, never checked.",
      "Airlines can be stricter: many ban e-skateboards, e-scooters, hoverboards and e-bikes outright, whatever the battery size.",
      "To convert mAh to Ah, divide by 1,000."
    ],
    explainer: [
      {
        heading: "Why most electric skateboards can’t fly",
        body: "Most e-skateboard batteries are 150–400 Wh or more, and many airlines ban the boards themselves. Only small packs under 160 Wh, with airline approval, have a chance."
      },
      {
        heading: "Where to find the numbers",
        body: "The label on the battery shows voltage (V) and capacity (Ah or mAh), and often watt-hours (Wh). If there is no label, don’t fly with it."
      }
    ],
    faqs: [
      {
        question: "Can I take an electric skateboard on a plane?",
        answer: "Usually not. Most boards have batteries over 160 Wh, and many airlines ban them. A board with a removable battery under 160 Wh may be allowed with airline approval."
      },
      {
        question: "What is the 160 Wh limit?",
        answer: "Lithium-ion batteries over 160 Wh are forbidden on passenger flights. Between 100 and 160 Wh you need airline approval and can carry at most two spares."
      },
      {
        question: "How do I convert mAh to Wh?",
        answer: "Wh = (mAh ÷ 1,000) × volts. For example, 4,400 mAh at 36 V is 158.4 Wh."
      }
    ],
    recommendedPosts: [
      "can-you-bring-or-take-a-skateboard-on-a-plane-or-airplane",
      "best-mini-electric-skateboards"
    ]
  },
  {
    slug: "commute-savings-calculator",
    name: "Commute savings calculator",
    icon: "💰",
    short: "See how much you’d save a year by commuting on an e-bike or e-scooter instead of a car or bus.",
    title: "E-Bike & E-Scooter Commute Savings Calculator",
    description: "How much would you save commuting by e-bike or e-scooter? Compare yearly costs with driving or transit, see the payback time and the CO₂ you avoid.",
    intro: "Enter your commute and what you pay now. We compare it with the full cost of an e-bike or e-scooter, including the price spread over the years you keep it.",
    formula: [
      "Yearly distance = one-way × 2 × days per week × 48 weeks",
      "Current cost = distance × car cost per mile, or trips × fare",
      "E-ride cost = electricity + maintenance + purchase price ÷ years kept",
      "Electricity = distance × Wh per km × 1.15 ÷ 1,000 × price per kWh",
      "Payback = purchase price ÷ (monthly current cost − monthly running cost)"
    ],
    assumptions: [
      "48 commuting weeks a year (holidays excluded).",
      "Energy use: 9 Wh/km for an e-bike and 13 Wh/km for an e-scooter, plus 15% charging losses.",
      "Car cost default is the full cost of driving (fuel, insurance, wear and depreciation) at about $0.67 per mile; use fuel only if you’d keep the car anyway.",
      "CO₂: 170 g/km for an average petrol car and 400 g/kWh for grid electricity.",
      "Ignores parking, tolls, theft and time, which often favour the e-ride further."
    ],
    explainer: [
      {
        heading: "Full cost vs fuel only",
        body: "If switching lets you sell the car or skip a second one, compare with the full cost of driving. If the car stays, compare with fuel and parking only; the saving is smaller but still real."
      },
      {
        heading: "Why payback is often fast",
        body: "An e-bike costs a few dollars a year to charge. Most of the saving comes from not paying for fuel, parking or fares every working day."
      }
    ],
    faqs: [
      {
        question: "How much does it cost to commute on an e-bike?",
        answer: "Electricity is usually under $20 a year for a daily commute. Add maintenance (tyres, brake pads, a service) and the purchase price spread over the years you keep it."
      },
      {
        question: "Is an e-bike cheaper than a car?",
        answer: "For most commutes under 10 miles, yes, by a wide margin, especially when you count insurance, parking and depreciation."
      }
    ],
    recommendedPosts: [
      "best-commuter-electric-bikes-for-commuting",
      "best-commuter-fast-electric-scooters-comparison-for-daily-city-commuting-reviews",
      "why-are-electric-scooters-good-for-the-environment"
    ]
  },
  {
    slug: "battery-wh-calculator",
    name: "Battery Wh, volts and amp-hours converter",
    icon: "🔢",
    short: "Convert between watt-hours, volts and amp-hours, and see a rough range for that battery.",
    title: "Battery Wh Calculator: Convert Volts, Amp-Hours and Watt-Hours",
    description: "Convert e-bike and e-scooter battery volts and amp-hours to watt-hours (or back), with a typical range estimate and the airline limit for that size.",
    intro: "Battery size is quoted three ways. Enter any two and we work out the third, plus a typical range on a scooter and an e-bike.",
    formula: [
      "Wh = V × Ah",
      "Ah = Wh ÷ V",
      "V = Wh ÷ Ah",
      "Typical range (km) = Wh × 0.90 ÷ base Wh per km"
    ],
    assumptions: [
      "Range uses the same base consumption as the range calculator: 13 Wh/km for an e-scooter and 9 Wh/km for an e-bike (75 kg rider, flat ground, 20 km/h).",
      "10% of the capacity is held back by the battery management system.",
      "Use the range calculator for your own weight, speed, hills and temperature."
    ],
    explainer: [
      {
        heading: "Why watt-hours matter most",
        body: "Watt-hours measure the energy the battery holds, so they compare batteries of different voltages fairly. A 48 V 10 Ah pack (480 Wh) holds more than a 36 V 12 Ah pack (432 Wh)."
      }
    ],
    faqs: [
      {
        question: "How do I calculate battery watt-hours?",
        answer: "Multiply volts by amp-hours. A 36 V, 10 Ah battery is 360 Wh."
      },
      {
        question: "Is a higher voltage battery better?",
        answer: "Higher voltage lets the motor deliver more power with less current, but range depends on watt-hours, not voltage alone. Only use the voltage your vehicle is designed for."
      }
    ],
    recommendedPosts: [
      "how-long-does-an-electric-scooter-battery-last-on-one-charge-and-how-to-make-it-last-longer",
      "longest-range-electric-bikes"
    ]
  },
  {
    slug: "weight-capacity-calculator",
    name: "Weight capacity checker",
    icon: "⚖️",
    short: "Check rider, bag and accessories against your scooter or e-bike’s maximum load.",
    title: "E-Scooter & E-Bike Weight Limit Checker",
    description: "Add up rider, backpack and accessories and compare with your e-scooter or e-bike’s maximum load. See the margin left and the effect on range.",
    intro: "The maximum load covers everything on board, not just the rider. Add it all up here before you ride or buy.",
    formula: [
      "Total = rider + cargo + accessories",
      "Share of limit = total ÷ maximum load",
      "Range change ≈ 1 ÷ (0.4 + 0.6 × (total + 15 kg) ÷ 90 kg) − 1"
    ],
    assumptions: [
      "Above 85% of the maximum we flag it as close: hills, braking and range all get worse near the limit.",
      "The range estimate uses the range calculator’s mass model for an e-scooter and compares with a 75 kg (165 lb) rider on flat ground.",
      "Always follow the maker’s stated maximum load; it may differ for the frame, tyres or a rear rack."
    ],
    explainer: [
      {
        heading: "What counts toward the limit",
        body: "Everything the vehicle carries: you, your clothes and helmet, a backpack, shopping, a child seat and any accessories bolted on."
      },
      {
        heading: "What happens near the limit",
        body: "Heavier loads slow you on hills, lengthen braking, wear tyres and brakes faster and cut range. Going over the limit can damage the frame or motor and void the warranty."
      }
    ],
    faqs: [
      {
        question: "How much weight can an electric scooter hold?",
        answer: "Most adult scooters are rated for 220–265 lb (100–120 kg); heavy-duty models go to 300–330 lb. Check the spec sheet for yours."
      },
      {
        question: "Does rider weight affect range?",
        answer: "Yes. A heavier load needs more energy, especially on hills and when accelerating, so range drops as weight goes up."
      }
    ],
    recommendedPosts: [
      "how-old-do-you-have-to-be-to-ride-an-electric-scooter-age-limit",
      "how-much-electric-scooter-for-adults-with-seat",
      "best-electric-scooters-for-adults-reviews"
    ]
  },
  {
    slug: "tire-pressure-calculator",
    name: "Tyre pressure helper",
    icon: "🛞",
    short: "A starting tyre pressure for your e-bike or e-scooter from tyre size, load and surface.",
    title: "E-Bike & E-Scooter Tire Pressure Calculator (PSI)",
    description: "Find a starting tire pressure for your e-bike or e-scooter from tire width, total weight and road surface, in psi and bar, front and rear.",
    intro: "Tyre pressure affects grip, comfort, range and punctures. Enter your tyre and load for a sensible starting point, then fine-tune.",
    formula: [
      "Base pressure from tyre type and width (wider tyre → lower pressure)",
      "Rear = base × (0.7 + 0.3 × total weight ÷ 85 kg) × surface factor",
      "Front ≈ rear × 0.9",
      "Shown as a ±5% range; 1 bar = 14.5 psi"
    ],
    assumptions: [
      "Bike base pressures run from about 90 psi for a 25 mm road tyre to about 10 psi for a 4 in fat tyre; mountain bike tyres run 10% lower.",
      "E-scooter bases: 45 psi for 8.5 in tyres and 40 psi for 10 in tyres.",
      "Surface: smooth ×1.0, mixed ×0.92, gravel or trails ×0.82.",
      "Never go outside the minimum and maximum printed on the tyre sidewall or in your manual."
    ],
    explainer: [
      {
        heading: "Why e-bikes need a little more air",
        body: "E-bikes are heavier and faster than normal bikes, so slightly higher pressure helps avoid pinch flats and squirm, especially with a rear hub motor."
      },
      {
        heading: "Too high or too low?",
        body: "Too low gives pinch flats, slow steering and wasted range. Too high is harsh and slippery on rough or wet roads."
      }
    ],
    faqs: [
      {
        question: "What PSI should an electric scooter tire be?",
        answer: "Most 8.5 in and 10 in air-filled scooter tyres run between 35 and 50 psi. Check the sidewall and your manual."
      },
      {
        question: "How often should I check tire pressure?",
        answer: "Weekly. Tyres lose a few psi a week, and correct pressure protects against flats and keeps your range up."
      }
    ],
    recommendedPosts: [
      "best-electric-bike-pumps",
      "how-to-fix-a-flat-tire-on-an-electric-scooter"
    ]
  },
  {
    slug: "battery-lifespan-calculator",
    name: "Battery lifespan estimator",
    icon: "⏳",
    short: "Estimate how many years your battery will last and what it costs you per year.",
    title: "E-Bike & E-Scooter Battery Life Calculator: How Many Years Will It Last?",
    description: "Estimate how long your e-bike or e-scooter battery will last from its size, rated cycles, weekly riding, charging habits and storage, plus the cost per year.",
    intro: "Batteries wear out from charge cycles and from age. Enter how you ride and charge to estimate when yours will drop to about 80% capacity.",
    formula: [
      "Full cycles per year = weekly km × 52 × Wh per km ÷ battery Wh",
      "Usable cycles = rated cycles × habit factor × heat factor",
      "Life (years) = the lower of usable cycles ÷ cycles per year, and 8 years × heat factor",
      "Cost per year = replacement price ÷ life"
    ],
    assumptions: [
      "Rated cycles are to roughly 80% of original capacity; 500–1,000 is typical for e-bike and e-scooter packs.",
      "Habit factor: often charging to 100% or running flat ×0.8, normal ×1.0, keeping it between 20–80% ×1.2.",
      "Heat factor: indoors ×1.0, warm ×0.85, hot ×0.65. Heat is the biggest cause of early ageing.",
      "Calendar ageing caps life at about 8 years even with light use."
    ],
    explainer: [
      {
        heading: "What wears a battery out",
        body: "Every full charge cycle wears the cells a little, and so does time, especially in heat or when left at 100% for long periods."
      },
      {
        heading: "How to make it last longer",
        body: "Store it indoors, avoid leaving it full or empty for weeks, charge at room temperature and use the maker’s charger."
      }
    ],
    faqs: [
      {
        question: "How long does an e-bike battery last?",
        answer: "Typically 3–5 years or 500–1,000 full charge cycles before it drops to about 80% capacity. Careful charging and cool storage stretch that."
      },
      {
        question: "Is it bad to charge my battery every day?",
        answer: "No. Partial charges count as part of a cycle. Charging daily is fine; avoiding 100% for long storage and avoiding heat matter more."
      }
    ],
    recommendedPosts: [
      "how-long-does-an-electric-scooter-battery-last-on-one-charge-and-how-to-make-it-last-longer",
      "how-to-charge-an-electric-bike-battery-time-cost-and-how-often"
    ]
  },
  {
    slug: "ebike-frame-size-calculator",
    name: "E-bike frame size calculator",
    icon: "📏",
    short: "Find your e-bike frame size (XS to XL) from height, plus seat tube and saddle height from inseam.",
    title: "E-Bike Size Chart and Frame Size Calculator",
    description: "What size e-bike do I need? Get a frame size from your height and, with your inseam, a seat tube length and a starting saddle height.",
    intro: "Most e-bikes come in letter sizes. Enter your height (and inseam for more detail) to find yours.",
    formula: [
      "Size from height: XS under 158 cm, S 158–168, M 168–178, L 178–188, XL 188+",
      "Seat tube ≈ inseam × 0.66 (city, step-through, mountain) or × 0.70 (road)",
      "Saddle height ≈ inseam × 0.883 (centre of crank to top of saddle)"
    ],
    assumptions: [
      "Height bands are typical of most brands’ charts; every brand’s own chart takes priority.",
      "Within 2 cm of a size boundary we suggest trying both sizes.",
      "Step-through frames are more forgiving if you are between sizes."
    ],
    explainer: [
      {
        heading: "Height vs inseam",
        body: "Height gets you a letter size. Inseam is better for fit, because two people of the same height can have very different leg lengths."
      },
      {
        heading: "Why fit matters more on an e-bike",
        body: "E-bikes are heavier, so being able to stand over the frame and put a foot down easily makes stops and starts safer."
      }
    ],
    faqs: [
      {
        question: "What size e-bike do I need for my height?",
        answer: "Roughly: under 5′2″ XS, 5′2″–5′6″ S, 5′6″–5′10″ M, 5′10″–6′2″ L, over 6′2″ XL. Always check the brand’s chart."
      },
      {
        question: "How do I measure my inseam?",
        answer: "Stand barefoot against a wall with a book between your legs, spine up, and measure from the floor to the top of the book."
      }
    ],
    recommendedPosts: [
      "best-electric-bikes-and-ebikes-for-adults-reviews",
      "most-comfortable-electric-bike-for-seniors",
      "what-to-look-for-when-buying-an-electric-bike-or-e-bike"
    ]
  },
  {
    slug: "hill-climb-calculator",
    name: "Hill climb calculator",
    icon: "⛰️",
    short: "Will your scooter or e-bike make it up the hill? Power needed vs your motor, and top speed on the climb.",
    title: "Can My E-Scooter or E-Bike Climb This Hill? Hill Climb Calculator",
    description: "Check whether your e-scooter or e-bike motor can climb a hill: power needed at a chosen speed vs rated and peak motor power, and the top speed on that slope.",
    intro: "Climbing takes power that rises with weight, slope and speed. Enter your motor, weight and hill to see if it will make it.",
    formula: [
      "Power = m·g·v·(sin θ + Crr·cos θ) + ½·ρ·CdA·v³",
      "θ = atan(gradient ÷ 100)",
      "Power at the wheel = motor watts × 0.8 (+ your pedalling on an e-bike)",
      "Top speed = highest speed where power needed ≤ power available"
    ],
    assumptions: [
      "Rolling resistance (Crr): 0.012 e-scooter, 0.008 e-bike. Drag area (CdA): 0.6 m² e-scooter, 0.5 m² e-bike. Air density 1.2 kg/m³.",
      "Motor and drivetrain efficiency 80%; real motors deliver less when the battery is low or hot.",
      "Peak power is only available for short bursts; long climbs on peak power heat the motor and battery.",
      "Ignores wind and very rough surfaces, which add more resistance."
    ],
    explainer: [
      {
        heading: "Rated vs peak power",
        body: "The rated (continuous) power is what the motor can sustain. Peak power is a short burst for starts and short hills. Long hills depend on the rated figure."
      },
      {
        heading: "Why slowing down helps",
        body: "Power needed rises with speed, so a hill your motor can’t take at 15 mph it may manage at 8 mph."
      }
    ],
    faqs: [
      {
        question: "Can a 350W scooter climb hills?",
        answer: "It can manage gentle slopes (around 5–8%) at walking-to-jogging pace with an average rider. Steeper hills need 500 W or more, or a dual motor."
      },
      {
        question: "What gradient is steep for an e-scooter?",
        answer: "Around 10% is steep for single-motor scooters; 15% and above usually needs a dual-motor scooter or an e-bike with a mid-drive."
      }
    ],
    recommendedPosts: [
      "best-off-road-all-terrain-electric-scooters-for-hills",
      "fastest-most-powerful-electric-bikes-top-speed"
    ]
  }
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
