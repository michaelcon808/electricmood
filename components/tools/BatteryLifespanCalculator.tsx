'use client';

import { useState } from 'react';
import { estimateBatteryLifespan, KM_PER_MILE, type ChargeHabit, type StorageHeat, type UnitSystem } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function BatteryLifespanCalculator() {
  const [wh, setWh] = useState(500);
  const [cycles, setCycles] = useState(800);
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [distance, setDistance] = useState(40);
  const [whPerKm, setWhPerKm] = useState(12);
  const [habit, setHabit] = useState<ChargeHabit>('normal');
  const [storage, setStorage] = useState<StorageHeat>('cool');
  const [cost, setCost] = useState(450);
  const kmPerWeek = units === 'imperial' ? distance * KM_PER_MILE : distance;
  const r = allPositive(wh, cycles, distance, whPerKm) && cost >= 0 ? estimateBatteryLifespan({ wh, ratedCycles: cycles, kmPerWeek, whPerKm, habit, storage, replacementCost: cost }) : null;
  const d = units === 'imperial' ? 'mi' : 'km';
  const per = (km: number) => (units === 'imperial' ? km / KM_PER_MILE : km);

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField id="wh" label="Battery size" value={wh} onChange={setWh} min={50} unit="Wh" hint="Volts × amp-hours" />
        <NumberField id="cycles" label="Rated charge cycles" value={cycles} onChange={setCycles} min={100} step={50} hint="To ~80% capacity. 500–1,000 is typical." />
        <SelectField id="units" label="Distance units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'Miles' }, { value: 'metric', label: 'Kilometres' }]} />
        <NumberField id="dist" label="Riding per week" value={distance} onChange={setDistance} min={1} unit={d} />
        <NumberField id="whkm" label="Energy use" value={whPerKm} onChange={setWhPerKm} min={3} max={40} step={0.5} unit="Wh/km" hint="E-bike ~9–12, e-scooter ~12–20" />
        <SelectField id="habit" label="Charging habit" value={habit} onChange={setHabit} options={[{ value: 'full-often', label: 'Charge to 100%, often run it flat' }, { value: 'normal', label: 'Normal: charge after rides' }, { value: 'careful', label: 'Careful: keep it between 20–80%' }]} />
        <SelectField id="storage" label="Where it lives" value={storage} onChange={setStorage} options={[{ value: 'cool', label: 'Indoors, room temperature' }, { value: 'warm', label: 'Warm: garage in summer, car' }, { value: 'hot', label: 'Hot: sun, hot climate, heat' }]} />
        <NumberField id="cost" label="Replacement battery price" value={cost} onChange={setCost} min={0} step={10} unit="$" />
      </div>
      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Expected battery life" value={Number.isFinite(r.years) ? `${fmt(r.years, 1)} years` : '—'} sub={r.limitedBy === 'age' ? 'limited by age, not use' : `about ${fmt(r.effectiveCycles)} usable cycles`} />
            <ResultCard label="Full charges per year" value={fmt(r.cyclesPerYear)} sub="equivalent full cycles" />
            <ResultCard label="Distance over its life" value={`${fmt(per(r.lifetimeKm))} ${d}`} />
            <ResultCard label="Battery cost" value={`$${fmt(r.costPerYear)} per year`} sub={`$${fmt(r.costPer1000Km, 2)} per 1,000 km`} />
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
