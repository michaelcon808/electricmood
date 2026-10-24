'use client';

import { useState } from 'react';
import { checkWeightCapacity, KG_PER_LB, type UnitSystem } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function WeightCapacityChecker() {
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [maxLoad, setMaxLoad] = useState(265);
  const [rider, setRider] = useState(190);
  const [cargo, setCargo] = useState(15);
  const [accessories, setAccessories] = useState(5);
  const toKg = (n: number) => (units === 'imperial' ? n * KG_PER_LB : n);
  const fromKg = (n: number) => (units === 'imperial' ? n / KG_PER_LB : n);
  const u = units === 'imperial' ? 'lb' : 'kg';
  const valid = allPositive(maxLoad, rider) && cargo >= 0 && accessories >= 0;
  const r = valid ? checkWeightCapacity({ maxLoadKg: toKg(maxLoad), riderKg: toKg(rider), cargoKg: toKg(cargo), accessoriesKg: toKg(accessories) }) : null;
  const status = r && { ok: ['Within the limit', 'You have a comfortable margin.'], close: ['Close to the limit', 'Within 15% of the maximum: expect slower hill climbs, longer braking and shorter range.'], over: ['Over the limit', 'Above the maker’s maximum load. This can damage the frame, motor or brakes and may void the warranty.'] }[r.status];

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="units" label="Units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'Pounds (lb)' }, { value: 'metric', label: 'Kilograms (kg)' }]} />
        <NumberField id="max" label="Maximum load" value={maxLoad} onChange={setMaxLoad} min={1} unit={u} hint="From the spec sheet or manual" />
        <NumberField id="rider" label="Rider weight" value={rider} onChange={setRider} min={1} unit={u} hint="Dressed, with helmet" />
        <NumberField id="cargo" label="Backpack and cargo" value={cargo} onChange={setCargo} min={0} unit={u} />
        <NumberField id="acc" label="Accessories" value={accessories} onChange={setAccessories} min={0} unit={u} hint="Lock, basket, child seat, seat kit" />
      </div>
      <ResultsPanel valid={!!r}>
        {r && status && (
          <>
            <ResultCard label="Total load" value={`${fmt(fromKg(r.totalKg))} ${u}`} sub={`${fmt(r.pct)}% of the ${fmt(maxLoad)} ${u} maximum`} />
            <ResultCard label={r.marginKg >= 0 ? 'Margin left' : 'Over by'} value={`${fmt(Math.abs(fromKg(r.marginKg)))} ${u}`} sub={status[0]} />
            <ResultCard label="Range vs a 75 kg (165 lb) rider" value={`${r.rangeChangePct >= 0 ? '+' : ''}${fmt(r.rangeChangePct)}%`} sub="rough estimate, flat ground" />
            <div className={`rounded-xl border-l-4 p-4 text-sm shadow-sm ${r.status === 'ok' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : r.status === 'close' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <p className="font-bold">{status[0]}</p>
              <p className="mt-1">{status[1]}</p>
            </div>
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
