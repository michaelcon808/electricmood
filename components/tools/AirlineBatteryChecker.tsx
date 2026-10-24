'use client';

import { useState } from 'react';
import { AIRLINE_LIMITS, checkAirlineBattery } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

const VERDICT = {
  'carry-on': { title: 'Under 100 Wh', text: 'Allowed in carry-on without airline approval. Spare batteries must go in carry-on, never checked bags.' },
  approval: { title: '100–160 Wh: airline approval needed', text: `Carry-on only, with the airline’s approval, and no more than ${AIRLINE_LIMITS.maxSparesWithApproval} spare batteries per person.` },
  forbidden: { title: 'Over 160 Wh: not allowed', text: 'Batteries above 160 Wh are forbidden on passenger aircraft, in carry-on and checked bags.' },
} as const;

export default function AirlineBatteryChecker() {
  const [mode, setMode] = useState<'vah' | 'wh'>('vah');
  const [voltage, setVoltage] = useState(36);
  const [amphours, setAmphours] = useState(4.4);
  const [whInput, setWhInput] = useState(158);
  const [batteries, setBatteries] = useState(1);
  const wh = mode === 'vah' ? voltage * amphours : whInput;
  const valid = mode === 'vah' ? allPositive(voltage, amphours, batteries) : allPositive(whInput, batteries);
  const r = valid ? checkAirlineBattery({ wh, batteries }) : null;
  const tone = r ? { 'carry-on': 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', approval: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20', forbidden: 'border-red-500 bg-red-50 dark:bg-red-900/20' }[r.verdict] : '';

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="mode" label="I know my battery's" value={mode} onChange={setMode} options={[{ value: 'vah', label: 'Volts and amp-hours' }, { value: 'wh', label: 'Watt-hours (Wh)' }]} />
        {mode === 'vah' ? (
          <>
            <NumberField id="v" label="Voltage" value={voltage} onChange={setVoltage} min={1} step={0.1} unit="V" hint="On the battery label, e.g. 36V" />
            <NumberField id="ah" label="Capacity" value={amphours} onChange={setAmphours} min={0.1} step={0.1} unit="Ah" hint="e.g. 4.4Ah (or mAh ÷ 1000)" />
          </>
        ) : (
          <NumberField id="wh" label="Energy" value={whInput} onChange={setWhInput} min={1} unit="Wh" hint="Often printed on the label" />
        )}
        <NumberField id="n" label="Number of batteries" value={batteries} onChange={setBatteries} min={1} max={10} />
      </div>

      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Battery energy" value={`${fmt(r.wh, 1)} Wh`} sub={batteries > 1 ? `${fmt(r.totalWh, 1)} Wh across ${batteries} batteries` : 'per battery'} />
            <div className={`rounded-xl border-l-4 p-4 shadow-sm sm:col-span-2 ${tone}`}>
              <p className="text-lg font-extrabold">{VERDICT[r.verdict].title}</p>
              <p className="mt-1 text-sm">{VERDICT[r.verdict].text}</p>
              {r.tooManySpares && <p className="mt-2 text-sm font-semibold">You have {batteries} batteries in this band; the usual limit is {AIRLINE_LIMITS.maxSparesWithApproval} per person.</p>}
              {r.verdict === 'forbidden' && <p className="mt-2 text-sm">That is {fmt(r.overBy, 1)} Wh over the 160 Wh limit.</p>}
              <p className="mt-2 text-sm">Many airlines ban e-skateboards, e-scooters, hoverboards and e-bikes outright, whatever the battery size. Check your airline before you pack.</p>
            </div>
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
