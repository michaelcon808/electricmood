// Pure calculation functions for the /tools pages. Formulas here must match the
// "How it's calculated" text in lib/tools.ts.

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const KM_PER_MILE = 1.609344;

/* ---------------- Range ---------------- */

export type Vehicle = 'escooter' | 'ebike';
export type Terrain = 'flat' | 'rolling' | 'hilly';
export type Assist = 'eco' | 'normal' | 'high';

export const RANGE_CONSTANTS = {
  /** Wh/km for a 75 kg rider, flat ground, 20 km/h, 20 °C. */
  baseWhPerKm: { escooter: 13, ebike: 9 } as Record<Vehicle, number>,
  vehicleKg: { escooter: 15, ebike: 24 } as Record<Vehicle, number>,
  terrain: { flat: 1, rolling: 1.2, hilly: 1.45 } as Record<Terrain, number>,
  /** E-bike only: how much of the work the motor does. */
  assist: { eco: 0.65, normal: 1, high: 1.5 } as Record<Assist, number>,
  usableFraction: 0.9,
  refRiderKg: 75,
  refSpeedKmh: 20,
};

export type RangeInput = {
  vehicle: Vehicle;
  voltage: number;
  amphours: number;
  riderKg: number;
  speedKmh: number;
  terrain: Terrain;
  assist: Assist;
  temperatureC: number;
};

export function estimateRange(i: RangeInput) {
  const C = RANGE_CONSTANTS;
  const wh = i.voltage * i.amphours;
  const vehicleKg = C.vehicleKg[i.vehicle];
  // ~60% of energy goes to rolling resistance/climbing, which scales with total mass.
  const weightFactor = 0.4 + (0.6 * (i.riderKg + vehicleKg)) / (C.refRiderKg + vehicleKg);
  // Half of consumption at 20 km/h is aerodynamic drag, which scales with speed squared.
  const speedFactor = 0.5 + 0.5 * (i.speedKmh / C.refSpeedKmh) ** 2;
  // Lithium cells deliver less energy in the cold: ~1.2% per °C below 20 °C.
  const temperatureFactor = clamp(1 - 0.012 * (20 - i.temperatureC), 0.6, 1);
  const assistFactor = i.vehicle === 'ebike' ? C.assist[i.assist] : 1;
  const whPerKm = C.baseWhPerKm[i.vehicle] * weightFactor * speedFactor * C.terrain[i.terrain] * assistFactor;
  const usableWh = wh * C.usableFraction * temperatureFactor;
  const km = usableWh / whPerKm;
  return { wh, usableWh, whPerKm, km, lowKm: km * 0.85, highKm: km * 1.15, weightFactor, speedFactor, temperatureFactor };
}

/* ---------------- Charging ---------------- */

export type ChargingInput = {
  voltage: number;
  amphours: number;
  chargerAmps: number;
  startPct: number;
  targetPct: number;
  efficiency: number; // 0–1, wall to battery
  pricePerKwh: number;
  whPerKm?: number;
};

export function estimateCharging(i: ChargingInput) {
  const wh = i.voltage * i.amphours;
  const start = clamp(i.startPct, 0, 100);
  const target = clamp(i.targetPct, start, 100);
  const chargerW = i.voltage * i.chargerAmps;
  // Constant-current phase runs at full power up to ~80%; the constant-voltage
  // phase above 80% tapers, averaging roughly half power.
  const bulkWh = (wh * Math.max(0, Math.min(target, 80) - start)) / 100;
  const taperWh = (wh * Math.max(0, target - Math.max(start, 80))) / 100;
  const hours = chargerW > 0 ? bulkWh / chargerW + taperWh / (chargerW * 0.5) : 0;
  const batteryWh = bulkWh + taperWh;
  const wallKwh = batteryWh / clamp(i.efficiency, 0.5, 1) / 1000;
  const cost = wallKwh * i.pricePerKwh;
  const fullWallKwh = wh / clamp(i.efficiency, 0.5, 1) / 1000;
  const costPer100Km = i.whPerKm ? ((i.whPerKm * 100) / clamp(i.efficiency, 0.5, 1) / 1000) * i.pricePerKwh : null;
  return { wh, chargerW, hours, batteryWh, wallKwh, cost, fullChargeCost: fullWallKwh * i.pricePerKwh, costPer100Km };
}

