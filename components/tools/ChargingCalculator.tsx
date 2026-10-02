'use client';

import { useState } from 'react';
import { estimateCharging } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel } from './fields';

function duration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 60 ? `${h + 1} h 0 min` : `${h} h ${m} min`;
}

export default function ChargingCalculator() {
  const [voltage, setVoltage] = useState(48);
  const [amphours, setAmphours] = useState(14);
  const [chargerAmps, setChargerAmps] = useState(2);
  const [startPct, setStartPct] = useState(20);
  const [targetPct, setTargetPct] = useState(100);
  const [efficiencyPct, setEfficiencyPct] = useState(85);
  const [price, setPrice] = useState(0.3);
  const [currency, setCurrency] = useState('$');
  const [whPerKm, setWhPerKm] = useState(12);

  const valid =
    allPositive(voltage, amphours, chargerAmps, efficiencyPct) &&
    Number.isFinite(price) &&
    price >= 0 &&
    startPct >= 0 &&
    targetPct > startPct &&
    targetPct <= 100;
  const r = valid
    ? estimateCharging({ voltage, amphours, chargerAmps, startPct, targetPct, efficiency: efficiencyPct / 100, pricePerKwh: price, whPerKm: whPerKm > 0 ? whPerKm : undefined })
    : null;
  const money = (n: number) => `${currency}${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField id="voltage" label="Battery voltage" value={voltage} onChange={setVoltage} min={12} max={100} unit="V" />
        <NumberField id="amphours" label="Battery capacity" value={amphours} onChange={setAmphours} min={1} step={0.1} unit="Ah" />
        <NumberField id="charger" label="Charger output" value={chargerAmps} onChange={setChargerAmps} min={0.5} max={20} step={0.1} unit="A" hint="Printed on the charger, e.g. 2A or 4A" />
        <NumberField id="start" label="Start charge" value={startPct} onChange={setStartPct} min={0} max={99} unit="%" />
        <NumberField id="target" label="Charge to" value={targetPct} onChange={setTargetPct} min={1} max={100} unit="%" />
        <NumberField id="eff" label="Charging efficiency" value={efficiencyPct} onChange={setEfficiencyPct} min={50} max={100} unit="%" />
        <NumberField id="price" label="Electricity price" value={price} onChange={setPrice} min={0} step={0.01} unit="per kWh" />
        <div>
          <label htmlFor="currency" className="label">
            Currency symbol
          </label>
          <input id="currency" className="input" maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
        <NumberField id="whkm" label="Your consumption (optional)" value={whPerKm} onChange={setWhPerKm} min={0} step={0.5} unit="Wh/km" hint="For cost per 100 km. See the range calculator." />
      </div>

      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Charging time" value={duration(r.hours)} sub={`${startPct}% → ${targetPct}% with a ${fmt(r.chargerW)} W charger`} />
            <ResultCard label="Cost of this charge" value={money(r.cost)} sub={`${fmt(r.wallKwh, 3)} kWh from the wall`} />
            <ResultCard label="Cost of a full charge" value={money(r.fullChargeCost)} sub={`${fmt(r.wh)} Wh battery`} />
            {r.costPer100Km !== null && <ResultCard label="Cost per 100 km" value={money(r.costPer100Km)} sub={`at ${whPerKm} Wh/km`} />}
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
