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
      'Speed factor = 0.5 + 0.5 × (speed ÷ 20)² — air drag grows with the square of speed.',
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
    recommendedPosts: ['best-commuter-electric-scooters', 'best-electric-bikes-with-a-passenger-seat'],
  },
  {
    slug: 'charging-time-calculator',
    name: 'Charging time & cost calculator',
    icon: '⚡',
    short: 'Work out how long a charge takes and what it costs in electricity.',
    title: 'E-Bike & E-Scooter Charging Time and Cost Calculator',
    description:
      'Calculate how long your e-bike or e-scooter takes to charge and how much each charge costs, from battery size, charger amps and your electricity price.',
    intro: 'Enter your battery and charger details plus your electricity price to estimate charging time and cost.',
    formula: [
      'Battery energy (Wh) = Volts × Amp-hours',
      'Charger power (W) = Volts × Charger amps',
      'Time = (energy up to 80%) ÷ power + (energy above 80%) ÷ (power × 0.5)',
      'Cost = energy added ÷ charging efficiency ÷ 1000 × price per kWh',
    ],
    assumptions: [
      'Charging runs at full power up to 80%, then tapers; the last 20% is modelled at half power on average.',
      'Charging efficiency (wall to battery) defaults to 85% to cover charger and battery losses.',
      'Charger power is estimated from the battery’s nominal voltage — real chargers vary slightly.',
    ],
    explainer: [
      {
        heading: 'Why the last 20% is slow',
        body: 'Lithium-ion chargers switch from constant current to constant voltage near full charge, so the current tapers off to protect the cells.',
      },
      {
        heading: 'Charging is cheap',
        body: 'Even a large e-bike battery stores less than 1 kWh, so a full charge usually costs less than a coffee — often just a few cents.',
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
    recommendedPosts: ['best-chargers', 'how-long-does-an-electric-scooter-take-to-charge'],
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
      'Assumes all devices could run at the same time when sizing the inverter, with a 25% margin. Motors and compressors can surge 2–3× on start-up — check surge ratings.',
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
        answer: 'Lithium iron phosphate — a battery chemistry common in power stations. It is heavier than NMC but lasts thousands of cycles and is very stable.',
      },
    ],
    recommendedPosts: ['best-chargers'],
  },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