/* ---------------- Power station ---------------- */

export type Device = { name: string; watts: number; hours: number; qty: number; ac: boolean };

export const POWER_STATION_SIZES = [256, 512, 768, 1024, 1536, 2048, 3072, 4096, 5120, 6144];

export function estimatePowerStation(devices: Device[], opts: { days: number; inverterEfficiency: number; usableFraction: number; sunHours: number }) {
  const valid = devices.filter((d) => d.watts > 0 && d.hours > 0 && d.qty > 0);
  const acWh = valid.filter((d) => d.ac).reduce((s, d) => s + d.watts * d.hours * d.qty, 0);
  const dcWh = valid.filter((d) => !d.ac).reduce((s, d) => s + d.watts * d.hours * d.qty, 0);
  const dailyLoadWh = acWh + dcWh;
  // AC loads lose energy in the inverter; DC/USB loads mostly don't.
  const dailyBatteryWh = acWh / clamp(opts.inverterEfficiency, 0.5, 1) + dcWh / 0.95;
  const requiredWh = (dailyBatteryWh * Math.max(1, opts.days)) / clamp(opts.usableFraction, 0.5, 1);
  const recommendedWh = POWER_STATION_SIZES.find((s) => s >= requiredWh) ?? Math.ceil(requiredWh / 1024) * 1024;
  const runningW = valid.reduce((s, d) => s + d.watts * d.qty, 0);
  const inverterW = Math.ceil((runningW * 1.25) / 100) * 100;
  // Solar to refill one day's use, assuming ~75% real-world panel output.
  const solarW = opts.sunHours > 0 ? Math.ceil(dailyBatteryWh / (opts.sunHours * 0.75) / 50) * 50 : 0;
  return { dailyLoadWh, dailyBatteryWh, requiredWh, recommendedWh, runningW, inverterW, solarW };
}

/* ---------------- Units ---------------- */

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;
export type UnitSystem = 'metric' | 'imperial';

/* ---------------- Charging cost over time (extends the charging calculator) ---------------- */

/** Monthly and yearly electricity cost for a given number of charges per week. */
export function chargingCostOverTime(costPerCharge: number, chargesPerWeek: number) {
  const perWeek = costPerCharge * Math.max(0, chargesPerWeek);
  return { perWeek, perMonth: (perWeek * 52) / 12, perYear: perWeek * 52 };
}

/* ---------------- Airline battery check ---------------- */

export type AirlineVerdict = 'carry-on' | 'approval' | 'forbidden';

/** Watt-hour limits for lithium-ion batteries on passenger flights (FAA / IATA): 100 Wh and 160 Wh. */
export const AIRLINE_LIMITS = { noApprovalWh: 100, maxWh: 160, maxSparesWithApproval: 2 };

export function checkAirlineBattery(i: { wh: number; batteries: number }) {
  const wh = Math.max(0, i.wh);
  const verdict: AirlineVerdict = wh <= AIRLINE_LIMITS.noApprovalWh ? 'carry-on' : wh <= AIRLINE_LIMITS.maxWh ? 'approval' : 'forbidden';
  const tooManySpares = verdict === 'approval' && i.batteries > AIRLINE_LIMITS.maxSparesWithApproval;
  // How much smaller each pack would have to be to get under the hard limit (e.g. by splitting it).
  const overBy = Math.max(0, wh - AIRLINE_LIMITS.maxWh);
  return { wh, verdict, tooManySpares, overBy, totalWh: wh * Math.max(1, i.batteries) };
}

