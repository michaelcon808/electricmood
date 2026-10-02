import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import PowerStationCalculator from '@/components/tools/PowerStationCalculator';

const SLUG = 'power-station-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <PowerStationCalculator />
    </ToolPage>
  );
}
