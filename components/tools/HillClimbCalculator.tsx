'use client';

import { useState } from 'react';
import { estimateHillClimb, KG_PER_LB, KM_PER_MILE, type UnitSystem, type Vehicle } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function HillClimbCalculator() {
  const [vehicle, setVehicle] = useState<Vehicle>('escooter');
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [motorW, setMotorW] = useState(500);
  const [peakW, setPeakW] = useState(900);
  const [pedalW, setPedalW] = useState(100);
  const [weight, setWeight] = useState(220);
  const [grade, setGrade] = useState(10);
  const [speed, setSpeed] = useState(10);
  const totalKg = units === 'imperial' ? weight * KG_PER_LB : weight;
  const speedKmh = units === 'imperial' ? speed * KM_PER_MILE : speed;
  const r = allPositive(motorW, weight, speed) && grade >= 0 ? estimateHillClimb({ vehicle, motorW, peakW, pedalW, totalKg, gradePct: grade, speedKmh }) : null;
  const sp = (kmh: number) => (units === 'imperial' ? `${fmt(kmh / KM_PER_MILE, 1)} mph` : `${fmt(kmh, 1)} km/h`);
  const verdict = r && { easy: ['Climbs it on continuous power', 'The motor can hold that speed up this slope without overworking.'], 'peak-only': ['Only on peak power', 'It needs peak (burst) power: fine for a short hill, but the motor and battery will heat up on a long one.'], 'too-steep': ['Too steep at that speed', 'Not enough power to hold that speed. Slow down, pedal harder (e-bike) or pick a stronger motor.'] }[r.verdict];

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="veh" label="Vehicle" value={vehicle} onChange={setVehicle} options={[{ value: 'escooter', label: 'E-scooter' }, { value: 'ebike', label: 'E-bike' }]} />
        <SelectField id="units" label="Units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'lb and mph' }, { value: 'metric', label: 'kg and km/h' }]} />
        <NumberField id="motor" label="Motor rated power" value={motorW} onChange={setMotorW} min={100} step={50} unit="W" hint="The continuous (nominal) rating" />
        <NumberField id="peak" label="Motor peak power" value={peakW} onChange={setPeakW} min={0} step={50} unit="W" hint="Leave equal to rated if unknown" />
        {vehicle === 'ebike' && <NumberField id="pedal" label="Your pedalling" value={pedalW} onChange={setPedalW} min={0} max={400} step={10} unit="W" hint="~50 easy, ~100 steady, ~200 hard" />}
        <NumberField id="weight" label="Rider + vehicle + load" value={weight} onChange={setWeight} min={1} unit={units === 'imperial' ? 'lb' : 'kg'} />
        <NumberField id="grade" label="Hill gradient" value={grade} onChange={setGrade} min={0} max={40} step={0.5} unit="%" hint="5% gentle, 10% steep, 15%+ very steep" />
        <NumberField id="speed" label="Speed you want to hold" value={speed} onChange={setSpeed} min={1} step={0.5} unit={units === 'imperial' ? 'mph' : 'km/h'} />
      </div>
      <ResultsPanel valid={!!r}>
        {r && verdict && (
          <>
            <ResultCard label="Power needed at the wheel" value={`${fmt(r.neededW)} W`} sub={`you have ${fmt(r.continuousAtWheel)} W continuous, ${fmt(r.peakAtWheel)} W peak`} />
            <ResultCard label="Top speed up this hill" value={sp(r.maxSpeedContinuous)} sub={`up to ${sp(r.maxSpeedPeak)} on peak power`} />
            <div className={`rounded-xl border-l-4 p-4 text-sm shadow-sm sm:col-span-2 ${r.verdict === 'easy' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : r.verdict === 'peak-only' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <p className="font-bold">{verdict[0]}</p>
              <p className="mt-1">{verdict[1]}</p>
            </div>
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
