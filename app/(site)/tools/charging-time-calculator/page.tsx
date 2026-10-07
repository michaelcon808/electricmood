import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import ChargingCalculator from '@/components/tools/ChargingCalculator';

const SLUG = 'charging-time-calculator';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  return (
    <ToolPage slug={SLUG}>
      <ChargingCalculator />
    </ToolPage>
  );
}
