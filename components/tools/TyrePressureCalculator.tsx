'use client';

import { useState } from 'react';
import { estimateTyrePressure, KG_PER_LB, type Surface, type TyreKind, type UnitSystem } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

const KINDS: { value: TyreKind; label: string; width: number }[] = [
  { value: 'bike-hybrid', label: 'E-bike: city / hybrid', width: 47 },
  { value: 'bike-road', label: 'E-bike: road / gravel', width: 32 },
  { value: 'bike-mtb', label: 'E-bike: mountain', width: 60 },
  { value: 'bike-fat', label: 'E-bike: fat tyre (4 in)', width: 100 },
  { value: 'scooter-8', label: 'E-scooter: 8.5 in air tyre', width: 0 },
  { value: 'scooter-10', label: 'E-scooter: 10 in air tyre', width: 0 },
];

export default function TyrePressureCalculator() {
  const [kind, setKind] = useState<TyreKind>('bike-hybrid');
  const [width, setWidth] = useState(47);
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [weight, setWeight] = useState(230);
  const [surface, setSurface] = useState<Surface>('smooth');
  const isBike = kind.startsWith('bike');
  const totalKg = units === 'imperial' ? weight * KG_PER_LB : weight;
  const r = allPositive(weight) && (!isBike || allPositive(width)) ? estimateTyrePressure({ kind, widthMm: width, totalKg, surface }) : null;
  const range = (p: number) => `${fmt(p * 0.95)}–${fmt(p * 1.05)} psi`;

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          id="kind"
          label="Tyre"
          value={kind}
          onChange={(k) => {
            setKind(k);
            const w = KINDS.find((x) => x.value === k)?.width;
            if (w) setWidth(w);
          }}
          options={KINDS.map(({ value, label }) => ({ value, label }))}
        />
        {isBike && <NumberField id="width" label="Tyre width" value={width} onChange={setWidth} min={20} max={120} unit="mm" hint="On the sidewall, e.g. 47-622 or 700×47c (2 in ≈ 50 mm)" />}
        <SelectField id="units" label="Units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'Pounds (lb)' }, { value: 'metric', label: 'Kilograms (kg)' }]} />
        <NumberField id="w" label="Rider + vehicle + load" value={weight} onChange={setWeight} min={1} unit={units === 'imperial' ? 'lb' : 'kg'} />
        <SelectField id="surface" label="Where you ride" value={surface} onChange={setSurface} options={[{ value: 'smooth', label: 'Smooth roads' }, { value: 'mixed', label: 'Mixed / broken roads' }, { value: 'rough', label: 'Gravel / trails' }]} />
      </div>
      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Front tyre" value={range(r.front)} sub={`about ${fmt(r.frontBar, 1)} bar`} />
            <ResultCard label="Rear tyre" value={range(r.rear)} sub={`about ${fmt(r.rearBar, 1)} bar`} />
            <p className="rounded-xl bg-white p-4 text-sm shadow-sm sm:col-span-2 dark:bg-neutral-900">
              A starting point only. Always stay inside the minimum and maximum printed on your tyre’s sidewall, and follow your manual for scooters. Check pressure weekly: tyres lose air over time.
            </p>
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