/* ---------------- Battery V / Ah / Wh converter ---------------- */

export type BatterySolveFor = 'wh' | 'ah' | 'v';

export function convertBattery(i: { solveFor: BatterySolveFor; voltage: number; amphours: number; wh: number }) {
  const voltage = i.solveFor === 'v' ? i.wh / i.amphours : i.voltage;
  const amphours = i.solveFor === 'ah' ? i.wh / i.voltage : i.amphours;
  const wh = i.solveFor === 'wh' ? i.voltage * i.amphours : i.wh;
  const usable = wh * RANGE_CONSTANTS.usableFraction;
  return {
    voltage,
    amphours,
    wh,
    // Typical-riding range using the range calculator's base consumption (75 kg rider, flat, 20 km/h).
    scooterKm: usable / RANGE_CONSTANTS.baseWhPerKm.escooter,
    ebikeKm: usable / RANGE_CONSTANTS.baseWhPerKm.ebike,
    airline: checkAirlineBattery({ wh, batteries: 1 }).verdict,
  };
}

/* ---------------- Weight capacity ---------------- */

export function checkWeightCapacity(i: { maxLoadKg: number; riderKg: number; cargoKg: number; accessoriesKg: number }) {
  const totalKg = Math.max(0, i.riderKg) + Math.max(0, i.cargoKg) + Math.max(0, i.accessoriesKg);
  const pct = i.maxLoadKg > 0 ? (totalKg / i.maxLoadKg) * 100 : 0;
  const marginKg = i.maxLoadKg - totalKg;
  const status: 'ok' | 'close' | 'over' = pct > 100 ? 'over' : pct > 85 ? 'close' : 'ok';
  // Same mass model as the range calculator: about 60% of energy use scales with total moving mass.
  const vehicleKg = RANGE_CONSTANTS.vehicleKg.escooter;
  const rangeChangePct = (1 / (0.4 + (0.6 * (totalKg + vehicleKg)) / (RANGE_CONSTANTS.refRiderKg + vehicleKg)) - 1) * 100;
  return { totalKg, pct, marginKg, status, rangeChangePct };
}

/* ---------------- Tyre pressure ---------------- */

export type TyreKind = 'bike-road' | 'bike-hybrid' | 'bike-mtb' | 'bike-fat' | 'scooter-8' | 'scooter-10';
export type Surface = 'smooth' | 'mixed' | 'rough';

/** Starting pressure (psi) for a 85 kg rider + bike, by tyre type and width. Always stay inside the sidewall range. */
const BIKE_PSI_BY_WIDTH_MM: [number, number][] = [
  [25, 90], [28, 80], [32, 70], [35, 62], [38, 55], [42, 50], [47, 44], [50, 38], [55, 32], [60, 28], [65, 24], [75, 18], [100, 10],
];

export function estimateTyrePressure(i: { kind: TyreKind; widthMm: number; totalKg: number; surface: Surface }) {
  const surface = { smooth: 1, mixed: 0.92, rough: 0.82 }[i.surface];
  // Pressure needed scales roughly with load; damped so light/heavy riders aren't pushed to extremes.
  const load = 0.7 + 0.3 * (Math.max(30, i.totalKg) / 85);
  let base: number;
  if (i.kind === 'scooter-8') base = 45;
  else if (i.kind === 'scooter-10') base = 40;
  else {
    const w = i.kind === 'bike-fat' ? Math.max(i.widthMm, 90) : i.widthMm;
    const t = BIKE_PSI_BY_WIDTH_MM;
    const hi = t.findIndex(([mm]) => mm >= w);
    if (hi <= 0) base = hi === 0 ? t[0][1] : t[t.length - 1][1];
    else {
      const [w0, p0] = t[hi - 1];
      const [w1, p1] = t[hi];
      base = p0 + ((p1 - p0) * (w - w0)) / (w1 - w0);
    }
    if (i.kind === 'bike-mtb') base *= 0.9;
  }
  const rear = base * load * surface;
  // Rear carries ~60% of the weight; front runs about 10% lower.
  const front = rear * 0.9;
  return { front, rear, frontBar: front / 14.5038, rearBar: rear / 14.5038 };
}

