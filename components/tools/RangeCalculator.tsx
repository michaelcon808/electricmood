'use client';

import { useState } from 'react';
import { estimateRange, KM_PER_MILE, type Assist, type Terrain, type Vehicle } from '@/lib/calculators';
import { allPositive, fmt, NumberField, ResultCard, ResultsPanel, SelectField } from './fields';

export default function RangeCalculator() {
  const [vehicle, setVehicle] = useState<Vehicle>('ebike');
  const [voltage, setVoltage] = useState(48);
  const [amphours, setAmphours] = useState(14);
  const [riderKg, setRiderKg] = useState(80);
  const [speedKmh, setSpeedKmh] = useState(22);
  const [terrain, setTerrain] = useState<Terrain>('flat');
  const [assist, setAssist] = useState<Assist>('normal');
  const [temperatureC, setTemperatureC] = useState(18);
  const [units, setUnits] = useState<'km' | 'mi'>('km');

  const valid = allPositive(voltage, amphours, riderKg, speedKmh) && Number.isFinite(temperatureC);
  const r = valid ? estimateRange({ vehicle, voltage, amphours, riderKg, speedKmh, terrain, assist, temperatureC }) : null;
  const dist = (km: number) => (units === 'km' ? km : km / KM_PER_MILE);

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          id="vehicle"
          label="Vehicle"
          value={vehicle}
          onChange={setVehicle}
          options={[
            { value: 'ebike', label: 'E-bike' },
            { value: 'escooter', label: 'E-scooter' },
          ]}
        />
        <NumberField id="voltage" label="Battery voltage" value={voltage} onChange={setVoltage} min={12} max={100} unit="V" />
        <NumberField id="amphours" label="Battery capacity" value={amphours} onChange={setAmphours} min={1} max={60} step={0.1} unit="Ah" hint={valid ? `= ${fmt(voltage * amphours)} Wh` : undefined} />
        <NumberField id="rider" label="Rider + cargo weight" value={riderKg} onChange={setRiderKg} min={30} max={200} unit="kg" />
        <NumberField id="speed" label="Average speed" value={speedKmh} onChange={setSpeedKmh} min={5} max={60} unit="km/h" />
        <SelectField
          id="terrain"
          label="Terrain"
          value={terrain}
          onChange={setTerrain}
          options={[
            { value: 'flat', label: 'Flat' },
            { value: 'rolling', label: 'Rolling hills' },
            { value: 'hilly', label: 'Hilly' },
          ]}
        />
        {vehicle === 'ebike' && (
          <SelectField
            id="assist"
            label="Assist level"
            value={assist}
            onChange={setAssist}
            options={[
              { value: 'eco', label: 'Eco (you pedal hard)' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High / turbo' },
            ]}
          />
        )}
        <NumberField id="temp" label="Air temperature" value={temperatureC} onChange={setTemperatureC} min={-20} max={45} unit="°C" />
        <SelectField
          id="units"
          label="Show results in"
          value={units}
          onChange={setUnits}
          options={[
            { value: 'km', label: 'Kilometres' },
            { value: 'mi', label: 'Miles' },
          ]}
        />
      </div>

      <ResultsPanel valid={!!r}>
        {r && (
          <>
            <ResultCard label="Estimated range" value={`${fmt(dist(r.km))} ${units}`} sub={`Likely ${fmt(dist(r.lowKm))}–${fmt(dist(r.highKm))} ${units}`} />
            <ResultCard label="Energy use" value={`${fmt(units === 'km' ? r.whPerKm : r.whPerKm * KM_PER_MILE, 1)} Wh/${units}`} />
            <ResultCard label="Battery energy" value={`${fmt(r.wh)} Wh`} sub={`${fmt(r.usableWh)} Wh usable at ${temperatureC} °C`} />
            <ResultCard label="Cold-weather factor" value={`${fmt(r.temperatureFactor * 100)}%`} sub="of usable capacity" />
          </>
        )}
      </ResultsPanel>
    </div>
  );
}
