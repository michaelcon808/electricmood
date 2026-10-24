'use client';

import { useState } from 'react';
import { convertBattery, KM_PER_MILE, type BatterySolveFor } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

const AIRLINE = { 'carry-on': 'Under 100 Wh: fine to fly', approval: '100–160 Wh: airline approval', forbidden: 'Over 160 Wh: can’t fly' } as const;

export default function BatteryConverter() {
  const [solveFor, setSolveFor] = useState<BatterySolveFor>('wh');
  const [voltage, setVoltage] = useState(48);
  const [amphours, setAmphours] = useState(14);
  const [wh, setWh] = useState(672);
  const need = { wh: [voltage, amphours], ah: [voltage, wh], v: [amphours, wh] }[solveFor];
  const r = allPositive(...need) ? convertBattery({ solveFor, voltage, amphours, wh }) : null;

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField id="solve" label="Work out" value={solveFor} onChange={setSolveFor} options={[{ value: 'wh', label: 'Watt-hours (Wh)' }, { value: 'ah', label: 'Amp-hours (Ah)' }, { value: 'v', label: 'Voltage (V)' }]} />
        {solveFor !== 'v' && <NumberField id="v" label="Voltage" value={voltage} onChange={setVoltage} min={1} step={0.1} unit="V" />}
        {solveFor !== 'ah' && <NumberField id="ah" label="Capacity" value={amphours} onChange={setAmphours} min={0.1} step={0.1} unit="Ah" />}
        {solveFor !== 'wh' && <NumberField id="wh" label="Energy" value={wh} onChange={setWh} min={1} unit="Wh" />}
      </div>
      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Battery" value={`${fmt(r.voltage, 1)} V · ${fmt(r.amphours, 1)} Ah`} sub={`${fmt(r.wh)} Wh`} />
            <ResultCard label="Typical e-scooter range" value={`${fmt(r.scooterKm)} km`} sub={`about ${fmt(r.scooterKm / KM_PER_MILE)} miles, flat ground, 75 kg rider`} />
            <ResultCard label="Typical e-bike range" value={`${fmt(r.ebikeKm)} km`} sub={`about ${fmt(r.ebikeKm / KM_PER_MILE)} miles, normal assist`} />
            <ResultCard label="Flying with it" value={AIRLINE[r.airline]} sub="see the airline battery checker" />
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