/* ---------------- Battery lifespan ---------------- */

export type ChargeHabit = 'full-often' | 'normal' | 'careful';
export type StorageHeat = 'cool' | 'warm' | 'hot';

export function estimateBatteryLifespan(i: {
  wh: number;
  ratedCycles: number;
  kmPerWeek: number;
  whPerKm: number;
  habit: ChargeHabit;
  storage: StorageHeat;
  replacementCost: number;
}) {
  const yearlyWh = Math.max(0, i.kmPerWeek) * 52 * Math.max(0, i.whPerKm);
  const cyclesPerYear = i.wh > 0 ? yearlyWh / i.wh : 0;
  const habit = { 'full-often': 0.8, normal: 1, careful: 1.2 }[i.habit];
  const heat = { cool: 1, warm: 0.85, hot: 0.65 }[i.storage];
  const effectiveCycles = i.ratedCycles * habit * heat;
  const cycleYears = cyclesPerYear > 0 ? effectiveCycles / cyclesPerYear : Infinity;
  // Lithium-ion also ages with time even when lightly used (calendar ageing).
  const calendarYears = 8 * heat;
  const years = Math.min(cycleYears, calendarYears);
  const lifetimeKm = years * Math.max(0, i.kmPerWeek) * 52;
  return {
    cyclesPerYear,
    effectiveCycles,
    years,
    limitedBy: cycleYears <= calendarYears ? ('cycles' as const) : ('age' as const),
    lifetimeKm,
    costPerYear: years > 0 ? i.replacementCost / years : 0,
    costPer1000Km: lifetimeKm > 0 ? (i.replacementCost / lifetimeKm) * 1000 : 0,
  };
}

/* ---------------- E-bike frame size ---------------- */

export type FrameStyle = 'city' | 'mountain' | 'road' | 'step-through';

/** Rider height bands (cm) for letter sizes on most brands' charts. */
export const FRAME_SIZE_BANDS = [
  { size: 'XS', min: 0, max: 158 },
  { size: 'S', min: 158, max: 168 },
  { size: 'M', min: 168, max: 178 },
  { size: 'L', min: 178, max: 188 },
  { size: 'XL', min: 188, max: 999 },
];

export function estimateFrameSize(i: { heightCm: number; inseamCm?: number; style: FrameStyle }) {
  const band = FRAME_SIZE_BANDS.find((b) => i.heightCm < b.max) ?? FRAME_SIZE_BANDS[FRAME_SIZE_BANDS.length - 1];
  const nearEdge = FRAME_SIZE_BANDS.some((b) => b.max < 999 && Math.abs(i.heightCm - b.max) <= 2);
  const factor = { city: 0.66, 'step-through': 0.66, road: 0.7, mountain: 0.66 }[i.style];
  const seatTubeCm = i.inseamCm && i.inseamCm > 0 ? i.inseamCm * factor : null;
  // Saddle height (centre of crank to top of saddle) ≈ 0.883 × inseam (LeMond method).
  const saddleCm = i.inseamCm && i.inseamCm > 0 ? i.inseamCm * 0.883 : null;
  return { size: band.size, nearEdge, seatTubeCm, seatTubeIn: seatTubeCm ? seatTubeCm / CM_PER_INCH : null, saddleCm };
}

/* ---------------- Hill climb ---------------- */

export const HILL = { g: 9.81, rho: 1.2, crr: { escooter: 0.012, ebike: 0.008 } as Record<Vehicle, number>, cda: { escooter: 0.6, ebike: 0.5 } as Record<Vehicle, number>, drivetrain: 0.8 };

