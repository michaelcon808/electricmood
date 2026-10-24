'use client';

import { useState } from 'react';
import { estimateCommuteSavings, KM_PER_MILE, type UnitSystem } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function CommuteSavingsCalculator() {
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [oneWay, setOneWay] = useState(5);
  const [days, setDays] = useState(5);
  const [mode, setMode] = useState<'car' | 'transit'>('car');
  const [carCost, setCarCost] = useState(0.67);
  const [fare, setFare] = useState(2.9);
  const [ride, setRide] = useState<'ebike' | 'escooter'>('ebike');
  const [price, setPrice] = useState(1500);
  const [life, setLife] = useState(5);
  const [elec, setElec] = useState(0.17);
  const [maint, setMaint] = useState(120);
  const km = units === 'imperial' ? oneWay * KM_PER_MILE : oneWay;
  const costPerKm = units === 'imperial' ? carCost / KM_PER_MILE : carCost;
  const whPerKm = ride === 'ebike' ? 9 : 13;
  const valid = allPositive(oneWay, days, life) && price >= 0 && elec >= 0 && maint >= 0 && (mode === 'car' ? carCost >= 0 : fare >= 0);
  const r = valid
    ? estimateCommuteSavings({ oneWayKm: km, daysPerWeek: Math.min(7, days), currentCostPerKm: costPerKm, transitFarePerTrip: fare, useTransit: mode === 'transit', ridePrice: price, rideLifeYears: life, whPerKm, pricePerKwh: elec, maintenancePerYear: maint, carGPerKm: 170, gridGPerKwh: 400 })
    : null;
  const money = (n: number) => `${n < 0 ? '−' : ''}$${fmt(Math.abs(n))}`;
  const d = units === 'imperial' ? 'mi' : 'km';

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField id="units" label="Units" value={units} onChange={setUnits} options={[{ value: 'imperial', label: 'Miles' }, { value: 'metric', label: 'Kilometres' }]} />
        <NumberField id="oneway" label="One-way commute" value={oneWay} onChange={setOneWay} min={0.5} step={0.5} unit={d} />
        <NumberField id="days" label="Days per week" value={days} onChange={setDays} min={1} max={7} />
        <SelectField id="mode" label="You travel now by" value={mode} onChange={setMode} options={[{ value: 'car', label: 'Car' }, { value: 'transit', label: 'Bus / train' }]} />
        {mode === 'car' ? (
          <NumberField id="car" label="Car cost" value={carCost} onChange={setCarCost} min={0} step={0.01} unit={`$ per ${d}`} hint={units === 'imperial' ? 'Full cost incl. depreciation ≈ $0.67/mi; fuel only ≈ $0.15/mi' : 'Full cost ≈ $0.42/km; fuel only ≈ $0.09/km'} />
        ) : (
          <NumberField id="fare" label="Fare per trip" value={fare} onChange={setFare} min={0} step={0.1} unit="$" />
        )}
        <SelectField id="ride" label="Switch to" value={ride} onChange={setRide} options={[{ value: 'ebike', label: 'E-bike' }, { value: 'escooter', label: 'E-scooter' }]} />
        <NumberField id="price" label="Purchase price" value={price} onChange={setPrice} min={0} step={50} unit="$" />
        <NumberField id="life" label="Years you’ll keep it" value={life} onChange={setLife} min={1} max={15} />
        <NumberField id="elec" label="Electricity price" value={elec} onChange={setElec} min={0} step={0.01} unit="$ per kWh" />
        <NumberField id="maint" label="Maintenance per year" value={maint} onChange={setMaint} min={0} step={10} unit="$" hint="Tyres, brake pads, a yearly service" />
      </div>
      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Saved per year" value={money(r.savingsYear)} sub={`${money(r.currentYear)} now vs ${money(r.rideYear)} on the ${ride === 'ebike' ? 'e-bike' : 'e-scooter'}`} />
            <ResultCard label="Pays for itself in" value={Number.isFinite(r.paybackMonths) ? `${fmt(r.paybackMonths)} months` : 'doesn’t pay back'} sub="purchase price ÷ monthly running saving" />
            <ResultCard label="Electricity per year" value={money(r.energyYear)} sub={`${fmt(units === 'imperial' ? r.yearlyKm / KM_PER_MILE : r.yearlyKm)} ${d} a year`} />
            <ResultCard label="CO₂ avoided per year" value={mode === 'car' ? `${fmt(r.co2SavedKg)} kg` : 'n/a'} sub={mode === 'car' ? 'vs an average petrol car' : 'not estimated for transit'} />
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
