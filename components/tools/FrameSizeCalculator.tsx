'use client';

import { useState } from 'react';
import { CM_PER_INCH, estimateFrameSize, type FrameStyle, type UnitSystem } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function FrameSizeCalculator() {
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(9);
  const [cm, setCm] = useState(175);
  const [inseam, setInseam] = useState(31);
  const [style, setStyle] = useState<FrameStyle>('city');
  const heightCm = units === 'imperial' ? (feet * 12 + inches) * CM_PER_INCH : cm;
  const inseamCm = inseam > 0 ? (units === 'imperial' ? inseam * CM_PER_INCH : inseam) : undefined;
  const r = allPositive(heightCm) && heightCm > 120 ? estimateFrameSize({ heightCm, inseamCm, style }) : null;

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="units" label="Units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'Feet and inches' }, { value: 'metric', label: 'Centimetres' }]} />
        {units === 'imperial' ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="ft" label="Height" value={feet} onChange={setFeet} min={4} max={7} unit="ft" />
            <NumberField id="in" label="&nbsp;" value={inches} onChange={setInches} min={0} max={11} unit="in" />
          </div>
        ) : (
          <NumberField id="cm" label="Height" value={cm} onChange={setCm} min={120} max={220} unit="cm" />
        )}
        <NumberField id="inseam" label="Inseam (optional)" value={inseam} onChange={setInseam} min={0} step={0.5} unit={units === 'imperial' ? 'in' : 'cm'} hint="Floor to crotch, barefoot, against a wall" />
        <SelectField id="style" label="Type of e-bike" value={style} onChange={setStyle} options={[{ value: 'city', label: 'City / hybrid / commuter' }, { value: 'step-through', label: 'Step-through' }, { value: 'mountain', label: 'Mountain' }, { value: 'road', label: 'Road / gravel' }]} />
      </div>
      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Frame size" value={r.size} sub={r.nearEdge ? 'between two sizes: test-ride both if you can' : 'on most brands’ charts'} />
            {r.seatTubeCm && <ResultCard label="Seat tube length" value={`${fmt(r.seatTubeCm)} cm`} sub={`about ${fmt(r.seatTubeIn ?? 0, 1)} in (brands measure differently)`} />}
            {r.saddleCm && <ResultCard label="Starting saddle height" value={`${fmt(r.saddleCm)} cm`} sub={`${fmt(r.saddleCm / CM_PER_INCH, 1)} in, centre of crank to top of saddle`} />}
            <p className="rounded-xl bg-white p-4 text-sm shadow-sm sm:col-span-2 dark:bg-neutral-900">
              Each brand’s own size chart wins. Step-through frames are more forgiving if you are between sizes, and you should be able to stand over the bike with both feet flat.
            </p>
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
