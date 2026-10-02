'use client';

import { useState } from 'react';
import { estimatePowerStation, type Device } from '@/lib/calculators';
import { fmt, NumberField, ResultCard, ResultsPanel } from './fields';

const PRESETS: Device[] = [
  { name: 'Phone', watts: 10, hours: 2, qty: 1, ac: false },
  { name: 'Laptop', watts: 60, hours: 4, qty: 1, ac: true },
  { name: 'LED lights', watts: 10, hours: 5, qty: 1, ac: false },
  { name: 'Mini fridge (average draw)', watts: 45, hours: 10, qty: 1, ac: true },
  { name: 'CPAP machine', watts: 40, hours: 8, qty: 1, ac: true },
  { name: 'E-bike charger (48 V 2 A)', watts: 110, hours: 6, qty: 1, ac: true },
  { name: 'Wi-Fi router', watts: 12, hours: 24, qty: 1, ac: true },
];

export default function PowerStationCalculator() {
  const [devices, setDevices] = useState<Device[]>([PRESETS[0], PRESETS[1], PRESETS[2]]);
  const [days, setDays] = useState(1);
  const [inverterPct, setInverterPct] = useState(85);
  const [usablePct, setUsablePct] = useState(90);
  const [sunHours, setSunHours] = useState(4);

  const update = (i: number, patch: Partial<Device>) => setDevices((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const num = (v: string) => (v === '' ? NaN : Number(v));

  const r = estimatePowerStation(devices, {
    days: Number.isFinite(days) ? days : 1,
    inverterEfficiency: (Number.isFinite(inverterPct) ? inverterPct : 85) / 100,
    usableFraction: (Number.isFinite(usablePct) ? usablePct : 90) / 100,
    sunHours: Number.isFinite(sunHours) ? sunHours : 0,
  });

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="pb-2 pr-2 font-semibold">Device</th>
              <th className="pb-2 pr-2 font-semibold">Watts</th>
              <th className="pb-2 pr-2 font-semibold">Hours/day</th>
              <th className="pb-2 pr-2 font-semibold">Qty</th>
              <th className="pb-2 pr-2 font-semibold">AC?</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {devices.map((d, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input aria-label="Device name" className="input" value={d.name} onChange={(e) => update(i, { name: e.target.value })} />
                </td>
                <td className="w-24 py-1 pr-2">
                  <input aria-label={`${d.name} watts`} type="number" min={0} className="input" value={Number.isFinite(d.watts) ? d.watts : ''} onChange={(e) => update(i, { watts: num(e.target.value) })} />
                </td>
                <td className="w-24 py-1 pr-2">
                  <input aria-label={`${d.name} hours per day`} type="number" min={0} max={24} step={0.5} className="input" value={Number.isFinite(d.hours) ? d.hours : ''} onChange={(e) => update(i, { hours: num(e.target.value) })} />
                </td>
                <td className="w-20 py-1 pr-2">
                  <input aria-label={`${d.name} quantity`} type="number" min={1} className="input" value={Number.isFinite(d.qty) ? d.qty : ''} onChange={(e) => update(i, { qty: num(e.target.value) })} />
                </td>
                <td className="py-1 pr-2 text-center">
                  <input aria-label={`${d.name} uses AC outlet`} type="checkbox" checked={d.ac} onChange={(e) => update(i, { ac: e.target.checked })} />
                </td>
                <td className="py-1 text-right">
                  <button type="button" aria-label={`Remove ${d.name}`} className="btn-secondary px-3" onClick={() => setDevices((ds) => ds.filter((_, idx) => idx !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="preset" className="text-sm font-medium">
          Add device:
        </label>
        <select
          id="preset"
          className="input w-auto"
          value=""
          onChange={(e) => {
            const p = e.target.value === 'custom' ? { name: 'Custom device', watts: 50, hours: 1, qty: 1, ac: true } : PRESETS[Number(e.target.value)];
            if (p) setDevices((ds) => [...ds, { ...p }]);
          }}
        >
          <option value="">Choose…</option>
          {PRESETS.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name} ({p.watts} W)
            </option>
          ))}
          <option value="custom">Custom device</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField id="days" label="Days without recharging" value={days} onChange={setDays} min={1} max={14} />
        <NumberField id="inv" label="Inverter efficiency" value={inverterPct} onChange={setInverterPct} min={50} max={100} unit="%" />
        <NumberField id="usable" label="Usable capacity" value={usablePct} onChange={setUsablePct} min={50} max={100} unit="%" />
        <NumberField id="sun" label="Peak sun hours" value={sunHours} onChange={setSunHours} min={0} max={10} step={0.5} unit="h/day" hint="Typical: 3–6" />
      </div>

      <ResultsPanel valid={r.dailyLoadWh > 0}>
        <ResultCard label="Recommended capacity" value={`${fmt(r.recommendedWh)} Wh`} sub={`Minimum ${fmt(r.requiredWh)} Wh needed`} />
        <ResultCard label="Inverter output" value={`≥ ${fmt(r.inverterW)} W`} sub={`${fmt(r.runningW)} W if everything runs at once, +25%`} />
        <ResultCard label="Daily energy use" value={`${fmt(r.dailyLoadWh)} Wh`} sub={`${fmt(r.dailyBatteryWh)} Wh from the battery incl. losses`} />
        <ResultCard label="Solar to refill daily" value={r.solarW ? `≈ ${fmt(r.solarW)} W` : '—'} sub={`at ${sunHours} peak sun hours`} />
      </ResultsPanel>
    </div>
  );
}