/** Power at the wheel (W) to hold `speedKmh` on a `gradePct` slope. */
export function wheelPowerNeeded(vehicle: Vehicle, totalKg: number, gradePct: number, speedKmh: number) {
  const v = speedKmh / 3.6;
  const theta = Math.atan(gradePct / 100);
  const climb = totalKg * HILL.g * Math.sin(theta) * v;
  const rolling = totalKg * HILL.g * Math.cos(theta) * HILL.crr[vehicle] * v;
  const air = 0.5 * HILL.rho * HILL.cda[vehicle] * v ** 3;
  return climb + rolling + air;
}

export function estimateHillClimb(i: { vehicle: Vehicle; motorW: number; peakW: number; pedalW: number; totalKg: number; gradePct: number; speedKmh: number }) {
  const pedal = i.vehicle === 'ebike' ? Math.max(0, i.pedalW) : 0;
  const continuousAtWheel = Math.max(0, i.motorW) * HILL.drivetrain + pedal;
  const peakAtWheel = Math.max(0, i.peakW || i.motorW) * HILL.drivetrain + pedal;
  const neededW = wheelPowerNeeded(i.vehicle, i.totalKg, i.gradePct, i.speedKmh);
  // Highest steady speed the available power can hold on this slope (bisection; power rises with speed).
  const maxSpeed = (power: number) => {
    let lo = 0;
    let hi = 80;
    if (wheelPowerNeeded(i.vehicle, i.totalKg, i.gradePct, 1) > power) return 0;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (wheelPowerNeeded(i.vehicle, i.totalKg, i.gradePct, mid) <= power) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  const verdict: 'easy' | 'peak-only' | 'too-steep' = neededW <= continuousAtWheel ? 'easy' : neededW <= peakAtWheel ? 'peak-only' : 'too-steep';
  return { neededW, continuousAtWheel, peakAtWheel, verdict, maxSpeedContinuous: maxSpeed(continuousAtWheel), maxSpeedPeak: maxSpeed(peakAtWheel) };
}

/* ---------------- Commute savings ---------------- */

export function estimateCommuteSavings(i: {
  oneWayKm: number;
  daysPerWeek: number;
  currentCostPerKm: number;
  transitFarePerTrip: number;
  useTransit: boolean;
  ridePrice: number;
  rideLifeYears: number;
  whPerKm: number;
  pricePerKwh: number;
  maintenancePerYear: number;
  carGPerKm: number;
  gridGPerKwh: number;
}) {
  const yearlyKm = i.oneWayKm * 2 * i.daysPerWeek * 48; // ~48 working weeks
  const tripsPerYear = 2 * i.daysPerWeek * 48;
  const currentYear = i.useTransit ? tripsPerYear * i.transitFarePerTrip : yearlyKm * i.currentCostPerKm;
  const energyYear = (yearlyKm * i.whPerKm * 1.15) / 1000 * i.pricePerKwh; // 15% charging losses
  const depreciationYear = i.rideLifeYears > 0 ? i.ridePrice / i.rideLifeYears : 0;
  const rideYear = energyYear + i.maintenancePerYear + depreciationYear;
  const savingsYear = currentYear - rideYear;
  const monthlyRunning = (energyYear + i.maintenancePerYear) / 12;
  const monthlySaving = currentYear / 12 - monthlyRunning;
  const paybackMonths = monthlySaving > 0 ? i.ridePrice / monthlySaving : Infinity;
  const co2SavedKg = i.useTransit ? 0 : (yearlyKm * i.carGPerKm - (yearlyKm * i.whPerKm * 1.15 * i.gridGPerKwh) / 1000) / 1000;
  return { yearlyKm, currentYear, energyYear, depreciationYear, rideYear, savingsYear, paybackMonths, co2SavedKg };
}

/* ---------------- Ride finder ---------------- */

export type FinderAnswers = {
  rider: 'kid' | 'teen' | 'adult' | 'senior';
  distance: 'short' | 'medium' | 'long';
  terrain: 'flat' | 'hilly' | 'offroad';
  carry: boolean;
  budget: 'low' | 'mid' | 'high';
  rain: boolean;
  campus: boolean;
  exercise: boolean;
};

export type RideKind = 'escooter' | 'ebike' | 'eskateboard';

/** Scores each kind of ride, then picks review posts that fit the answers. Post slugs are filtered by the page. */
export function findRide(a: FinderAnswers) {
  const s: Record<RideKind, number> = { escooter: 0, ebike: 0, eskateboard: 0 };
  if (a.rider === 'kid' || a.rider === 'teen') s.escooter += 3;
  if (a.rider === 'senior') s.ebike += 4;
  if (a.distance === 'short') { s.escooter += 2; s.eskateboard += 2; }
  if (a.distance === 'medium') { s.escooter += 2; s.ebike += 2; }
  if (a.distance === 'long') s.ebike += 4;
  if (a.terrain === 'hilly') { s.ebike += 3; s.escooter += 1; }
  if (a.terrain === 'offroad') { s.ebike += 2; s.eskateboard += 1; s.escooter += 1; }
  if (a.carry) { s.escooter += 2; s.eskateboard += 3; s.ebike -= 2; }
  if (a.budget === 'low') { s.escooter += 2; s.eskateboard += 1; s.ebike -= 1; }
  if (a.budget === 'high') s.ebike += 1;
  if (a.rain) { s.ebike += 2; s.escooter += 1; s.eskateboard -= 3; }
  if (a.campus) { s.escooter += 2; s.eskateboard += 2; }
  if (a.exercise) s.ebike += 3;
  if (a.rider === 'kid') s.eskateboard -= 3;
  const ranked = (Object.keys(s) as RideKind[]).sort((x, y) => s[y] - s[x]);
  const best = ranked[0];

  const picks: string[] = [];
  const add = (...slugs: string[]) => slugs.forEach((x) => !picks.includes(x) && picks.push(x));
  if (best === 'escooter') {
    if (a.rider === 'kid' || a.rider === 'teen') add('best-kids-electric-scooters-for-teens-8-10-12-year-olds-reviews');
    if (a.campus) add('best-electric-scooters-for-college-students-large-campus');
    if (a.rain) add('best-waterproof-electric-scooters-for-daily-commute-in-rain-deals');
    if (a.terrain !== 'flat') add('best-off-road-all-terrain-electric-scooters-for-hills');
    if (a.carry) add('best-lightweight-foldable-commuting-e-scooters-for-adults');
    if (a.distance === 'long') add('best-affordable-top-long-range-electric-scooters-for-adults-longest-range-reviews');
    if (a.budget === 'low') add('best-budget-cheap-electric-scooters-under-500-dollars-reviews');
    add('best-commuter-fast-electric-scooters-comparison-for-daily-city-commuting-reviews', 'best-electric-scooters-for-adults-reviews');
  } else if (best === 'ebike') {
    if (a.rider === 'senior') add('most-comfortable-electric-bike-for-seniors');
    if (a.carry) add('best-folding-electric-bikes');
    if (a.distance === 'long') add('longest-range-electric-bikes');
    if (a.terrain === 'offroad') add('best-electric-bikes-for-hunting');
    if (a.budget === 'low') add('best-budget-electric-bikes');
    add('best-commuter-electric-bikes-for-commuting', 'best-electric-bikes-and-ebikes-for-adults-reviews');
  } else {
    if (a.campus) add('best-electric-skateboard-for-college-campus-commuting');
    if (a.carry) add('best-mini-electric-skateboards');
    if (a.terrain === 'offroad') add('best-off-road-all-terrain-electric-skateboards');
    if (a.budget === 'low') add('best-budget-electric-skateboards-under-1000');
    add('best-electric-skateboards-reviews');
  }
  return { best, ranked, scores: s, picks };
}
