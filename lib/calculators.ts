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
